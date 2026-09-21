import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, ILike, IsNull, Repository } from "typeorm";
import {
  AuditEvent,
  AuthSession,
  Company,
  CompanyStaff,
  SupervisorProfile,
  User,
  UserRole,
} from "../infrastructure/database/entities";
import { Principal } from "./auth";
import {
  AdminAccountDto,
  AdminMembershipsDto,
  AdminRolesDto,
  AdminUserQueryDto,
} from "./dto";

@Injectable()
export class AdminService {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UserRole) private readonly roles: Repository<UserRole>,
    @InjectRepository(CompanyStaff)
    private readonly memberships: Repository<CompanyStaff>,
  ) {}

  private async view(user: User) {
    const [roles, memberships] = await Promise.all([
      this.roles.findBy({ userId: user.id }),
      this.memberships.findBy({ userId: user.id }),
    ]);
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: roles.map((row) => row.role),
      memberships: memberships.map((row) => ({
        companyId: row.companyId,
        title: row.title,
        active: row.active,
      })),
    };
  }
  async list(query: AdminUserQueryDto) {
    const where = query.search
      ? [
          { email: ILike(`%${query.search.trim()}%`) },
          { fullName: ILike(`%${query.search.trim()}%`) },
        ]
      : undefined;
    const [users, total] = await this.users.findAndCount({
      where,
      order: { fullName: "ASC", id: "ASC" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    return {
      items: await Promise.all(users.map((user) => this.view(user))),
      total,
    };
  }
  async get(id: string) {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException("User not found");
    return this.view(user);
  }
  private assertVersion(user: User, expected: string) {
    if (user.updatedAt.toISOString() !== new Date(expected).toISOString())
      throw new ConflictException("User was updated by another administrator");
  }
  private async lockActiveAdmins(manager: EntityManager) {
    await manager.query("SELECT pg_advisory_xact_lock(719468314::bigint)");
  }
  private async activeAdminCount(manager: EntityManager) {
    return manager
      .getRepository(User)
      .createQueryBuilder("u")
      .innerJoin(UserRole, "r", "r.user_id=u.id AND r.role='ADMIN'")
      .where("u.is_active=true")
      .getCount();
  }
  private async audit(
    manager: EntityManager,
    actor: string,
    subjectId: string,
    eventType: string,
    payload: object,
  ) {
    await manager.getRepository(AuditEvent).save({
      subjectType: "USER",
      subjectId,
      actorUserId: actor,
      eventType,
      payload,
    });
  }
  async updateAccount(principal: Principal, id: string, body: AdminAccountDto) {
    await this.db.transaction(async (manager) => {
      await this.lockActiveAdmins(manager);
      const user = await manager.getRepository(User).findOne({
        where: { id },
        lock: { mode: "pessimistic_write" },
      });
      if (!user) throw new NotFoundException("User not found");
      this.assertVersion(user, body.expectedUpdatedAt);
      const roles = await manager
        .getRepository(UserRole)
        .findBy({ userId: id });
      if (
        !body.isActive &&
        user.isActive &&
        roles.some((row) => row.role === "ADMIN") &&
        (await this.activeAdminCount(manager)) <= 1
      )
        throw new BadRequestException(
          "The last active Admin cannot be disabled",
        );
      await manager.getRepository(User).update(id, { isActive: body.isActive });
      if (!body.isActive)
        await manager
          .getRepository(AuthSession)
          .update(
            { userId: id, revokedAt: IsNull() },
            { revokedAt: new Date() },
          );
      await this.audit(manager, principal.id, id, "USER_ACCOUNT_UPDATED", {
        isActive: body.isActive,
      });
    });
    return this.get(id);
  }
  async updateRoles(principal: Principal, id: string, body: AdminRolesDto) {
    await this.db.transaction(async (manager) => {
      await this.lockActiveAdmins(manager);
      const user = await manager.getRepository(User).findOne({
        where: { id },
        lock: { mode: "pessimistic_write" },
      });
      if (!user) throw new NotFoundException("User not found");
      this.assertVersion(user, body.expectedUpdatedAt);
      const current = await manager
        .getRepository(UserRole)
        .findBy({ userId: id });
      const currentRoles = current.map((row) => row.role);
      if (
        user.isActive &&
        currentRoles.includes("ADMIN") &&
        !body.roles.includes("ADMIN") &&
        (await this.activeAdminCount(manager)) <= 1
      )
        throw new BadRequestException(
          "The last active Admin role cannot be removed",
        );
      if (!body.roles.includes("COMPANY_STAFF")) {
        const active = await manager.getRepository(CompanyStaff).exist({
          where: { userId: id, active: true },
        });
        if (active)
          throw new BadRequestException(
            "Deactivate Company Staff memberships first",
          );
      }
      if (body.roles.includes("SUPERVISOR")) {
        const profile = await manager
          .getRepository(SupervisorProfile)
          .exist({ where: { userId: id } });
        if (!profile)
          throw new BadRequestException(
            "Supervisor role requires a Supervisor Profile",
          );
      }
      await manager.getRepository(UserRole).delete({ userId: id });
      await manager
        .getRepository(UserRole)
        .save(body.roles.map((role) => ({ userId: id, role })));
      await manager.getRepository(User).update(id, { updatedAt: new Date() });
      await manager
        .getRepository(AuthSession)
        .update({ userId: id, revokedAt: IsNull() }, { revokedAt: new Date() });
      await this.audit(manager, principal.id, id, "USER_ROLES_UPDATED", {
        from: currentRoles,
        to: body.roles,
      });
    });
    return this.get(id);
  }
  async updateMemberships(
    principal: Principal,
    id: string,
    body: AdminMembershipsDto,
  ) {
    if (
      new Set(body.memberships.map((row) => row.companyId)).size !==
      body.memberships.length
    )
      throw new BadRequestException("Each company may appear only once");
    await this.db.transaction(async (manager) => {
      const user = await manager.getRepository(User).findOne({
        where: { id },
        lock: { mode: "pessimistic_write" },
      });
      if (!user) throw new NotFoundException("User not found");
      this.assertVersion(user, body.expectedUpdatedAt);
      if (body.memberships.some((row) => row.active)) {
        const hasRole = await manager.getRepository(UserRole).exist({
          where: { userId: id, role: "COMPANY_STAFF" },
        });
        if (!hasRole)
          throw new BadRequestException("Company Staff role is required");
      }
      for (const membership of body.memberships) {
        if (
          !(await manager
            .getRepository(Company)
            .exist({ where: { id: membership.companyId } }))
        )
          throw new NotFoundException("Company not found");
        await manager
          .getRepository(CompanyStaff)
          .upsert({ ...membership, userId: id }, ["companyId", "userId"]);
      }
      const provided = body.memberships.map((row) => row.companyId);
      const existing = await manager
        .getRepository(CompanyStaff)
        .findBy({ userId: id });
      await Promise.all(
        existing
          .filter((row) => row.active && !provided.includes(row.companyId))
          .map((row) =>
            manager
              .getRepository(CompanyStaff)
              .update(
                { companyId: row.companyId, userId: id },
                { active: false },
              ),
          ),
      );
      await manager.getRepository(User).update(id, { updatedAt: new Date() });
      await this.audit(manager, principal.id, id, "USER_MEMBERSHIPS_UPDATED", {
        memberships: body.memberships.map(({ companyId, active }) => ({
          companyId,
          active,
        })),
      });
    });
    return this.get(id);
  }
}
