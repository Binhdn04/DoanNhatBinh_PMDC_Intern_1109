import { MigrationInterface,QueryRunner } from 'typeorm';

/** Final forward-only cutover from development arrays/JSON to canonical relations. */
export class CompleteCanonicalSchema1770000003000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE SCHEMA IF NOT EXISTS migration_archive;
      CREATE TABLE IF NOT EXISTS migration_archive.legacy_records (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_table text NOT NULL, source_id uuid, payload jsonb NOT NULL,
        reason text NOT NULL, archived_at timestamptz NOT NULL DEFAULT now()
      );
      REVOKE ALL ON SCHEMA migration_archive FROM PUBLIC;
      REVOKE ALL ON ALL TABLES IN SCHEMA migration_archive FROM PUBLIC;

      CREATE TABLE IF NOT EXISTS user_roles (user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT, role varchar(30) NOT NULL CHECK(role IN ('STUDENT','COMPANY_STAFF','SUPERVISOR','ADMIN')), PRIMARY KEY(user_id,role));
      CREATE TABLE IF NOT EXISTS company_staff (company_id uuid NOT NULL REFERENCES companies(id) ON DELETE RESTRICT, user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT, title varchar(120), active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(company_id,user_id));
      CREATE INDEX IF NOT EXISTS company_staff_active_idx ON company_staff(company_id, active) WHERE active;
      CREATE TABLE IF NOT EXISTS skills (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(100) NOT NULL, normalized_name varchar(100) NOT NULL UNIQUE, category varchar(100), created_at timestamptz NOT NULL DEFAULT now());
      CREATE TABLE IF NOT EXISTS student_skills (student_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT, skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE RESTRICT, proficiency varchar(20), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(student_id,skill_id), CHECK(proficiency IS NULL OR proficiency IN ('BEGINNER','INTERMEDIATE','ADVANCED')));
      CREATE TABLE IF NOT EXISTS posting_skills (posting_id uuid NOT NULL REFERENCES postings(id) ON DELETE RESTRICT, skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE RESTRICT, importance varchar(20) NOT NULL, PRIMARY KEY(posting_id,skill_id), CHECK(importance IN ('REQUIRED','OPTIONAL')));
      CREATE TABLE IF NOT EXISTS student_preferences (student_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE RESTRICT, industries text[] NOT NULL DEFAULT '{}', locations text[] NOT NULL DEFAULT '{}', work_arrangements text[] NOT NULL DEFAULT '{}', min_duration_weeks smallint, max_duration_weeks smallint, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CHECK((min_duration_weeks IS NULL OR min_duration_weeks > 0) AND (max_duration_weeks IS NULL OR max_duration_weeks > 0) AND (min_duration_weeks IS NULL OR max_duration_weeks IS NULL OR min_duration_weeks <= max_duration_weeks)));

      INSERT INTO user_roles(user_id, role)
      SELECT u.id, upper(trim(role_part)) FROM users u CROSS JOIN LATERAL unnest(string_to_array(u.roles, ',')) role_part
      WHERE upper(trim(role_part)) IN ('STUDENT','COMPANY_STAFF','SUPERVISOR','ADMIN') ON CONFLICT DO NOTHING;
      INSERT INTO migration_archive.legacy_records(source_table,source_id,payload,reason)
      SELECT 'users', id, jsonb_build_object('roles', roles), 'INVALID_OR_EMPTY_LEGACY_ROLE' FROM users
      WHERE EXISTS (SELECT 1 FROM unnest(string_to_array(roles, ',')) r WHERE upper(trim(r)) NOT IN ('STUDENT','COMPANY_STAFF','SUPERVISOR','ADMIN'));

      INSERT INTO company_staff(company_id,user_id)
      SELECT c.id, x::uuid FROM companies c CROSS JOIN LATERAL unnest(string_to_array(c.staff_user_ids, ',')) x
      WHERE x ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND EXISTS (SELECT 1 FROM users u WHERE u.id=x::uuid) ON CONFLICT DO NOTHING;
      INSERT INTO migration_archive.legacy_records(source_table,source_id,payload,reason)
      SELECT 'companies', c.id, jsonb_build_object('staff_user_ids', c.staff_user_ids), 'INVALID_COMPANY_MEMBERSHIP' FROM companies c
      WHERE EXISTS (SELECT 1 FROM unnest(string_to_array(c.staff_user_ids, ',')) x WHERE x !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' OR NOT EXISTS (SELECT 1 FROM users u WHERE u.id=x::uuid));

      INSERT INTO skills(name,normalized_name)
      SELECT DISTINCT left(trim(regexp_replace(e.value->>'name','\\s+',' ','g')),100), left(lower(trim(regexp_replace(e.value->>'name','\\s+',' ','g'))),100)
      FROM student_profiles p CROSS JOIN LATERAL jsonb_array_elements(COALESCE(p.skills,'[]')) e
      WHERE jsonb_typeof(e.value)='object' AND nullif(trim(e.value->>'name'),'') IS NOT NULL
      ON CONFLICT(normalized_name) DO NOTHING;
      INSERT INTO skills(name,normalized_name)
      SELECT DISTINCT left(trim(regexp_replace(e.value->>'name','\\s+',' ','g')),100), left(lower(trim(regexp_replace(e.value->>'name','\\s+',' ','g'))),100)
      FROM postings p CROSS JOIN LATERAL jsonb_array_elements(COALESCE(p.skills,'[]')) e
      WHERE jsonb_typeof(e.value)='object' AND nullif(trim(e.value->>'name'),'') IS NOT NULL
      ON CONFLICT(normalized_name) DO NOTHING;
      INSERT INTO student_skills(student_id,skill_id,proficiency)
      SELECT p.user_id,s.id,CASE upper(e.value->>'proficiency') WHEN 'BEGINNER' THEN 'BEGINNER' WHEN 'INTERMEDIATE' THEN 'INTERMEDIATE' WHEN 'ADVANCED' THEN 'ADVANCED' ELSE NULL END
      FROM student_profiles p CROSS JOIN LATERAL jsonb_array_elements(COALESCE(p.skills,'[]')) e JOIN skills s ON s.normalized_name=left(lower(trim(regexp_replace(e.value->>'name','\\s+',' ','g'))),100)
      WHERE jsonb_typeof(e.value)='object' AND nullif(trim(e.value->>'name'),'') IS NOT NULL ON CONFLICT DO NOTHING;
      INSERT INTO posting_skills(posting_id,skill_id,importance)
      SELECT p.id,s.id,CASE WHEN upper(e.value->>'importance')='OPTIONAL' THEN 'OPTIONAL' ELSE 'REQUIRED' END
      FROM postings p CROSS JOIN LATERAL jsonb_array_elements(COALESCE(p.skills,'[]')) e JOIN skills s ON s.normalized_name=left(lower(trim(regexp_replace(e.value->>'name','\\s+',' ','g'))),100)
      WHERE jsonb_typeof(e.value)='object' AND nullif(trim(e.value->>'name'),'') IS NOT NULL ON CONFLICT DO NOTHING;
      INSERT INTO migration_archive.legacy_records(source_table,source_id,payload,reason)
      SELECT 'student_profiles',id,jsonb_build_object('skills',skills,'preferences',preferences),'UNMAPPABLE_LEGACY_SKILL_OR_PREFERENCE' FROM student_profiles WHERE jsonb_typeof(skills) <> 'array' OR jsonb_typeof(preferences) <> 'object';
      INSERT INTO migration_archive.legacy_records(source_table,source_id,payload,reason)
      SELECT 'postings',id,jsonb_build_object('skills',skills),'UNMAPPABLE_LEGACY_POSTING_SKILL' FROM postings WHERE jsonb_typeof(skills) <> 'array';
      INSERT INTO student_preferences(student_id,industries,locations,work_arrangements,min_duration_weeks,max_duration_weeks)
      SELECT user_id, COALESCE(ARRAY(SELECT jsonb_array_elements_text(preferences->'industries')),'{}'), COALESCE(ARRAY(SELECT jsonb_array_elements_text(preferences->'locations')),'{}'), COALESCE(ARRAY(SELECT jsonb_array_elements_text(preferences->'workArrangements')),'{}'),
        CASE WHEN preferences->>'minDurationWeeks' ~ '^[0-9]+$' AND (preferences->>'maxDurationWeeks' IS NULL OR (preferences->>'maxDurationWeeks' ~ '^[0-9]+$' AND (preferences->>'minDurationWeeks')::integer <= (preferences->>'maxDurationWeeks')::integer)) THEN (preferences->>'minDurationWeeks')::smallint END,
        CASE WHEN preferences->>'maxDurationWeeks' ~ '^[0-9]+$' AND (preferences->>'minDurationWeeks' IS NULL OR (preferences->>'minDurationWeeks' ~ '^[0-9]+$' AND (preferences->>'minDurationWeeks')::integer <= (preferences->>'maxDurationWeeks')::integer)) THEN (preferences->>'maxDurationWeeks')::smallint END
      FROM student_profiles WHERE jsonb_typeof(preferences)='object' ON CONFLICT DO NOTHING;

      ALTER TABLE applications ADD COLUMN IF NOT EXISTS contact_name varchar(200), ADD COLUMN IF NOT EXISTS contact_email varchar(320), ADD COLUMN IF NOT EXISTS contact_phone varchar(40), ADD COLUMN IF NOT EXISTS university varchar(200), ADD COLUMN IF NOT EXISTS major varchar(200), ADD COLUMN IF NOT EXISTS graduation_year smallint, ADD COLUMN IF NOT EXISTS availability text;
      UPDATE applications SET contact_name=COALESCE(contact_name,snapshot->>'contactName'), contact_email=COALESCE(contact_email,snapshot->>'contactEmail'), contact_phone=COALESCE(contact_phone,snapshot->>'contactPhone'), university=COALESCE(university,snapshot->>'university'), major=COALESCE(major,snapshot->>'major'), availability=COALESCE(availability,snapshot->>'availability'), graduation_year=COALESCE(graduation_year,NULLIF(snapshot->>'graduationYear','')::smallint);
      INSERT INTO migration_archive.legacy_records(source_table,source_id,payload,reason) SELECT 'applications',id,snapshot,'INCOMPLETE_APPLICATION_SNAPSHOT' FROM applications WHERE nullif(trim(contact_name),'') IS NULL OR nullif(trim(contact_email),'') IS NULL OR nullif(trim(university),'') IS NULL OR nullif(trim(major),'') IS NULL OR nullif(trim(availability),'') IS NULL;
      ALTER TABLE placements ADD COLUMN IF NOT EXISTS term_id uuid REFERENCES academic_terms(id), ADD COLUMN IF NOT EXISTS ended_at timestamptz, ADD COLUMN IF NOT EXISTS ended_by_user_id uuid REFERENCES users(id);
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by_user_id uuid REFERENCES users(id), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
      UPDATE tasks t SET created_by_user_id=p.supervisor_user_id FROM placements p WHERE p.id=t.placement_id AND t.created_by_user_id IS NULL;
      CREATE INDEX IF NOT EXISTS student_skills_skill_idx ON student_skills(skill_id,student_id);
      CREATE INDEX IF NOT EXISTS posting_skills_skill_idx ON posting_skills(skill_id,posting_id);
      CREATE INDEX IF NOT EXISTS applications_posting_status_idx ON applications(posting_id,status,submitted_at DESC);
      CREATE INDEX IF NOT EXISTS applications_student_idx ON applications(student_id,submitted_at DESC);
      CREATE INDEX IF NOT EXISTS application_history_timeline_idx ON application_status_history(application_id,changed_at);
      CREATE INDEX IF NOT EXISTS placements_student_status_idx ON placements(student_id,status);
      CREATE INDEX IF NOT EXISTS placements_company_status_idx ON placements(company_id,status);
      CREATE INDEX IF NOT EXISTS assignments_supervisor_active_idx ON placement_supervisor_assignments(supervisor_user_id,placement_id) WHERE revoked_at IS NULL;

      CREATE OR REPLACE FUNCTION prevent_history_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'immutable history cannot be changed'; END $$;
      CREATE OR REPLACE FUNCTION guard_assignment_revocation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF OLD.revoked_at IS NOT NULL OR NEW.placement_id<>OLD.placement_id OR NEW.supervisor_user_id<>OLD.supervisor_user_id OR NEW.assigned_at<>OLD.assigned_at OR NEW.assigned_by_user_id<>OLD.assigned_by_user_id OR NEW.reason IS DISTINCT FROM OLD.reason OR NEW.revoked_at IS NULL OR NEW.revoked_by_user_id IS NULL OR nullif(trim(NEW.revocation_reason),'') IS NULL THEN RAISE EXCEPTION 'assignment history is immutable'; END IF; RETURN NEW; END $$;
      CREATE OR REPLACE FUNCTION guard_ai_input() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.requested_by_user_id<>OLD.requested_by_user_id OR NEW.kind<>OLD.kind OR NEW.posting_id IS DISTINCT FROM OLD.posting_id OR NEW.report_version_id IS DISTINCT FROM OLD.report_version_id OR NEW.input_fingerprint<>OLD.input_fingerprint OR NEW.input_snapshot<>OLD.input_snapshot OR NEW.prompt_version<>OLD.prompt_version THEN RAISE EXCEPTION 'AI input is immutable'; END IF; RETURN NEW; END $$;
      DROP TRIGGER IF EXISTS application_history_immutable ON application_status_history; CREATE TRIGGER application_history_immutable BEFORE UPDATE OR DELETE ON application_status_history FOR EACH ROW EXECUTE FUNCTION prevent_history_mutation();
      DROP TRIGGER IF EXISTS report_versions_immutable ON report_versions; CREATE TRIGGER report_versions_immutable BEFORE UPDATE OR DELETE ON report_versions FOR EACH ROW EXECUTE FUNCTION prevent_history_mutation();
      DROP TRIGGER IF EXISTS report_reviews_immutable ON report_reviews; CREATE TRIGGER report_reviews_immutable BEFORE UPDATE OR DELETE ON report_reviews FOR EACH ROW EXECUTE FUNCTION prevent_history_mutation();
      DROP TRIGGER IF EXISTS report_version_documents_immutable ON report_version_documents; CREATE TRIGGER report_version_documents_immutable BEFORE UPDATE OR DELETE ON report_version_documents FOR EACH ROW EXECUTE FUNCTION prevent_history_mutation();
      DROP TRIGGER IF EXISTS audit_events_immutable ON audit_events; CREATE TRIGGER audit_events_immutable BEFORE UPDATE OR DELETE ON audit_events FOR EACH ROW EXECUTE FUNCTION prevent_history_mutation();
      DROP TRIGGER IF EXISTS reporting_periods_immutable ON reporting_periods; CREATE TRIGGER reporting_periods_immutable BEFORE UPDATE OR DELETE ON reporting_periods FOR EACH ROW EXECUTE FUNCTION prevent_history_mutation();
      DROP TRIGGER IF EXISTS assignments_guard ON placement_supervisor_assignments; CREATE TRIGGER assignments_guard BEFORE UPDATE ON placement_supervisor_assignments FOR EACH ROW EXECUTE FUNCTION guard_assignment_revocation();
      DROP TRIGGER IF EXISTS ai_input_immutable ON ai_jobs; CREATE TRIGGER ai_input_immutable BEFORE UPDATE ON ai_jobs FOR EACH ROW EXECUTE FUNCTION guard_ai_input();

      ALTER TABLE users DROP COLUMN roles;
      ALTER TABLE companies DROP COLUMN staff_user_ids;
      ALTER TABLE student_profiles DROP COLUMN skills, DROP COLUMN preferences;
      ALTER TABLE postings DROP COLUMN skills;
      ALTER TABLE applications DROP COLUMN snapshot;
      ALTER TABLE placements DROP COLUMN supervisor_user_id;
    `);
  }
  async down(): Promise<void> { throw new Error('Forward-only canonical cutover cannot be reverted safely'); }
}
