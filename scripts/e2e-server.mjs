import EmbeddedPostgres from "embedded-postgres";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
const directory = await mkdtemp(join(tmpdir(), "internhub-browser-"));
const pg = new EmbeddedPostgres({
  databaseDir: join(directory, "db"),
  port: 55440,
  user: "internhub_test",
  password: "test-only",
  persistent: false,
  onLog: () => {},
  onError: () => {},
});
await pg.initialise();
await pg.start();
await pg.createDatabase("internhub_test_browser");
const child = spawn(
  "pnpm",
  ["--filter", "@internhub/api", "exec", "ts-node", "test/browser-server.ts"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "test",
      TEST_DATABASE_URL:
        "postgresql://internhub_test:test-only@localhost:55440/internhub_test_browser",
    },
  },
);
let closing = false;
const close = async () => {
  if (closing) return;
  closing = true;
  child.kill("SIGTERM");
  await pg.stop();
  process.exit(0);
};
process.on("SIGTERM", () => void close());
process.on("SIGINT", () => void close());
child.on("exit", (code) => {
  if (!closing) {
    void pg.stop().then(() => process.exit(code ?? 1));
  }
});
