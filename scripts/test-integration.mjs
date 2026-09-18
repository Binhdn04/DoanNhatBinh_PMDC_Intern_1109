import EmbeddedPostgres from "embedded-postgres";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
const directory = await mkdtemp(join(tmpdir(), "internhub-test-"));
const port = Number(process.env.TEST_PG_PORT ?? 55439);
const postgres = new EmbeddedPostgres({
  databaseDir: join(directory, "data"),
  port,
  user: "internhub_test",
  password: "test-only",
  persistent: false,
  onLog: () => {},
  onError: () => {},
});
let result = 1;
try {
  await postgres.initialise();
  await postgres.start();
  await postgres.createDatabase("internhub_test");
  const child = spawn(
    "pnpm",
    [
      "--filter",
      "@internhub/api",
      "exec",
      "jest",
      "--config",
      "jest.integration.cjs",
      "--runInBand",
      ...process.argv.slice(2),
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "test",
        INTEGRATION_COVERAGE: process.argv.includes("--coverage") ? "true" : "",
        TEST_DATABASE_URL: `postgresql://internhub_test:test-only@localhost:${port}/internhub_test`,
      },
    },
  );
  result = await new Promise((resolve) => child.on("exit", resolve));
} finally {
  await postgres.stop();
}

process.exit(result ?? 1);
