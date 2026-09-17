import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AuthController, CoreController } from '../src/modules/controllers';

const repo = () => ({ find: jest.fn(), findBy: jest.fn(), findOneBy: jest.fn(), save: jest.fn(), create: jest.fn(), upsert: jest.fn(), exist: jest.fn() });

function createController() {
  const repos = Array.from({ length: 19 }, repo);
  const health = { snapshot: jest.fn(() => ({ fresh: true })) };
  const db = { transaction: jest.fn() };
  const jwt = { signAsync: jest.fn() };
  return { controller: new CoreController(repos[0] as any, repos[1] as any, repos[2] as any, repos[3] as any, repos[4] as any, repos[5] as any, repos[6] as any, repos[7] as any, repos[8] as any, repos[9] as any, repos[10] as any, repos[11] as any, repos[12] as any, repos[13] as any, repos[14] as any, repos[15] as any, repos[16] as any, repos[17] as any, repos[18] as any, db as any, jwt as any, health as any), repos, health };
}

describe('core controller unit behaviour', () => {
  const student = { id: 'student-1', sid: 'session-1', role: 'STUDENT' as const, version: 1, roles: ['STUDENT' as const] };

  it('exposes health and principal DTOs without persistence', () => {
    const { controller, health } = createController();
    expect(controller.healthcheck()).toEqual({ status: 'ok', scheduler: { fresh: true } });
    expect(health.snapshot).toHaveBeenCalledTimes(1);
    expect(controller.me(student)).toEqual({ id: 'student-1', roles: ['STUDENT'], activeRole: 'STUDENT' });
  });

  it('lists companies and distinguishes missing company records', async () => {
    const { controller, repos } = createController();
    repos[5].find.mockResolvedValue([{ id: 'company-1' }]);
    repos[5].findOneBy.mockResolvedValueOnce({ id: 'company-1' }).mockResolvedValueOnce(null);
    await expect(controller.listCompanies()).resolves.toEqual([{ id: 'company-1' }]);
    await expect(controller.company('company-1')).resolves.toEqual({ id: 'company-1' });
    await expect(controller.company('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates default preferences and persists profile updates for the current student', async () => {
    const { controller, repos } = createController();
    repos[1].findOneBy.mockResolvedValue({ studentId: student.id });
    repos[1].save.mockImplementation(async (value: unknown) => value);
    await expect(controller.updateProfile(student, { university: 'InternHub' })).resolves.toMatchObject({ studentId: student.id, university: 'InternHub', userId: student.id });
    repos[2].findOneBy.mockResolvedValue(null); repos[2].save.mockImplementation(async (value: unknown) => value);
    await expect(controller.getPreferences(student)).resolves.toMatchObject({ studentId: student.id, industries: [] });
  });

  it('rotates the active role only when it changes and signs the refreshed token', async () => {
    const { controller } = createController(); const session = { activeRole: 'STUDENT', version: 2 };
    const qb = { setLock: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOneOrFail: jest.fn().mockResolvedValue(session) };
    const manager = { getRepository: jest.fn(() => ({ createQueryBuilder: jest.fn(() => qb) })), save: jest.fn() };
    (controller as any).db.transaction = jest.fn(async (fn: any) => fn(manager)); (controller as any).jwt.signAsync = jest.fn().mockResolvedValue('next');
    await expect(controller.setRole({ ...student, roles: ['STUDENT', 'ADMIN'] }, { role: 'ADMIN' })).resolves.toEqual({ activeRole: 'ADMIN', accessToken: 'next' });
    expect(manager.save).toHaveBeenCalledWith(expect.objectContaining({ version: 3 }));
    await expect(controller.setRole(student, { role: 'ADMIN' })).rejects.toBeDefined();
  });

  it('validates duplicate skills and returns resolved skills in input order', async () => {
    const { controller } = createController();
    const skillRepo = { findOneBy: jest.fn().mockResolvedValue({ id: 's1', name: 'TypeScript' }) };
    const profileRepo = { findOneBy: jest.fn().mockResolvedValue({ userId: student.id }) };
    const links = { delete: jest.fn(), save: jest.fn() };
    const manager = { getRepository: jest.fn((entity: any) => entity.name === 'Skill' ? skillRepo : entity.name === 'StudentProfile' ? profileRepo : links) };
    (controller as any).db.transaction = jest.fn(async (fn: any) => fn(manager));
    await expect(controller.setSkills(student, { skills: [{ id: 's1' }, { id: 's1' }] })).rejects.toBeInstanceOf(BadRequestException);
    skillRepo.findOneBy.mockResolvedValueOnce({ id: 's1', name: 'TypeScript' }).mockResolvedValueOnce({ id: 's2', name: 'React' });
    await expect(controller.setSkills(student, { skills: [{ id: 's1', proficiency: 'proficient' }, { id: 's2' }] })).resolves.toEqual([{ id: 's1', name: 'TypeScript', proficiency: 'PROFICIENT' }, { id: 's2', name: 'React', proficiency: undefined }]);
    expect(links.delete).toHaveBeenCalled();
  });

  it('lists applications by student, admin and company membership', async () => {
    const { controller, repos } = createController(); repos[10].findBy.mockResolvedValue([{ id: 'student-app' }]);
    await expect(controller.applications(student)).resolves.toEqual([{ id: 'student-app' }]);
    repos[10].find.mockResolvedValue([{ id: 'admin-app' }]); await expect(controller.applications({ ...student, role: 'ADMIN' })).resolves.toEqual([{ id: 'admin-app' }]);
    repos[6].findBy.mockResolvedValue([{ companyId: 'c1' }]); repos[7].findBy.mockResolvedValue([{ id: 'p1' }]); repos[10].findBy.mockResolvedValue([{ id: 'company-app' }]);
    await expect(controller.applications({ ...student, role: 'COMPANY_STAFF' })).resolves.toEqual([{ id: 'company-app' }]);
  });
});

describe('auth controller', () => {
  const user = { id: 'u1', email: 'user@example.test', fullName: 'User', passwordHash: 'hash' } as any;
  it('issues a session for a valid role and rejects invalid credentials/roles', async () => {
    const users = { findOneBy: jest.fn().mockResolvedValue(user) }; const roles = { findBy: jest.fn().mockResolvedValue([{ role: 'STUDENT' }]) }; const sessions = { save: jest.fn().mockResolvedValue({ id: 'session', activeRole: 'STUDENT', version: 1 }) }; const jwt = { signAsync: jest.fn().mockResolvedValue('jwt') };
    jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);
    const controller = new AuthController(users as any, roles as any, sessions as any, jwt as any);
    await expect(controller.signIn({ email: ' USER@example.test ', password: 'pw' })).resolves.toMatchObject({ accessToken: 'jwt', tokenType: 'Bearer', activeRole: 'STUDENT' });
    roles.findBy.mockResolvedValue([{ role: 'STUDENT' }]); await expect(controller.signIn({ email: user.email, password: 'pw', activeRole: 'ADMIN' })).rejects.toBeInstanceOf(BadRequestException);
    users.findOneBy.mockResolvedValue(null); await expect(controller.signIn({ email: user.email, password: 'pw' })).rejects.toBeInstanceOf(BadRequestException);
  });
  it('revokes the current session on sign out', async () => {
    const sessions = { update: jest.fn() }; const controller = new AuthController({} as any, {} as any, sessions as any, {} as any);
    await expect(controller.signOut({ id: 'u', sid: 's', role: 'STUDENT', roles: [], version: 1 })).resolves.toEqual({ ok: true });
    expect(sessions.update).toHaveBeenCalledWith('s', expect.objectContaining({ revokedAt: expect.any(Date) }));
  });
});
