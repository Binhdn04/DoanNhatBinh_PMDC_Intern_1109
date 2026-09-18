import { MigrationInterface,QueryRunner } from 'typeorm';

/** Additive migration: old JSON snapshots remain readable, all new workflow writes use these relations. */
export class WorkflowHardening1770000002000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      ALTER TABLE postings ADD COLUMN IF NOT EXISTS term_id uuid, ADD COLUMN IF NOT EXISTS deadline_timezone varchar(100) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh', ADD COLUMN IF NOT EXISTS skills_declared boolean NOT NULL DEFAULT false;
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS cv_document_id uuid REFERENCES documents(id);
      ALTER TABLE application_status_history ADD COLUMN IF NOT EXISTS acceptance_command jsonb;
      CREATE UNIQUE INDEX IF NOT EXISTS one_accepted_history_per_application ON application_status_history(application_id) WHERE to_status = 'ACCEPTED';
      CREATE TABLE IF NOT EXISTS application_documents (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), application_id uuid NOT NULL REFERENCES applications(id) ON DELETE RESTRICT, document_id uuid NOT NULL REFERENCES documents(id) ON DELETE RESTRICT, kind varchar(30) NOT NULL DEFAULT 'SUPPORTING', created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(application_id, document_id));
      CREATE INDEX IF NOT EXISTS application_documents_document_idx ON application_documents(document_id);
      ALTER TABLE ai_jobs ADD COLUMN IF NOT EXISTS claim_token uuid, ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz, ADD COLUMN IF NOT EXISTS claimed_at timestamptz;
      CREATE INDEX IF NOT EXISTS reporting_periods_due_idx ON reporting_periods(due_at);
      CREATE INDEX IF NOT EXISTS report_draft_documents_document_idx ON report_draft_documents(document_id);
      CREATE INDEX IF NOT EXISTS report_version_documents_document_idx ON report_version_documents(document_id);
      UPDATE postings SET skills_declared = true WHERE skills <> '[]'::jsonb;
    `);
  }
  async down(q: QueryRunner): Promise<void> { await q.query('DROP TABLE IF EXISTS application_documents'); }
}
