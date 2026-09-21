import { MigrationInterface, QueryRunner } from "typeorm";

export class AdminRecovery1770000005000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
      CREATE TABLE password_reset_tokens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        token_hash char(64) NOT NULL UNIQUE,
        expires_at timestamptz NOT NULL,
        used_at timestamptz,
        revoked_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX password_reset_tokens_user_idx
        ON password_reset_tokens(user_id, created_at DESC);
      CREATE INDEX users_active_email_idx ON users(email) WHERE is_active;
    `);
  }

  async down(): Promise<void> {
    throw new Error(
      "Forward-only admin and recovery migration; restore backup to roll back",
    );
  }
}
