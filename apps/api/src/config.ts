export function validateEnvironment(env: Record<string, unknown>) {
  if (env.NODE_ENV === "production") {
    for (const name of [
      "JWT_SECRET",
      "UPLOAD_TOKEN_SECRET",
      "DATABASE_URL",
      "MINIO_ENDPOINT",
      "MINIO_ACCESS_KEY",
      "MINIO_SECRET_KEY",
      "WEB_ORIGIN",
    ]) {
      if (typeof env[name] !== "string" || !(env[name] as string).trim())
        throw new Error(`${name} is required in production`);
    }
    for (const name of ["JWT_SECRET", "UPLOAD_TOKEN_SECRET"])
      if ((env[name] as string).length < 32)
        throw new Error(`${name} must contain at least 32 characters`);
    if (
      env.MINIO_ACCESS_KEY === "minioadmin" ||
      env.MINIO_SECRET_KEY === "minioadmin"
    )
      throw new Error(
        "Default storage credentials are forbidden in production",
      );
  }
  return env;
}
