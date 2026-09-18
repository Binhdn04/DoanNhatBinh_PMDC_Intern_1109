import { MaintenanceService } from "../../src/modules/maintenance.service";
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
  const builder = Test.createTestingModule({
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
  });
  if (process.env.MINIO_INTEGRATION !== "1")
    builder.overrideProvider(PrivateStorageService).useValue(storage);
  const module = await builder.compile();
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
    const user = await db.getRepository(User).save({
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
it("keeps assessment drafts private and validates submission completeness", async () => {
  expect(
    (await request("student", `/placements/${placementId}/self-assessment`))
      .status,
  ).toBe(404);
  expect(
    (
      await request(
        "student",
        `/placements/${placementId}/performance-evaluation`,
      )
    ).status,
  ).toBe(404);
  expect(
    (
      await request(
        "student",
        `/placements/${placementId}/self-assessment`,
        "PUT",
        { status: "DRAFT", ratings: {} },
      )
    ).status,
  ).toBe(200);
  expect(
    (await request("supervisor", `/placements/${placementId}/self-assessment`))
      .status,
  ).toBe(404);
  expect(
    (
      await request(
        "student",
        `/placements/${placementId}/self-assessment`,
        "PUT",
        {
          status: "SUBMITTED",
          ratings: { technical: 7 },
          reflection: "R",
          learningOutcomes: "L",
        },
      )
    ).status,
  ).toBe(400);
  expect(
    (
      await request(
        "student",
        `/placements/${placementId}/self-assessment`,
        "PUT",
        { status: "SUBMITTED", ratings: { technical: 4 } },
      )
    ).status,
  ).toBe(400);
  expect(
    (
      await request(
        "student",
        `/placements/${placementId}/self-assessment`,
        "PUT",
        {
          status: "SUBMITTED",
          ratings: {},
          reflection: "R",
          learningOutcomes: "L",
        },
      )
    ).status,
  ).toBe(400);
  expect(
    (
      await request(
        "supervisor",
        `/placements/${placementId}/performance-evaluation`,
        "PUT",
        { status: "DRAFT", completionDecision: "PENDING", ratings: {} },
      )
    ).status,
  ).toBe(200);
  expect(
    (
      await request(
        "student",
        `/placements/${placementId}/performance-evaluation`,
      )
    ).status,
  ).toBe(404);
  expect(
    (
      await request(
        "admin",
        `/placements/${placementId}/performance-evaluation`,
      )
    ).status,
  ).toBe(200);
  expect(
    (
      await request(
        "supervisor",
        `/placements/${placementId}/performance-evaluation`,
        "PUT",
        {
          status: "SUBMITTED",
          completionDecision: "PASSED",
          ratings: { technical: 0 },
        },
      )
    ).status,
  ).toBe(400);
  // Remove the author draft so the replacement supervisor may author their own evaluation later.
  await db.query("DELETE FROM performance_evaluations WHERE placement_id=$1", [
    placementId,
  ]);
});
it("runs deadline scans idempotently and exposes failed scheduler readiness", async () => {
  const scheduler = app.get(MaintenanceService);
  await db.query(
    "INSERT INTO reporting_periods(placement_id,week_start,week_end,due_at) VALUES($1,'2026-09-07','2026-09-13',now()-interval '1 hour')",
    [placementId],
  );
  await request("other", `/postings/${postingId}/saved`, "PUT");
  await db.query(
    "UPDATE postings SET application_deadline=current_date,deadline_timezone='UTC' WHERE id=$1",
    [postingId],
  );
  await scheduler.scanDeadlines();
  const before = (await request("student", "/notifications")).data.length;
  await scheduler.scanDeadlines();
  expect((await request("student", "/notifications")).data).toHaveLength(
    before,
  );
  expect((await request("", "/health")).status).toBe(200);
  const fail = jest
    .spyOn(scheduler as any, "performDeadlineScan")
    .mockRejectedValueOnce(new Error("Database temporarily unavailable"));
  await scheduler.scanDeadlines();
  expect((await request("", "/health")).status).toBe(503);
  fail.mockRestore();
  await scheduler.scanDeadlines();
  expect((await request("", "/health")).status).toBe(200);
  const content = Buffer.from("%PDF-orphan");
  const started = await request("student", "/documents", "POST", {
    originalName: "orphan.pdf",
    contentType: "application/pdf",
    sizeBytes: content.length,
    sha256: createHash("sha256").update(content).digest("hex"),
  });
  await db.query(
    "UPDATE documents SET created_at=now()-interval '2 days' WHERE id=$1",
    [started.data.document.id],
  );
  await scheduler.cleanupDocuments();
  const [doc] = await db.query(
    "SELECT state,storage_deleted_at FROM documents WHERE id=$1",
    [started.data.document.id],
  );
  expect(doc.state).toBe("DELETED");
  expect(doc.storage_deleted_at).not.toBeNull();
  await scheduler.cleanupDocuments();
  await db.query(
    "UPDATE postings SET application_deadline='2099-12-31' WHERE id=$1",
    [postingId],
  );
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
it("updates profiles and preferences without accepting duplicate or unknown skills", async () => {
  expect((await request("student", "/students/me")).status).toBe(200);
  expect(
    (
      await request("student", "/students/me", "PATCH", {
        university: "Updated",
        major: "Engineering",
        graduationYear: 2027,
        bio: "Testing",
      })
    ).data.university,
  ).toBe("Updated");
  const pref = {
    industries: ["Technology"],
    locations: ["Hanoi"],
    workArrangements: ["REMOTE"],
    minDurationWeeks: 8,
    maxDurationWeeks: 16,
  };
  expect((await request("student", "/students/me/preferences")).status).toBe(
    200,
  );
  expect(
    (await request("student", "/students/me/preferences", "PUT", pref)).status,
  ).toBe(200);
  expect(
    (
      await request("student", "/students/me/preferences", "PUT", {
        ...pref,
        minDurationWeeks: 20,
      })
    ).status,
  ).toBe(400);
  const skills = (await request("student", "/students/me/skills")).data;
  expect(
    (
      await request("student", "/students/me/skills", "PUT", {
        skills: [{ id: skills[0].id, proficiency: "BEGINNER" }],
      })
    ).status,
  ).toBe(200);
  expect(
    (
      await request("student", "/students/me/skills", "PUT", {
        skills: [{ id: randomUUID() }],
      })
    ).status,
  ).toBe(400);
  expect(
    (await request("student", "/students/me/skills", "PUT", { skills: [{}] }))
      .status,
  ).toBe(400);
  expect(
    (
      await request("student", "/students/me/skills", "PUT", {
        skills: [{ name: "TypeScript" }, { name: " TYPESCRIPT " }],
      })
    ).status,
  ).toBe(400);
  expect((await request("student", "/students/me/skills")).data).toHaveLength(
    1,
  );
});
it("paginates and scopes listing and search endpoints", async () => {
  for (const role of ["student", "staff", "outsider", "admin", "replacement"]) {
    expect(
      (await request(role, "/postings?page=1&pageSize=1&sort=newest")).status,
    ).toBe(200);
    expect(
      (await request(role, "/applications?page=1&pageSize=1")).status,
    ).toBe(200);
    expect((await request(role, "/placements?page=1&pageSize=1")).status).toBe(
      200,
    );
  }
  expect(
    (
      await request(
        "student",
        "/postings?search=Internship&sort=match_score&workArrangement=REMOTE",
      )
    ).data,
  ).toHaveLength(1);
  expect(
    (
      await request(
        "student",
        "/postings?search=NoSuchInternship&location=Nowhere",
      )
    ).data,
  ).toEqual([]);
  expect((await request("student", "/postings?page=0")).status).toBe(400);
  expect(
    (await request("student", `/postings/${postingId}`)).data.match.score,
  ).toBe(100);
  expect((await request("staff", `/companies/${companyId}`)).status).toBe(200);
  expect((await request("staff", `/companies/${randomUUID()}`)).status).toBe(
    404,
  );
  expect((await request("staff", "/companies/mine")).data[0].id).toBe(
    companyId,
  );
  expect((await request("outsider", "/companies/mine")).data).toEqual([]);
  expect((await request("staff", "/supervisors")).status).toBe(400);
  expect(
    (
      await request(
        "admin",
        `/supervisors?placementId=${placementId}&search=replacement`,
      )
    ).data.items,
  ).toHaveLength(1);
  expect(
    (await request("outsider", `/supervisors?applicationId=${applicationId}`))
      .status,
  ).toBe(403);
  expect(
    (await request("staff", `/supervisors?applicationId=${randomUUID()}`))
      .status,
  ).toBe(404);
  expect((await request("student", `/placements/${randomUUID()}`)).status).toBe(
    404,
  );
  expect(
    (await request("student", `/applications/${randomUUID()}`)).status,
  ).toBe(404);
});
it("keeps completed placement records readable and rejects further writes", async () => {
  for (const role of ["student", "replacement", "admin"]) {
    expect((await request(role, `/placements/${placementId}`)).status).toBe(
      200,
    );
    expect(
      (await request(role, `/placements/${placementId}/reports`)).data,
    ).toHaveLength(1);
    expect(
      (await request(role, `/placements/${placementId}/self-assessment`)).data
        .status,
    ).toBe("SUBMITTED");
    expect(
      (await request(role, `/placements/${placementId}/performance-evaluation`))
        .data.completionDecision,
    ).toBe("PASSED");
  }
  expect(
    (await request("staff", `/placements/${placementId}/self-assessment`))
      .status,
  ).toBe(404);
  expect(
    (await request("student", `/placements/${placementId}/tasks`)).data,
  ).toHaveLength(1);
  expect(
    (
      await request("replacement", `/placements/${placementId}/tasks`, "POST", {
        title: "Late",
        description: "No",
        priority: "MEDIUM",
      })
    ).status,
  ).toBe(409);
  expect(
    (
      await request(
        "replacement",
        `/placements/${placementId}/lifecycle`,
        "POST",
        { targetStatus: "TERMINATED" },
      )
    ).status,
  ).toBe(409);
  expect(
    (
      await request(
        "student",
        `/placements/${placementId}/self-assessment`,
        "PUT",
        { status: "DRAFT", ratings: {} },
      )
    ).status,
  ).toBe(409);
  expect(
    (
      await request(
        "replacement",
        `/placements/${placementId}/performance-evaluation`,
        "PUT",
        { status: "DRAFT", completionDecision: "PENDING", ratings: {} },
      )
    ).status,
  ).toBe(409);
  expect(
    (
      await request(
        "admin",
        `/placements/${placementId}/supervisor-assignments`,
        "PUT",
        { reason: "Late reassignment", supervisorUserId: ids.supervisor },
      )
    ).status,
  ).toBe(409);
});
it("issues authorized download tokens and denies expiry, tampering and reuse by another user", async () => {
  const result = await request("student", `/documents/${cvId}/download-url`);
  expect(result.status).toBe(200);
  const url = new URL(result.data.url, origin);
  const downloaded = await fetch(url, {
    headers: { authorization: `Bearer ${tokens.student}` },
  });
  expect(downloaded.status).toBe(200);
  expect(await downloaded.text()).toBe("%PDF-test-content");
  expect(
    (await fetch(url, { headers: { authorization: `Bearer ${tokens.staff}` } }))
      .status,
  ).toBe(403);
  url.searchParams.set("transferToken", "invalid");
  expect(
    (
      await fetch(url, {
        headers: { authorization: `Bearer ${tokens.student}` },
      })
    ).status,
  ).toBe(403);
  expect(
    (await request("staff", `/documents/${cvId}/download-url`)).status,
  ).toBe(200);
  expect(
    (await request("replacement", `/documents/${cvId}/download-url`)).status,
  ).toBe(200);
  expect(
    (await request("student", `/documents/${randomUUID()}/complete`, "POST"))
      .status,
  ).toBe(404);
});
it("rejects invalid document content and allows unreferenced document deletion", async () => {
  const content = Buffer.from("not-a-pdf");
  const begin = await request("student", "/documents", "POST", {
    originalName: "bad.pdf",
    contentType: "application/pdf",
    sizeBytes: content.length,
    sha256: createHash("sha256").update(content).digest("hex"),
  });
  const url = new URL(begin.data.uploadUrl, origin);
  expect(
    (
      await fetch(url, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${tokens.student}`,
          "content-type": "application/pdf",
        },
        body: content,
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await request(
        "student",
        `/documents/${begin.data.document.id}/complete`,
        "POST",
      )
    ).data.state,
  ).toBe("REJECTED");
  expect(
    (
      await request(
        "student",
        `/documents/${begin.data.document.id}/complete`,
        "POST",
      )
    ).status,
  ).toBe(409);
  expect(
    (await request("student", `/documents/${begin.data.document.id}`, "DELETE"))
      .status,
  ).toBe(204);
  expect(
    (await request("student", "/documents")).data.items.map(
      (d: { id: string }) => d.id,
    ),
  ).not.toContain(begin.data.document.id);
});
it("supports saved-posting removal, withdrawal, rejection and posting close/archive", async () => {
  expect(
    (await request("student", `/postings/${postingId}/saved`, "PUT")).status,
  ).toBe(200);
  expect(
    (await request("student", `/postings/${postingId}/saved`, "DELETE")).status,
  ).toBe(200);
  const body = {
    companyId,
    title: "Second role",
    description: "Role",
    workArrangement: "ONSITE",
    durationWeeks: 8,
    openings: 1,
    applicationDeadline: "2099-12-31",
    skills: [],
  };
  const second = await request("staff", "/postings", "POST", body);
  expect(second.status).toBe(201);
  const id = second.data.id;
  expect(
    (await request("staff", `/postings/${id}/publish`, "POST")).status,
  ).toBe(201);
  const input = {
    postingId: id,
    cvDocumentId: cvId,
    coverNote: "Ready",
    contactName: "Student",
    contactEmail: "student@example.test",
    contactPhone: "123",
    university: "University",
    major: "CS",
    graduationYear: 2027,
    availability: "Now",
    supportingDocumentIds: [cvId],
  };
  const application = await request("student", "/applications", "POST", input);
  expect(application.status).toBe(201);
  expect(
    (
      await request(
        "student",
        `/applications/${application.data.id}/withdraw`,
        "POST",
      )
    ).status,
  ).toBe(201);
  expect(
    (
      await request(
        "student",
        `/applications/${application.data.id}/withdraw`,
        "POST",
      )
    ).status,
  ).toBe(409);
  for (const targetStatus of ["CLOSED", "ARCHIVED"])
    expect(
      (
        await request("staff", `/postings/${id}/lifecycle`, "POST", {
          targetStatus,
        })
      ).status,
    ).toBe(201);
  expect(
    (await request("staff", `/postings/${id}/publish`, "POST")).status,
  ).toBe(409);
  expect(
    (await request("student", "/applications", "POST", input)).status,
  ).toBe(409);
  expect(
    (await request("student", "/notifications/mark-read", "POST")).status,
  ).toBe(201);
  expect(
    (await request("student", "/notifications")).data.every(
      (n: { readAt: string }) => Boolean(n.readAt),
    ),
  ).toBe(true);
});
it("replaces active-role tokens and revokes signed-out sessions", async () => {
  await db
    .getRepository(UserRole)
    .save({ userId: ids.outsider, role: "STUDENT" });
  const login = await request("", "/auth/sign-in", "POST", {
    email: "outsider@example.test",
    password: "Test-password1!",
  });
  expect(login.status).toBe(201);
  tokens.outsider = login.data.accessToken;
  expect(
    (await request("outsider", "/me/active-role", "PUT", { role: "ADMIN" }))
      .status,
  ).toBe(403);
  const switched = await request("outsider", "/me/active-role", "PUT", {
    role: "STUDENT",
  });
  expect(switched.status).toBe(200);
  expect((await request("outsider", "/me")).status).toBe(401);
  tokens.outsider = switched.data.accessToken;
  expect((await request("outsider", "/me")).data.activeRole).toBe("STUDENT");
  expect(
    (await request("outsider", "/me/active-role", "PUT", { role: "STUDENT" }))
      .status,
  ).toBe(200);
  expect((await request("outsider", "/auth/sign-out", "POST")).status).toBe(
    201,
  );
  expect((await request("outsider", "/me")).status).toBe(401);
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
it.each([
 ['image/jpeg',Buffer.from([0xff,0xd8,0xff,0xe0,1,2,3,4])],
 ['image/png',Buffer.from([137,80,78,71,13,10,26,10])],
 ['application/vnd.openxmlformats-officedocument.wordprocessingml.document',Buffer.from([0x50,0x4b,0x03,0x04,1,2,3,4])],
])('validates %s transfers and refuses overwriting completed documents',async(contentType,content)=>{
 const started=await request('student','/documents','POST',{originalName:'attachment',contentType,sizeBytes:content.length,sha256:createHash('sha256').update(content).digest('hex')});expect(started.status).toBe(201);
 const url=new URL(started.data.uploadUrl,origin);const upload=()=>fetch(url,{method:'PUT',headers:{authorization:`Bearer ${tokens.student}`,'content-type':contentType},body:content});
 expect((await upload()).status).toBe(204);expect((await request('student',`/documents/${started.data.document.id}/complete`,'POST')).data.state).toBe('AVAILABLE');
 expect((await upload()).status).toBe(409);expect((await request('student',`/documents/${started.data.document.id}/complete`,'POST')).data.state).toBe('AVAILABLE');
});
