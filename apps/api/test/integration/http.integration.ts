import "reflect-metadata";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { createHash, randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import * as bcrypt from "bcrypt";
import source from "../../src/infrastructure/database/data-source";
import {
  entities,
  User,
  UserRole,
  Company,
  CompanyStaff,
  SupervisorProfile,
  Document,
  AuthSession,
} from "../../src/infrastructure/database/entities";
import { ApiModule } from "../../src/modules/api.module";
import { ProblemFilter } from "../../src/modules/problem.filter";
import { PrivateStorageService } from "../../src/modules/private-storage.service";

let app: INestApplication, db: DataSource, origin: string;
const tokens: Record<string, string> = {},
  ids: Record<string, string> = {};
let companyId: string,
  postingId: string,
  applicationId: string,
  placementId: string,
  reportId: string,
  versionId: string,
  cvId: string;
const bytes = new Map<string, Buffer>();
const storage = {
  onModuleInit: async () => {},
  ready: async () => true,
  putStream: async (key: string, stream: Readable) => {
    const chunks = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    bytes.set(key, Buffer.concat(chunks));
  },
  get: async (key: string) => Readable.from([bytes.get(key)!]),
  remove: async (key: string) => {
    bytes.delete(key);
  },
  verify: async (key: string) => {
    const body = bytes.get(key);
    if (!body) throw new Error("Not found");
    return {
      size: body.length,
      sha256: createHash("sha256").update(body).digest("hex"),
      signature: body.subarray(0, 8),
    };
  },
};
async function request(
  role: string,
  path: string,
  method = "GET",
  body?: unknown,
) {
  const response = await fetch(origin + path, {
    method,
    headers: {
      ...(role ? { authorization: `Bearer ${tokens[role]}` } : {}),
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}
beforeAll(async () => {
  if (!process.env.TEST_DATABASE_URL?.includes("/internhub_test"))
    throw new Error("Isolated TEST_DATABASE_URL required");
  db = new DataSource({
    ...source.options,
    url: process.env.TEST_DATABASE_URL,
  } as any);
  await db.initialize();
  await db.runMigrations();
  const module = await Test.createTestingModule({
    imports: [
      JwtModule.register({
        global: true,
        secret: "integration-secret",
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
  app = module.createNestApplication();
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new ProblemFilter());
  await app.listen(0, "127.0.0.1");
  origin = (await app.getUrl()) + "/api/v1";
  const hash = await bcrypt.hash("Test-password1!", 4);
  for (const [key, role] of Object.entries({
    student: "STUDENT",
    other: "STUDENT",
    staff: "COMPANY_STAFF",
    outsider: "COMPANY_STAFF",
    supervisor: "SUPERVISOR",
    replacement: "SUPERVISOR",
    admin: "ADMIN",
  })) {
    const user = await db
      .getRepository(User)
      .save({
        email: `${key}@example.test`,
        fullName: key,
        passwordHash: hash,
      });
    ids[key] = user.id;
    await db
      .getRepository(UserRole)
      .save({ userId: user.id, role: role as any });
    if (role === "SUPERVISOR")
      await db.getRepository(SupervisorProfile).save({ userId: user.id });
    const result = await request("", "/auth/sign-in", "POST", {
      email: user.email,
      password: "Test-password1!",
    });
    expect(result.status).toBe(201);
    tokens[key] = result.data.accessToken;
  }
  companyId = (await db.getRepository(Company).save({ name: "Test Company" }))
    .id;
  await db
    .getRepository(CompanyStaff)
    .save({ companyId, userId: ids.staff, active: true });
});
afterAll(async () => {
  await app?.close();
  await db?.destroy();
});
it("validates real HTTP bodies and rejects unknown entity fields", async () => {
  expect(
    (
      await request("student", "/students/me", "PATCH", {
        userId: ids.other,
        bio: "attack",
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await request("student", "/students/me/skills", "PUT", {
        skills: [{ name: "TypeScript", proficiency: "PROFICIENT" }],
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await request("student", "/students/me/skills", "PUT", {
        skills: [{ name: "TypeScript", proficiency: "ADVANCED" }],
      })
    ).status,
  ).toBe(200);
  expect((await request("student", "/students/me/skills")).data[0].name).toBe(
    "TypeScript",
  );
  expect((await request("student", "/postings", "POST", {})).status).toBe(403);
  expect(
    (
      await request("student", "/ai-jobs", "POST", {
        kind: "MATCH_EXPLANATION",
        postingId: randomUUID(),
      })
    ).status,
  ).toBe(503);
});
it("publishes a posting and protects draft visibility and IDs", async () => {
  const body = {
    companyId,
    title: "Internship",
    description: "A real internship",
    workArrangement: "REMOTE",
    durationWeeks: 12,
    openings: 2,
    applicationDeadline: "2099-12-31",
    skills: [{ name: "TypeScript", importance: "REQUIRED" }],
  };
  expect(
    (await request("staff", "/postings", "POST", { ...body, id: randomUUID() }))
      .status,
  ).toBe(400);
  const created = await request("staff", "/postings", "POST", body);
  expect(created.status).toBe(201);
  postingId = created.data.id;
  expect((await request("student", `/postings/${postingId}`)).status).toBe(403);
  expect(
    (await request("outsider", `/postings/${postingId}/publish`, "POST"))
      .status,
  ).toBe(403);
  expect(
    (await request("staff", `/postings/${postingId}/publish`, "POST")).status,
  ).toBe(201);
  const postings = await request("student", "/postings");
  expect(postings.data[0].match.score).toBe(100);
});
it("streams verified documents, completes them, and hides storage keys", async () => {
  const content = Buffer.from("%PDF-test-content");
  const started = await request("student", "/documents", "POST", {
    originalName: "cv.pdf",
    contentType: "application/pdf",
    sizeBytes: content.length,
    sha256: createHash("sha256").update(content).digest("hex"),
  });
  expect(started.status).toBe(201);
  cvId = started.data.document.id;
  expect(started.data.document.objectKey).toBeUndefined();
  const url = new URL(started.data.uploadUrl, origin);
  const token = url.searchParams.get("transferToken")!;
  const claim = app.get(JwtService).decode(token);
  expect(claim.exp - claim.iat).toBe(300);
  const uploaded = await fetch(url.href, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${tokens.student}`,
      "content-type": "application/pdf",
    },
    body: content,
  });
  expect(uploaded.status).toBe(204);
  expect(
    (await request("student", `/documents/${cvId}/complete`, "POST")).data
      .state,
  ).toBe("AVAILABLE");
  expect(
    (await request("student", "/documents")).data.items[0].objectKey,
  ).toBeUndefined();
  expect(
    (await request("other", `/documents/${cvId}/download-url`)).status,
  ).toBe(404);
});
it("rejects foreign CVs, duplicates, and unrelated application reads", async () => {
  const body = {
    postingId,
    cvDocumentId: cvId,
    coverNote: "Ready",
    contactName: "Student",
    contactEmail: "student@example.test",
    university: "University",
    major: "CS",
    availability: "Now",
  };
  expect((await request("other", "/applications", "POST", body)).status).toBe(
    400,
  );
  const created = await request("student", "/applications", "POST", body);
  expect(created.status).toBe(201);
  applicationId = created.data.id;
  expect((await request("student", "/applications", "POST", body)).status).toBe(
    409,
  );
  expect(
    (await request("outsider", `/applications/${applicationId}`)).status,
  ).toBe(403);
  expect(
    (await request("supervisor", `/applications/${applicationId}`)).status,
  ).toBe(403);
  expect(
    (await request("other", `/applications/${applicationId}`)).status,
  ).toBe(403);
  expect(
    (await request("staff", `/applications/${applicationId}`)).status,
  ).toBe(200);
  expect(
    (await request("student", `/documents/${cvId}`, "DELETE")).status,
  ).toBe(409);
});
it("progresses and accepts atomically, including concurrent identical replay", async () => {
  expect(
    (await request("staff", `/supervisors?applicationId=${applicationId}`))
      .status,
  ).toBe(200);
  for (const targetStatus of ["UNDER_REVIEW", "INTERVIEW"])
    expect(
      (
        await request(
          "staff",
          `/applications/${applicationId}/status`,
          "POST",
          { targetStatus },
        )
      ).status,
    ).toBe(201);
  const body = {
    targetStatus: "ACCEPTED",
    supervisorUserId: ids.supervisor,
    startDate: "2026-09-14",
    endDate: "2026-12-31",
  };
  const results = await Promise.all([
    request("staff", `/applications/${applicationId}/status`, "POST", body),
    request("staff", `/applications/${applicationId}/status`, "POST", body),
  ]);
  expect(results.map((r) => r.status)).toEqual([201, 201]);
  placementId = results[0].data.placement.id;
  expect(results[1].data.placement.id).toBe(placementId);
  expect(
    (
      await request("staff", `/applications/${applicationId}/status`, "POST", {
        ...body,
        endDate: "2027-01-01",
      })
    ).status,
  ).toBe(409);
  expect(
    (
      await db.query("SELECT * FROM placements WHERE application_id=$1", [
        applicationId,
      ])
    ).length,
  ).toBe(1);
  expect((await request("supervisor", "/placements")).data[0].id).toBe(
    placementId,
  );
});
it("assigns tasks, scopes status writes, and preserves immutable report versions", async () => {
  const task = await request(
    "supervisor",
    `/placements/${placementId}/tasks`,
    "POST",
    { title: "First task", description: "Implement a test", priority: "HIGH" },
  );
  expect(task.status).toBe(201);
  expect(
    (
      await request(
        "other",
        `/placements/${placementId}/tasks/${task.data.id}/status`,
        "PATCH",
        { status: "DONE" },
      )
    ).status,
  ).toBe(403);
  expect(
    (
      await request(
        "student",
        `/placements/${placementId}/tasks/${task.data.id}/status`,
        "PATCH",
        { status: "DONE" },
      )
    ).status,
  ).toBe(200);
  const periods = await request(
    "student",
    `/placements/${placementId}/reporting-periods`,
  );
  const draft = {
    reportingPeriodId: periods.data[0].id,
    accomplishments: "A",
    challenges: "B",
    nextWeekPlan: "C",
    attachmentDocumentIds: [cvId],
  };
  const created = await request(
    "student",
    `/placements/${placementId}/reports`,
    "POST",
    draft,
  );
  expect(created.status).toBe(201);
  reportId = created.data.id;
  expect((await request("supervisor", `/reports/${reportId}`)).status).toBe(
    404,
  );
  expect(
    (await request("student", `/reports/${reportId}/submit`, "POST")).status,
  ).toBe(201);
  const submitted = await request("student", `/reports/${reportId}`);
  versionId = submitted.data.versions[0].id;
  expect(submitted.data.draft).toBeUndefined();
  expect(
    (
      await db.query(
        "SELECT draft_saved_at,draft_accomplishments FROM weekly_reports WHERE id=$1",
        [reportId],
      )
    )[0],
  ).toEqual({ draft_saved_at: null, draft_accomplishments: null });
  expect(
    (
      await request(
        "student",
        `/placements/${placementId}/reports`,
        "POST",
        draft,
      )
    ).status,
  ).toBe(409);
  expect(
    (
      await request("supervisor", `/reports/${reportId}/reviews`, "POST", {
        reportVersionId: versionId,
        outcome: "REVISION_REQUESTED",
        feedback: "Add specifics",
      })
    ).status,
  ).toBe(201);
  expect(
    (
      await request("student", `/reports/${reportId}`, "PATCH", {
        ...draft,
        accomplishments: "Revised",
      })
    ).status,
  ).toBe(200);
  expect(
    (await request("supervisor", `/reports/${reportId}`)).data.draft,
  ).toBeUndefined();
  expect(
    (await request("student", `/reports/${reportId}/submit`, "POST")).status,
  ).toBe(201);
  expect(
    (
      await request("supervisor", `/reports/${reportId}/reviews`, "POST", {
        reportVersionId: versionId,
        outcome: "APPROVED",
      })
    ).status,
  ).toBe(409);
  await expect(
    db.query("UPDATE report_versions SET accomplishments=$1 WHERE id=$2", [
      "tamper",
      versionId,
    ]),
  ).rejects.toThrow("immutable");
});
it("immediately denies revoked supervisors, including linked documents", async () => {
  const history = await request(
    "admin",
    `/placements/${placementId}/supervisor-assignments`,
  );
  expect(
    (
      await request(
        "admin",
        `/placements/${placementId}/supervisor-assignments`,
        "PUT",
        {
          expectedAssignmentId: history.data[0].id,
          supervisorUserId: ids.replacement,
          reason: "Reassigned",
        },
      )
    ).status,
  ).toBe(200);
  expect((await request("supervisor", `/reports/${reportId}`)).status).toBe(
    403,
  );
  expect(
    (await request("supervisor", `/documents/${cvId}/download-url`)).status,
  ).toBe(403);
  expect((await request("replacement", `/reports/${reportId}`)).status).toBe(
    200,
  );
});
it("scopes monitoring, notifications and terminal writes", async () => {
  expect((await request("student", "/monitoring")).status).toBe(403);
  const monitor = await request("admin", "/monitoring");
  expect(monitor.data.tasks.DONE).toBe(1);
  expect(
    (await request("admin", `/monitoring?programId=${randomUUID()}`)).data
      .applications,
  ).toEqual({});
  const notifications = await request("student", "/notifications");
  expect(notifications.data.length).toBeGreaterThan(0);
  expect(
    (
      await request(
        "other",
        `/notifications/${notifications.data[0].id}/read`,
        "POST",
      )
    ).data.updated,
  ).toBe(0);
  expect(
    (
      await request(
        "student",
        `/placements/${placementId}/self-assessment`,
        "PUT",
        {
          status: "SUBMITTED",
          ratings: { technical: 4 },
          reflection: "Learned",
          learningOutcomes: "Testing",
        },
      )
    ).status,
  ).toBe(200);
  expect(
    (
      await request(
        "replacement",
        `/placements/${placementId}/performance-evaluation`,
        "PUT",
        {
          status: "SUBMITTED",
          ratings: { technical: 4 },
          completionDecision: "PASSED",
        },
      )
    ).status,
  ).toBe(200);
  expect(
    (
      await request(
        "replacement",
        `/placements/${placementId}/lifecycle`,
        "POST",
        { targetStatus: "COMPLETED" },
      )
    ).status,
  ).toBe(201);
  expect(
    (
      await request("student", `/reports/${reportId}`, "PATCH", {
        accomplishments: "A",
        challenges: "B",
        nextWeekPlan: "C",
      })
    ).status,
  ).toBe(403);
});
it("rejects expired sessions and session/subject mismatches", async () => {
  const jwt = app.get(JwtService);
  const claim = jwt.decode(tokens.other);
  delete claim.exp;
  delete claim.iat;
  tokens.other = jwt.sign({ ...claim, id: ids.student });
  expect((await request("other", "/me")).status).toBe(401);
  await db
    .getRepository(AuthSession)
    .update(claim.sid, { expiresAt: new Date(0) });
  tokens.other = jwt.sign(claim);
  expect((await request("other", "/me")).status).toBe(401);
});
