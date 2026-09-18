import "reflect-metadata";
import { DataSource } from "typeorm";
import source from "../../src/infrastructure/database/data-source";
import { InitialSchema1770000000000 } from "../../src/infrastructure/database/migrations/1770000000000-initial-schema";
import { CanonicalWorkflows1770000001000 } from "../../src/infrastructure/database/migrations/1770000001000-canonical-workflows";
import { WorkflowHardening1770000002000 } from "../../src/infrastructure/database/migrations/1770000002000-workflow-hardening";
import { PrepareCanonicalCutover1770000002500 } from "../../src/infrastructure/database/migrations/1770000002500-prepare-canonical-cutover";
import { CompleteCanonicalSchema1770000003000 } from "../../src/infrastructure/database/migrations/1770000003000-complete-canonical-schema";
import { Integrity1770000004000 } from "../../src/infrastructure/database/migrations/1770000004000-integrity";
let admin: DataSource, db: DataSource;
const name = `internhub_test_legacy_${Date.now()}`;
beforeAll(async () => {
  if (!process.env.TEST_DATABASE_URL?.includes("/internhub_test"))
    throw new Error("Isolated database required");
  admin = new DataSource({
    ...source.options,
    url: process.env.TEST_DATABASE_URL,
  } as any);
  await admin.initialize();
  await admin.query(`CREATE DATABASE "${name}"`);
  const url = new URL(process.env.TEST_DATABASE_URL);
  url.pathname = "/" + name;
  db = new DataSource({ ...source.options, url: url.href } as any);
  await db.initialize();
});
afterAll(async () => {
  await db?.destroy();
  if (admin?.isInitialized) {
    await admin.query(`DROP DATABASE "${name}"`);
    await admin.destroy();
  }
});
it("preserves relationships and archives malformed legacy data before cutover", async () => {
  const runner = db.createQueryRunner();
  await runner.connect();
  await runner.startTransaction();
  try {
    await new InitialSchema1770000000000().up(runner);
    await new CanonicalWorkflows1770000001000().up(runner);
    await new WorkflowHardening1770000002000().up(runner);
    const [student] = await runner.query(
      "INSERT INTO users(email,password_hash,full_name,roles) VALUES('student@legacy.test','hash','Student','STUDENT') RETURNING id",
    );
    const [supervisor] = await runner.query(
      "INSERT INTO users(email,password_hash,full_name,roles) VALUES('supervisor@legacy.test','hash','Supervisor','SUPERVISOR') RETURNING id",
    );
    const [company] = await runner.query(
      "INSERT INTO companies(name,staff_user_ids) VALUES('Legacy Company','not-a-uuid') RETURNING id",
    );
    await runner.query(
      'INSERT INTO student_profiles(user_id,skills,preferences) VALUES($1,\'{"bad":true}\', \'{"industries":4,"minDurationWeeks":99999999}\')',
      [student.id],
    );
    const [posting] = await runner.query(
      "INSERT INTO postings(company_id,title,description,work_arrangement,duration_weeks,openings,application_deadline,created_by_user_id,skills) VALUES($1,'Legacy','Legacy','REMOTE',12,1,'2099-01-01',$2,'[{\"name\":\"ＴｙｐｅＳｃｒｉｐｔ\",\"importance\":\"REQUIRED\"}]') RETURNING id",
      [company.id, supervisor.id],
    );
    const [application] = await runner.query(
      "INSERT INTO applications(student_id,posting_id,snapshot,cover_note,status) VALUES($1,$2,'{\"graduationYear\":\"bad\"}','Legacy','ACCEPTED') RETURNING id",
      [student.id, posting.id],
    );
    const [placement] = await runner.query(
      "INSERT INTO placements(application_id,student_id,posting_id,company_id,supervisor_user_id,start_date,end_date) VALUES($1,$2,$3,$4,$5,'2026-09-01','2026-12-01') RETURNING id",
      [application.id, student.id, posting.id, company.id, supervisor.id],
    );
    await new PrepareCanonicalCutover1770000002500().up(runner);
    await new CompleteCanonicalSchema1770000003000().up(runner);
    await new Integrity1770000004000().up(runner);
    expect(
      (
        await runner.query(
          "SELECT supervisor_user_id FROM placement_supervisor_assignments WHERE placement_id=$1",
          [placement.id],
        )
      )[0].supervisor_user_id,
    ).toBe(supervisor.id);
    expect(
      (await runner.query("SELECT normalized_name FROM skills"))[0]
        .normalized_name,
    ).toBe("typescript");
    expect(
      (
        await runner.query(
          "SELECT count(*)::int AS n FROM migration_archive.legacy_records WHERE reason='PRE_CUTOVER_BACKUP'",
        )
      )[0].n,
    ).toBeGreaterThan(0);
    expect(
      (await runner.query("SELECT industries FROM student_preferences"))[0]
        .industries,
    ).toEqual([]);
    await runner.commitTransaction();
  } catch (error) {
    await runner.rollbackTransaction();
    throw error;
  } finally {
    await runner.release();
  }
  await expect(
    db.query(
      "INSERT INTO applications(student_id,posting_id,cover_note) SELECT student_id,posting_id,'Incomplete' FROM applications LIMIT 1",
    ),
  ).rejects.toThrow();
});
it("makes preparation a no-op after an already-applied cutover", async () => {
  const runner = db.createQueryRunner();
  await runner.connect();
  try {
    await expect(
      new PrepareCanonicalCutover1770000002500().up(runner),
    ).resolves.toBeUndefined();
  } finally {
    await runner.release();
  }
});
