import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import * as bcrypt from "bcrypt";
import source from "../src/infrastructure/database/data-source";
import {
  entities,
  User,
  UserRole,
  Company,
  CompanyStaff,
  SupervisorProfile,
} from "../src/infrastructure/database/entities";
import { ApiModule } from "../src/modules/api.module";
import { ProblemFilter } from "../src/modules/problem.filter";
import { PrivateStorageService } from "../src/modules/private-storage.service";
import { SchedulerHealthService } from "../src/modules/scheduler-health.service";
async function start() {
  if (!process.env.TEST_DATABASE_URL?.includes("/internhub_test"))
    throw new Error("Dedicated test database required");
  const db = new DataSource({
    ...source.options,
    url: process.env.TEST_DATABASE_URL,
  } as any);
  await db.initialize();
  await db.runMigrations();
  const passwordHash = await bcrypt.hash("Test-password1!", 4);
  let staffId = "";
  for (const role of [
    "STUDENT",
    "COMPANY_STAFF",
    "SUPERVISOR",
    "ADMIN",
  ] as const) {
    const user = await db
      .getRepository(User)
      .save({
        email: `${role.toLowerCase()}@example.test`,
        fullName: role,
        passwordHash,
      });
    await db.getRepository(UserRole).save({ userId: user.id, role });
    if (role === "COMPANY_STAFF") staffId = user.id;
    if (role === "SUPERVISOR")
      await db.getRepository(SupervisorProfile).save({ userId: user.id });
  }
  const company = await db
    .getRepository(Company)
    .save({ name: "Browser Test Company" });
  await db
    .getRepository(CompanyStaff)
    .save({ companyId: company.id, userId: staffId, active: true });
  const objects = new Map<string, Buffer>();
  const storage = {
    ready: async () => true,
    onModuleInit: async () => {},
    putStream: async (key: string, stream: Readable) => {
      const chunks = [];
      for await (const chunk of stream) chunks.push(Buffer.from(chunk));
      objects.set(key, Buffer.concat(chunks));
    },
    get: async (key: string) => Readable.from([objects.get(key)!]),
    remove: async (key: string) => {
      objects.delete(key);
    },
    verify: async (key: string) => {
      const value = objects.get(key);
      if (!value) throw new Error("Missing object");
      return {
        size: value.length,
        signature: value.subarray(0, 8),
        sha256: createHash("sha256").update(value).digest("hex"),
      };
    },
  };
  const module = await Test.createTestingModule({
    imports: [
      JwtModule.register({
        global: true,
        secret: "browser-test-secret",
        signOptions: { expiresIn: "7d" },
      }),
      TypeOrmModule.forRoot({
        ...source.options,
        url: process.env.TEST_DATABASE_URL,
        entities,
      } as any),
      ApiModule,
    ],
  })
    .overrideProvider(PrivateStorageService)
    .useValue(storage)
    .compile();
  const app = module.createNestApplication();
  app.setGlobalPrefix("api/v1");
  app.enableCors({ origin: "http://127.0.0.1:5175" });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new ProblemFilter());
  app.get(SchedulerHealthService).success();
  await app.listen(3005, "127.0.0.1");
  const stop = async () => {
    await app.close();
    await db.destroy();
    process.exit(0);
  };
  process.on("SIGTERM", () => void stop());
  process.on("SIGINT", () => void stop());
}
void start().catch((error) => {
  console.error(error);
  process.exit(1);
});
