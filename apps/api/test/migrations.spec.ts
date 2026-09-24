import { InitialSchema1770000000000 } from "../src/infrastructure/database/migrations/1770000000000-initial-schema";
import { CanonicalWorkflows1770000001000 } from "../src/infrastructure/database/migrations/1770000001000-canonical-workflows";
import { WorkflowHardening1770000002000 } from "../src/infrastructure/database/migrations/1770000002000-workflow-hardening";
import { CompleteCanonicalSchema1770000003000 } from "../src/infrastructure/database/migrations/1770000003000-complete-canonical-schema";
import { EmailVerification1770000006000 } from "../src/infrastructure/database/migrations/1770000006000-email-verification";

const runner = () => ({ query: jest.fn().mockResolvedValue(undefined) }) as any;

describe("database migrations", () => {
  it.each([
    [new InitialSchema1770000000000(), ["users", "applications", "placements"]],
    [
      new CanonicalWorkflows1770000001000(),
      ["reporting_periods", "weekly_reports", "ai_jobs"],
    ],
    [new WorkflowHardening1770000002000(), ["application_documents", "UNIQUE"]],
    [
      new CompleteCanonicalSchema1770000003000(),
      ["user_roles", "posting_skills", "application_status_history"],
    ],
    [
      new EmailVerification1770000006000(),
      ["email_verified_at", "email_verification_tokens", "users_email_ci_idx"],
    ],
  ])("creates canonical schema through %p", async (migration, expected) => {
    const q = runner();
    await migration.up(q);
    const sql = q.query.mock.calls.map(([value]: [string]) => value).join("\n");
    expected.forEach((value) => expect(sql).toContain(value));
  });

  it("provides down SQL for reversible migrations", async () => {
    for (const migration of [
      new InitialSchema1770000000000(),
      new CanonicalWorkflows1770000001000(),
      new WorkflowHardening1770000002000(),
    ]) {
      const q = runner();
      await migration.down(q);
      expect(q.query).toHaveBeenCalledWith(
        expect.stringContaining("DROP TABLE"),
      );
    }
  });

  it("protects the forward-only cutover from reversal", async () => {
    await expect(
      new CompleteCanonicalSchema1770000003000().down(),
    ).rejects.toThrow("Forward-only canonical cutover");
  });
});
