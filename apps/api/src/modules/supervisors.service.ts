import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, IsNull, Repository } from "typeorm";
import {
  Application,
  AuditEvent,
  Placement,
  Posting,
  SupervisorAssignment,
  SupervisorProfile,
  User,
  UserRole,
} from "../infrastructure/database/entities";
import { AccessService } from "./access.service";
import { Principal, assert } from "./auth";
import { AssignmentDto, SupervisorQueryDto } from "./dto";
const trim = (value?: string) => value?.trim() || undefined;
@Injectable()
export class SupervisorsService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Application)
    private applications: Repository<Application>,
    @InjectRepository(Posting) private postings: Repository<Posting>,
    @InjectRepository(SupervisorAssignment)
    private assignments: Repository<SupervisorAssignment>,
    private dataSource: DataSource,
    private access: AccessService,
  ) {}

  async supervisors(p: Principal, query: SupervisorQueryDto) {
    if (Boolean(query.applicationId) === Boolean(query.placementId))
      throw new BadRequestException(
        "Supply exactly one applicationId or placementId",
      );
    if (query.placementId) assert(p.role === "ADMIN");
    if (query.applicationId && p.role !== "ADMIN") {
      const app = await this.applications.findOneBy({
        id: query.applicationId,
      });
      if (!app) throw new NotFoundException();
      await this.companyAccess(
        p,
        (await this.postings.findOneBy({ id: app.postingId }))?.companyId,
      );
    }
    if (query.placementId) await this.access.placement(p, query.placementId);
    const qb = this.users
      .createQueryBuilder("u")
      .innerJoin(SupervisorProfile, "sp", "sp.user_id=u.id")
      .innerJoin(UserRole, "r", "r.user_id=u.id AND r.role='SUPERVISOR'");
    if (query.search)
      qb.where("u.full_name ILIKE :search", { search: `%${query.search}%` });
    const total = await qb.getCount();
    const items = await qb
      .select([
        "u.id AS id",
        'u.full_name AS "fullName"',
        "sp.department AS department",
      ])
      .orderBy("u.full_name", "ASC")
      .addOrderBy("u.id", "ASC")
      .offset((query.page - 1) * query.pageSize)
      .limit(query.pageSize)
      .getRawMany();
    return { items, page: query.page, pageSize: query.pageSize, total };
  }

  async assignmentHistory(id: string) {
    const assignments = await this.assignments.find({
      where: { placementId: id },
      order: { assignedAt: "ASC" },
    });
    const supervisorIds = [
      ...new Set(assignments.map((assignment) => assignment.supervisorUserId)),
    ];
    if (!supervisorIds.length) return [];
    const supervisors = await this.users
      .createQueryBuilder("u")
      .innerJoin(SupervisorProfile, "sp", "sp.user_id=u.id")
      .where("u.id IN (:...supervisorIds)", { supervisorIds })
      .select([
        "u.id AS id",
        'u.full_name AS "fullName"',
        "sp.department AS department",
      ])
      .getRawMany<{ id: string; fullName: string; department?: string }>();
    const byId = new Map(
      supervisors.map((supervisor) => [supervisor.id, supervisor]),
    );
    return assignments.map((assignment) => ({
      ...assignment,
      supervisor: byId.get(assignment.supervisorUserId),
    }));
  }

  async changeAssignment(p: Principal, id: string, body: AssignmentDto) {
    return this.dataSource.transaction(async (manager) => {
      const placement = await manager
        .getRepository(Placement)
        .createQueryBuilder("p")
        .setLock("pessimistic_write")
        .where("p.id = :id", { id })
        .getOne();
      if (!placement) throw new NotFoundException();
      if (placement.status !== "ACTIVE" || !trim(body.reason))
        throw new ConflictException("Active placement and reason required");
      const assignments = manager.getRepository(SupervisorAssignment);
      const active = await assignments.findOneBy({
        placementId: id,
        revokedAt: IsNull(),
      });
      if ((active?.id ?? null) !== (body.expectedAssignmentId ?? null))
        throw new ConflictException("ASSIGNMENT_CONFLICT");
      if (active?.supervisorUserId === body.supervisorUserId) return placement;
      if (
        body.supervisorUserId &&
        (!(await manager.getRepository(UserRole).exist({
          where: { userId: body.supervisorUserId, role: "SUPERVISOR" },
        })) ||
          !(await manager
            .getRepository(SupervisorProfile)
            .exist({ where: { userId: body.supervisorUserId } })))
      )
        throw new BadRequestException("Supervisor is not eligible");
      if (active)
        await assignments.update(active.id, {
          revokedAt: new Date(),
          revokedByUserId: p.id,
          revocationReason: trim(body.reason),
        });
      if (body.supervisorUserId)
        await assignments.save({
          placementId: id,
          supervisorUserId: body.supervisorUserId,
          assignedByUserId: p.id,
          reason: trim(body.reason),
        });
      await manager.getRepository(AuditEvent).save({
        subjectType: "PLACEMENT",
        subjectId: id,
        eventType: "SUPERVISOR_ASSIGNMENT_CHANGED",
        actorUserId: p.id,
        payload: {},
      });
      return placement;
    });
  }
  private async companyAccess(p: Principal, companyId?: string) {
    if (!companyId) throw new ForbiddenException();
    return this.access.company(p, companyId);
  }
}
