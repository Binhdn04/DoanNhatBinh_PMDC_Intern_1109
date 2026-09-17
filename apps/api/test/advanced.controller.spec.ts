import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AdvancedController } from '../src/modules/advanced.controller';

const repository = () => ({ find: jest.fn().mockResolvedValue([]), findBy: jest.fn().mockResolvedValue([]), findOneBy: jest.fn().mockResolvedValue(null), findOneByOrFail: jest.fn(), save: jest.fn(async value => ({ id: 'row-1', ...value })), create: jest.fn(value => value), exist: jest.fn().mockResolvedValue(false), countBy: jest.fn().mockResolvedValue(0), delete: jest.fn(), update: jest.fn(), createQueryBuilder: jest.fn(() => ({ setLock: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(null), getOneOrFail: jest.fn(), getMany: jest.fn().mockResolvedValue([]), getExists: jest.fn().mockResolvedValue(false), insert: jest.fn().mockReturnThis(), values: jest.fn().mockReturnThis(), orIgnore: jest.fn().mockReturnThis(), execute: jest.fn() })) });
function fixture() {
  const repos = Array.from({ length: 28 }, repository);
  const storage = { putStream: jest.fn(), verify: jest.fn(), remove: jest.fn(), get: jest.fn() };
  const jwt = { signAsync: jest.fn().mockResolvedValue('transfer'), verifyAsync: jest.fn() };
  const db = { transaction: jest.fn(async (...args: any[]) => { const fn = args.at(-1); return fn({ getRepository: jest.fn(() => repository()), save: jest.fn() }); }) };
  const health = { success: jest.fn() };
  return { controller: new (AdvancedController as any)(...repos, storage, jwt, db, health) as AdvancedController, repos, storage, jwt, db, health };
}
const student: any = { id: 'student', sid: 'sid', role: 'STUDENT', roles: ['STUDENT'], version: 1 };

describe('advanced controller isolated workflows', () => {
  it('validates supervisor scope and paginates eligible search results', async () => {
    const { controller, repos } = fixture();
    await expect(controller.supervisors(student, {})).rejects.toBeInstanceOf(BadRequestException);
    repos[16].find.mockResolvedValue([{ userId: 'sup', department: 'Engineering' }]);
    repos[0].findBy.mockResolvedValue([{ id: 'sup', fullName: 'Ada Lovelace' }, { id: 'other', fullName: 'Other' }]);
    repos[1].findBy.mockResolvedValue([{ userId: 'sup' }]);
    await expect(controller.supervisors({ ...student, role: 'ADMIN' }, { placementId: 'p', search: 'ada', page: '2', pageSize: '1' })).resolves.toEqual({ items: [], page: 2, pageSize: 1, total: 1 });
  });

  it('begins only valid documents and returns an upload transfer claim', async () => {
    const { controller, repos, jwt } = fixture();
    await expect(controller.beginDocument(student, { originalName: '', contentType: 'text/plain', sizeBytes: 0, sha256: 'no' })).rejects.toBeInstanceOf(BadRequestException);
    repos[14].save.mockResolvedValue({ id: 'doc', ownerUserId: 'student', objectKey: 'key', originalName: 'cv.pdf', contentType: 'application/pdf', sizeBytes: '5', sha256: 'a'.repeat(64), state: 'PENDING' });
    await expect(controller.beginDocument(student, { originalName: ' cv.pdf ', contentType: 'application/pdf', sizeBytes: 5, sha256: 'A'.repeat(64) })).resolves.toMatchObject({ document: { id: 'doc', originalName: 'cv.pdf' }, uploadUrl: expect.stringContaining('transfer') });
    expect(jwt.signAsync).toHaveBeenCalled();
  });

  it('rejects invalid transfer claims before storage access', async () => {
    const { controller, repos, jwt, storage } = fixture();
    repos[14].findOneBy.mockResolvedValue({ id: 'doc', ownerUserId: 'student', state: 'PENDING', sizeBytes: '5', sha256: 'a'.repeat(64), contentType: 'application/pdf' });
    jwt.verifyAsync.mockResolvedValue({ sid: 'wrong', documentId: 'doc', method: 'PUT' });
    await expect(controller.uploadDocument(student, 'doc', 'bad', { pipe: jest.fn() } as any)).rejects.toBeInstanceOf(ForbiddenException);
    expect(storage.putStream).not.toHaveBeenCalled();
  });

  it('enforces assessment validation, authorship, and persists valid drafts', async () => {
    const { controller, repos } = fixture();
    repos[12].findOneBy.mockResolvedValue({ id: 'placement', studentId: 'student' });
    await expect(controller.putSelf(student, 'placement', { status: 'SUBMITTED', ratings: {}, reflection: '', learningOutcomes: '' })).rejects.toBeInstanceOf(BadRequestException);
    repos[24].findOneBy.mockResolvedValue(null);
    await expect(controller.putSelf(student, 'placement', { status: 'DRAFT', ratings: {}, reflection: ' ', learningOutcomes: ' ' })).resolves.toMatchObject({ status: 'DRAFT' });
    repos[25].findOneBy.mockResolvedValue({ authorUserId: 'other' });
    repos[17].findOneBy.mockResolvedValue({ placementId: 'placement', supervisorUserId: 'student' });
    await expect(controller.putEvaluation({ ...student, role: 'SUPERVISOR' }, 'placement', { status: 'DRAFT', ratings: {}, completionDecision: 'PENDING' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns monitoring aggregates and rejects malformed AI source combinations', async () => {
    const { controller, repos } = fixture();
    repos[4].find.mockResolvedValue([{ status: 'SUBMITTED' }, { status: 'SUBMITTED' }]); repos[12].find.mockResolvedValue([{ status: 'ACTIVE' }]); repos[19].find.mockResolvedValue([{ state: 'DRAFT' }]); repos[18].find.mockResolvedValue([{ id: 'period', placementId: 'p', weekEnd: '2026-01-01', dueAt: new Date() }]); repos[26].find.mockResolvedValue([{ eventType: 'CREATE', occurredAt: new Date(), subjectType: 'X', subjectId: '1' }]);
    await expect(controller.monitoring({ programId: 'program' })).resolves.toMatchObject({ applications: { SUBMITTED: 2 }, placements: { ACTIVE: 1 }, reports: { DRAFT: 1 }, readOnly: true });
    await expect(controller.createAiJob(student, { kind: 'MATCH_EXPLANATION', postingId: 'p', reportVersionId: 'r' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns not-found for missing resources without attempting writes', async () => {
    const { controller } = fixture();
    await expect(controller.getReport(student, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    await expect(controller.getAiJob(student, 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
