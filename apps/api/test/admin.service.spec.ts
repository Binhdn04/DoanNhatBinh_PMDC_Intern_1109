import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { AdminService } from "../src/modules/admin.service";
import {
  AuditEvent,
  AuthSession,
  Company,
  CompanyStaff,
  SupervisorProfile,
  User,
  UserRole,
} from "../src/infrastructure/database/entities";

const user = (overrides: object = {}) => ({
  id: "user-1",
  email: "user@example.test",
  fullName: "Test User",
  isActive: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  ...overrides,
});

const setup = (
  options: {
    current?: object | null;
    roles?: object[];
    activeAdmins?: number;
    activeMembership?: boolean;
    supervisorProfile?: boolean;
    staffRole?: boolean;
    companyExists?: boolean;
    existingMemberships?: object[];
  } = {},
) => {
  const repositories = new Map<any, any>();
  const users = { findAndCount: jest.fn(), findOneBy: jest.fn() };
  const roles = { findBy: jest.fn().mockResolvedValue([]) };
  const memberships = { findBy: jest.fn().mockResolvedValue([]) };
  const manager = {
    query: jest.fn(),
    getRepository: jest.fn((entity: unknown) => repositories.get(entity)),
  };
  const transaction = jest.fn(async (work: (value: any) => unknown) =>
    work(manager),
  );
  const db = { transaction };
  const transactionUsers = {
    findOne: jest
      .fn()
      .mockResolvedValue(
        options.current === undefined ? user() : options.current,
      ),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(options.activeAdmins ?? 2),
    })),
  };
  const transactionRoles = {
    findBy: jest.fn().mockResolvedValue(options.roles ?? [{ role: "ADMIN" }]),
    exist: jest.fn().mockResolvedValue(options.staffRole ?? true),
    delete: jest.fn(),
    save: jest.fn(),
  };
  const transactionMemberships = {
    exist: jest.fn().mockResolvedValue(options.activeMembership ?? false),
    upsert: jest.fn(),
    findBy: jest.fn().mockResolvedValue(options.existingMemberships ?? []),
    update: jest.fn(),
  };
  repositories.set(User, transactionUsers);
  repositories.set(UserRole, transactionRoles);
  repositories.set(CompanyStaff, transactionMemberships);
  repositories.set(SupervisorProfile, {
    exist: jest.fn().mockResolvedValue(options.supervisorProfile ?? true),
  });
  repositories.set(Company, {
    exist: jest.fn().mockResolvedValue(options.companyExists ?? true),
  });
  repositories.set(AuthSession, { update: jest.fn() });
  repositories.set(AuditEvent, { save: jest.fn() });
  return {
    service: new AdminService(
      db as any,
      users as any,
      roles as any,
      memberships as any,
    ),
    users,
    roles,
    memberships,
    transactionUsers,
    transactionRoles,
    transactionMemberships,
    repositories,
  };
};

const principal = {
  id: "admin-1",
  role: "ADMIN",
  sid: "session-1",
  version: 1,
} as any;
const expectedUpdatedAt = "2026-01-02T00:00:00.000Z";

describe("AdminService", () => {
  it("lists users with and without a trimmed search, and returns complete views", async () => {
    const test = setup();
    const row = user({ phone: "123" });
    test.users.findAndCount.mockResolvedValue([[row], 1]);
    test.roles.findBy.mockResolvedValue([{ role: "ADMIN" }]);
    test.memberships.findBy.mockResolvedValue([
      { companyId: "company-1", title: "Owner", active: true },
    ]);

    await expect(
      test.service.list({ page: 1, pageSize: 20 } as any),
    ).resolves.toMatchObject({
      total: 1,
      items: [
        {
          id: row.id,
          roles: ["ADMIN"],
          memberships: [{ companyId: "company-1" }],
        },
      ],
    });
    expect(test.users.findAndCount.mock.calls[0][0].where).toBeUndefined();
    await test.service.list({
      page: 2,
      pageSize: 10,
      search: "  user  ",
    } as any);
    expect(test.users.findAndCount.mock.calls[1][0]).toMatchObject({
      skip: 10,
      take: 10,
    });
    expect(test.users.findAndCount.mock.calls[1][0].where).toHaveLength(2);
  });

  it("rejects missing users and stale admin writes", async () => {
    const missing = setup({ current: null });
    await expect(missing.service.get("missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      missing.service.updateAccount(principal, "missing", {
        expectedUpdatedAt,
        isActive: true,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    const stale = setup();
    await expect(
      stale.service.updateAccount(principal, "user-1", {
        expectedUpdatedAt: "2026-01-01T00:00:00.000Z",
        isActive: true,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("protects the last active admin and revokes sessions when another admin is disabled", async () => {
    const last = setup({ activeAdmins: 1 });
    await expect(
      last.service.updateAccount(principal, "user-1", {
        expectedUpdatedAt,
        isActive: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    const test = setup();
    test.users.findOneBy.mockResolvedValue(user({ isActive: false }));
    await test.service.updateAccount(principal, "user-1", {
      expectedUpdatedAt,
      isActive: false,
    });
    expect(test.transactionUsers.update).toHaveBeenCalledWith("user-1", {
      isActive: false,
    });
    expect(test.repositories.get(AuthSession).update).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1" }),
      expect.objectContaining({ revokedAt: expect.any(Date) }),
    );
    expect(test.repositories.get(AuditEvent).save).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "USER_ACCOUNT_UPDATED",
        actorUserId: "admin-1",
      }),
    );
  });

  it("enforces role prerequisites and persists a valid role change", async () => {
    const last = setup({ activeAdmins: 1 });
    await expect(
      last.service.updateRoles(principal, "user-1", {
        expectedUpdatedAt,
        roles: ["STUDENT"],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    const staff = setup({
      roles: [{ role: "COMPANY_STAFF" }],
      activeMembership: true,
    });
    await expect(
      staff.service.updateRoles(principal, "user-1", {
        expectedUpdatedAt,
        roles: ["STUDENT"],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    const supervisor = setup({ supervisorProfile: false });
    await expect(
      supervisor.service.updateRoles(principal, "user-1", {
        expectedUpdatedAt,
        roles: ["SUPERVISOR"],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    const valid = setup({ roles: [{ role: "STUDENT" }] });
    valid.users.findOneBy.mockResolvedValue(user());
    await valid.service.updateRoles(principal, "user-1", {
      expectedUpdatedAt,
      roles: ["SUPERVISOR"],
    } as any);
    expect(valid.transactionRoles.delete).toHaveBeenCalledWith({
      userId: "user-1",
    });
    expect(valid.transactionRoles.save).toHaveBeenCalledWith([
      { userId: "user-1", role: "SUPERVISOR" },
    ]);
    expect(valid.repositories.get(AuthSession).update).toHaveBeenCalled();
    expect(valid.repositories.get(AuditEvent).save).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "USER_ROLES_UPDATED" }),
    );
  });

  it("validates memberships and deactivates omitted active memberships", async () => {
    const duplicate = setup();
    await expect(
      duplicate.service.updateMemberships(principal, "user-1", {
        expectedUpdatedAt,
        memberships: [
          { companyId: "company-1", active: true },
          { companyId: "company-1", active: false },
        ],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    const missingRole = setup({ staffRole: false });
    await expect(
      missingRole.service.updateMemberships(principal, "user-1", {
        expectedUpdatedAt,
        memberships: [{ companyId: "company-1", active: true }],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    const missingCompany = setup({ companyExists: false });
    await expect(
      missingCompany.service.updateMemberships(principal, "user-1", {
        expectedUpdatedAt,
        memberships: [{ companyId: "company-1", active: false }],
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);

    const test = setup({
      existingMemberships: [{ companyId: "old-company", active: true }],
    });
    test.users.findOneBy.mockResolvedValue(user());
    await test.service.updateMemberships(principal, "user-1", {
      expectedUpdatedAt,
      memberships: [
        { companyId: "company-1", title: "Recruiter", active: true },
      ],
    } as any);
    expect(test.transactionMemberships.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", companyId: "company-1" }),
      ["companyId", "userId"],
    );
    expect(test.transactionMemberships.update).toHaveBeenCalledWith(
      { companyId: "old-company", userId: "user-1" },
      { active: false },
    );
    expect(test.repositories.get(AuditEvent).save).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "USER_MEMBERSHIPS_UPDATED" }),
    );
  });
});
