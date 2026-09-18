import { MigrationInterface, QueryRunner } from "typeorm";
import { canonicalRoles, mapLegacySkills } from "../canonical-backfill";
/** Runs before the original cutover on installations that have not applied it.
 * Already-cut-over installations are deliberately a no-op; lost legacy values
 * must be recovered from a backup, never guessed from unrelated records. */
export class PrepareCanonicalCutover1770000002500 implements MigrationInterface {
  async up(q: QueryRunner) {
    const [legacy] = await q.query(
      "SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='roles' AND table_schema=current_schema()) AS present",
    );
    if (!legacy.present) return;
    await q.query(`CREATE SCHEMA IF NOT EXISTS migration_archive;
   CREATE TABLE IF NOT EXISTS migration_archive.legacy_records(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),source_table text NOT NULL,source_id uuid,payload jsonb NOT NULL,reason text NOT NULL,archived_at timestamptz NOT NULL DEFAULT now());
   REVOKE ALL ON SCHEMA migration_archive FROM PUBLIC; REVOKE ALL ON ALL TABLES IN SCHEMA migration_archive FROM PUBLIC;`);
    for (const table of [
      "users",
      "companies",
      "student_profiles",
      "postings",
      "applications",
      "placements",
    ]) {
      await q.query(
        `INSERT INTO migration_archive.legacy_records(source_table,source_id,payload,reason) SELECT $1,id,to_jsonb(t),'PRE_CUTOVER_BACKUP' FROM ${table} t`,
        [table],
      );
    }
    const users = await q.query("SELECT id,roles FROM users");
    const ids = new Set(users.map((u: { id: string }) => u.id));
    for (const user of users)
      await q.query("UPDATE users SET roles=$2 WHERE id=$1", [
        user.id,
        canonicalRoles(user.roles).join(","),
      ]);
    for (const company of await q.query(
      "SELECT id,staff_user_ids FROM companies",
    ))
      await q.query("UPDATE companies SET staff_user_ids=$2 WHERE id=$1", [
        company.id,
        String(company.staff_user_ids)
          .split(",")
          .map((x) => x.trim())
          .filter((x) => ids.has(x))
          .join(","),
      ]);
    for (const table of ["student_profiles", "postings"])
      for (const row of await q.query(`SELECT id,skills FROM ${table}`)) {
        const { accepted, rejected } = mapLegacySkills(
          row.skills,
          table === "postings" ? "posting" : "student",
        );
        if (rejected.length)
          await q.query(
            "INSERT INTO migration_archive.legacy_records(source_table,source_id,payload,reason) VALUES($1,$2,$3,'REJECTED_SKILLS')",
            [table, row.id, JSON.stringify(rejected)],
          );
        await q.query(`UPDATE ${table} SET skills=$2::jsonb WHERE id=$1`, [
          row.id,
          JSON.stringify(
            accepted.map((x) => ({ ...x, name: x.normalizedName })),
          ),
        ]);
      }
    for (const row of await q.query(
      "SELECT id,preferences FROM student_profiles",
    )) {
      const source =
        row.preferences &&
        typeof row.preferences === "object" &&
        !Array.isArray(row.preferences)
          ? row.preferences
          : {};
      const value: Record<string, unknown> = {};
      for (const key of ["industries", "locations", "workArrangements"])
        value[key] = Array.isArray(source[key])
          ? source[key].filter((x: unknown) => typeof x === "string")
          : [];
      for (const key of ["minDurationWeeks", "maxDurationWeeks"])
        if (
          Number.isInteger(Number(source[key])) &&
          Number(source[key]) > 0 &&
          Number(source[key]) <= 32767
        )
          value[key] = Number(source[key]);
      if (Number(value.minDurationWeeks) > Number(value.maxDurationWeeks)) {
        delete value.minDurationWeeks;
        delete value.maxDurationWeeks;
      }
      await q.query(
        "UPDATE student_profiles SET preferences=$2::jsonb WHERE id=$1",
        [row.id, JSON.stringify(value)],
      );
    }
    for (const row of await q.query("SELECT id,snapshot FROM applications")) {
      const value =
        row.snapshot &&
        typeof row.snapshot === "object" &&
        !Array.isArray(row.snapshot)
          ? { ...row.snapshot }
          : {};
      const year = Number(value.graduationYear);
      if (!Number.isInteger(year) || year < 1900 || year > 2200)
        delete value.graduationYear;
      await q.query("UPDATE applications SET snapshot=$2::jsonb WHERE id=$1", [
        row.id,
        JSON.stringify(value),
      ]);
    }
    await q.query(`INSERT INTO placement_supervisor_assignments(placement_id,supervisor_user_id,assigned_by_user_id,assigned_at,reason)
   SELECT p.id,p.supervisor_user_id,p.supervisor_user_id,p.created_at,'Preserved legacy assignment; original assigning actor unavailable'
   FROM placements p WHERE NOT EXISTS(SELECT 1 FROM placement_supervisor_assignments a WHERE a.placement_id=p.id AND a.revoked_at IS NULL);
   INSERT INTO supervisor_profiles(user_id) SELECT DISTINCT supervisor_user_id FROM placements ON CONFLICT DO NOTHING;`);
  }
  async down(): Promise<void> {
    throw new Error("Forward-only migration; restore the pre-upgrade backup");
  }
}
