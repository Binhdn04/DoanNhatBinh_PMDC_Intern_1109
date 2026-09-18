import { MigrationInterface, QueryRunner } from "typeorm";
export class Integrity1770000004000 implements MigrationInterface {
  async up(q: QueryRunner) {
    // NOT VALID preserves historical exceptions but enforces all new writes.
    await q.query(`ALTER TABLE documents ADD COLUMN storage_deleted_at timestamptz;
   CREATE INDEX documents_cleanup_idx ON documents(created_at) WHERE state IN ('PENDING','REJECTED','DELETED') AND storage_deleted_at IS NULL;
   ALTER TABLE postings ADD CONSTRAINT postings_term_fk FOREIGN KEY(term_id) REFERENCES academic_terms(id) NOT VALID;
   ALTER TABLE placements ADD CONSTRAINT placements_ended_by_fk FOREIGN KEY(ended_by_user_id) REFERENCES users(id) NOT VALID;
   ALTER TABLE notifications ADD CONSTRAINT notifications_period_fk FOREIGN KEY(reporting_period_id) REFERENCES reporting_periods(id) NOT VALID;
   ALTER TABLE postings ADD CONSTRAINT postings_status_check CHECK(status IN ('DRAFT','OPEN','CLOSED','ARCHIVED')) NOT VALID;
   ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK(status IN ('SUBMITTED','UNDER_REVIEW','INTERVIEW','ACCEPTED','REJECTED','WITHDRAWN')) NOT VALID;
   ALTER TABLE placements ADD CONSTRAINT placements_status_check CHECK(status IN ('ACTIVE','COMPLETED','TERMINATED')) NOT VALID;
   ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK(status IN ('TODO','IN_PROGRESS','DONE')) NOT VALID;
   ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK(priority IN ('LOW','MEDIUM','HIGH')) NOT VALID;
   ALTER TABLE weekly_reports ADD CONSTRAINT reports_state_check CHECK(state IN ('DRAFT','SUBMITTED','REVISION_REQUESTED','APPROVED')) NOT VALID;
   ALTER TABLE documents ADD CONSTRAINT documents_state_check CHECK(state IN ('PENDING','AVAILABLE','REJECTED','DELETED')) NOT VALID;
   ALTER TABLE applications ADD CONSTRAINT application_complete CHECK(cv_document_id IS NOT NULL AND length(trim(coalesce(contact_name,'')))>0 AND length(trim(coalesce(contact_email,'')))>0 AND length(trim(coalesce(university,'')))>0 AND length(trim(coalesce(major,'')))>0 AND length(trim(coalesce(availability,'')))>0) NOT VALID;
   ALTER TABLE self_assessments ADD CONSTRAINT self_status_check CHECK(status IN ('DRAFT','SUBMITTED')) NOT VALID;
   ALTER TABLE performance_evaluations ADD CONSTRAINT evaluation_status_check CHECK(status IN ('DRAFT','SUBMITTED')) NOT VALID;
   CREATE INDEX postings_company_status_idx ON postings(company_id,status);
   CREATE INDEX tasks_placement_idx ON tasks(placement_id,created_at);
   CREATE INDEX reports_placement_idx ON weekly_reports(placement_id);
   CREATE INDEX company_staff_user_idx ON company_staff(user_id,company_id) WHERE active;
   CREATE INDEX auth_sessions_expiry_idx ON auth_sessions(expires_at);
   CREATE TRIGGER assignment_delete_guard BEFORE DELETE ON placement_supervisor_assignments FOR EACH ROW EXECUTE FUNCTION prevent_history_mutation();
   UPDATE ai_jobs SET status='FAILED',error_code='FEATURE_DISABLED',completed_at=now() WHERE status IN ('PENDING','PROCESSING');`);
  }
  async down(): Promise<void> {
    throw new Error(
      "Forward-only integrity migration; restore the pre-upgrade backup",
    );
  }
}
