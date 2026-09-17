import { NotFoundException } from '@nestjs/common';
import { CoreController } from '../src/modules/controllers';

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
});
