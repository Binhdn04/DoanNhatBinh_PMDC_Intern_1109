import { validateEnvironment } from "../src/config";
describe("production configuration", () => {
  const env = {
    NODE_ENV: "production",
    JWT_SECRET: "a".repeat(40),
    UPLOAD_TOKEN_SECRET: "b".repeat(40),
    DATABASE_URL: "postgresql://test",
    MINIO_ENDPOINT: "storage",
    MINIO_ACCESS_KEY: "private",
    MINIO_SECRET_KEY: "secret",
    WEB_ORIGIN: "https://internhub.example",
  };
  it("accepts explicit production configuration and local defaults", () => {
    expect(validateEnvironment(env)).toBe(env);
    expect(validateEnvironment({})).toEqual({});
  });
  it.each([
    "JWT_SECRET",
    "UPLOAD_TOKEN_SECRET",
    "DATABASE_URL",
    "MINIO_ENDPOINT",
    "MINIO_ACCESS_KEY",
    "MINIO_SECRET_KEY",
    "WEB_ORIGIN",
  ])("requires %s in production", (name) => {
    expect(() => validateEnvironment({ ...env, [name]: "" })).toThrow(name);
  });
  it.each(["JWT_SECRET", "UPLOAD_TOKEN_SECRET"])("rejects short %s", (name) => {
    expect(() => validateEnvironment({ ...env, [name]: "short" })).toThrow(
      "32",
    );
  });
  it.each(["MINIO_ACCESS_KEY", "MINIO_SECRET_KEY"])(
    "rejects default %s",
    (name) => {
      expect(() =>
        validateEnvironment({ ...env, [name]: "minioadmin" }),
      ).toThrow("Default storage");
    },
  );
});
