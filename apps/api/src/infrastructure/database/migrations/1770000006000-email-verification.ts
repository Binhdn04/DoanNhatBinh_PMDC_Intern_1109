import { MigrationInterface, QueryRunner } from "typeorm";

export class EmailVerification1770000006000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT lower(email) FROM users GROUP BY lower(email) HAVING count(*) > 1
        ) THEN
          RAISE EXCEPTION 'Cannot enforce case-insensitive email uniqueness while duplicate emails exist';
        END IF;
      END $$;
      UPDATE users SET email=lower(trim(email)) WHERE email<>lower(trim(email));
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;
      UPDATE users SET email_verified_at=created_at WHERE email_verified_at IS NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_ci_idx ON users(lower(email));
      CREATE TABLE email_verification_tokens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        token_hash char(64) NOT NULL UNIQUE,
        expires_at timestamptz NOT NULL,
        used_at timestamptz,
        revoked_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX email_verification_tokens_user_idx
        ON email_verification_tokens(user_id, created_at DESC);
    `);
  }

  async down(): Promise<void> {
    throw new Error(
      "Forward-only email verification migration; restore backup to roll back",
    );
  }
}
