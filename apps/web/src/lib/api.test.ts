import { afterEach, describe, expect, it, vi } from "vitest";
import {
  api,
  configureApi,
  downloadDocument,
  endpoints,
  sha256,
  transferUrl,
  uploadDocument,
} from "./api";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "/api/v1").replace(
  /\/$/,
  "",
);

describe("API client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("adds the bearer token and parses JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    configureApi({
      getToken: () => "token-1",
      onUnauthorized: () => undefined,
    });
    await expect(api<{ ok: boolean }>("/health")).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock.mock.calls[0][1].headers.get("Authorization")).toBe(
      "Bearer token-1",
    );
  });

  it("maps a 401 response and clears the session through its callback", async () => {
    const unauthorized = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Expired" }), {
          status: 401,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    configureApi({ getToken: () => "expired", onUnauthorized: unauthorized });
    await expect(api("/me")).rejects.toMatchObject({
      status: 401,
      message: "Expired",
    });
    expect(unauthorized).toHaveBeenCalledOnce();
  });

  it("sets JSON content type but preserves FormData requests", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response("{}", { headers: { "content-type": "application/json" } }),
      );
    vi.stubGlobal("fetch", fetchMock);
    await api("/json", { method: "POST", body: JSON.stringify({ ok: true }) });
    await api("/form", { method: "POST", body: new FormData() });
    expect(fetchMock.mock.calls[0][1].headers.get("Content-Type")).toBe(
      "application/json",
    );
    expect(fetchMock.mock.calls[1][1].headers.has("Content-Type")).toBe(false);
  });

  it("uses endpoint method, payload, and encoded query values", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response("{}", { headers: { "content-type": "application/json" } }),
      );
    vi.stubGlobal("fetch", fetchMock);
    await endpoints.setActiveRole("ADMIN");
    await endpoints.supervisors("app/id", "A B");
    expect(fetchMock.mock.calls[0][0]).toBe(`${apiBaseUrl}/me/active-role`);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "PUT",
      body: JSON.stringify({ role: "ADMIN" }),
    });
    expect(fetchMock.mock.calls[1][0]).toBe(
      `${apiBaseUrl}/supervisors?applicationId=app%2Fid&search=A%20B`,
    );
  });

  it("sends the documented endpoint contracts for workflow mutations", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response("{}", { headers: { "content-type": "application/json" } }),
      );
    vi.stubGlobal("fetch", fetchMock);
    await endpoints.postingLifecycle("posting-1", "OPEN");
    await endpoints.transition("application-1", "REVIEWING");
    await endpoints.createTask("placement-1", { title: "Review" });
    await endpoints.taskStatus("placement-1", "task-1", "DONE");
    await endpoints.accept("application-1", {
      targetStatus: "ACCEPTED",
      supervisorUserId: "supervisor-1",
      startDate: "2026-01-01",
      endDate: "2026-02-01",
    });
    await endpoints.changeAssignment("placement-1", {
      expectedAssignmentId: null,
      supervisorUserId: "supervisor-1",
      reason: "Capacity",
    });
    expect(
      fetchMock.mock.calls.map(([url, init]) => [
        url,
        init?.method,
        init?.body,
      ]),
    ).toEqual([
      [
        `${apiBaseUrl}/postings/posting-1/lifecycle`,
        "POST",
        JSON.stringify({ targetStatus: "OPEN" }),
      ],
      [
        `${apiBaseUrl}/applications/application-1/status`,
        "POST",
        JSON.stringify({ targetStatus: "REVIEWING" }),
      ],
      [
        `${apiBaseUrl}/placements/placement-1/tasks`,
        "POST",
        JSON.stringify({ title: "Review" }),
      ],
      [
        `${apiBaseUrl}/placements/placement-1/tasks/task-1/status`,
        "PATCH",
        JSON.stringify({ status: "DONE" }),
      ],
      [
        `${apiBaseUrl}/applications/application-1/status`,
        "POST",
        expect.any(String),
      ],
      [
        `${apiBaseUrl}/placements/placement-1/supervisor-assignments`,
        "PUT",
        JSON.stringify({
          expectedAssignmentId: null,
          supervisorUserId: "supervisor-1",
          reason: "Capacity",
        }),
      ],
    ]);
    expect(JSON.parse(fetchMock.mock.calls[4][1].body)).toMatchObject({
      targetStatus: "ACCEPTED",
      supervisorUserId: "supervisor-1",
    });
  });

  it("uses pagination and optional-query defaults in list requests", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response("{}", { headers: { "content-type": "application/json" } }),
      );
    vi.stubGlobal("fetch", fetchMock);
    await endpoints.placements();
    await endpoints.tasks("placement-1");
    await endpoints.notifications(2);
    await endpoints.postings({ search: "React", page: 2 });
    await endpoints.monitoring();
    await endpoints.adminUsers();
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `${apiBaseUrl}/placements?page=1`,
      `${apiBaseUrl}/placements/placement-1/tasks?page=1`,
      `${apiBaseUrl}/notifications?page=2`,
      `${apiBaseUrl}/postings?search=React&page=2`,
      `${apiBaseUrl}/monitoring`,
      `${apiBaseUrl}/admin/users?search=&page=1`,
    ]);
  });

  it("keeps API errors useful for text, empty JSON, and status-only responses", async () => {
    const unauthorized = vi.fn();
    configureApi({ getToken: () => "", onUnauthorized: unauthorized });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response("Gateway unavailable", {
            status: 503,
            statusText: "Service Unavailable",
          }),
        )
        .mockResolvedValueOnce(
          new Response("not json", {
            status: 400,
            statusText: "Bad Request",
            headers: { "content-type": "application/json" },
          }),
        )
        .mockResolvedValueOnce(
          new Response("", { status: 401, statusText: "Unauthorized" }),
        ),
    );
    await expect(api("/text")).rejects.toMatchObject({
      message: "Service Unavailable",
      detail: "Gateway unavailable",
    });
    await expect(api("/invalid-json")).rejects.toMatchObject({
      message: "Bad Request",
    });
    await expect(api("/unauthorized")).rejects.toMatchObject({
      message: "Unauthorized",
    });
    expect(unauthorized).toHaveBeenCalledOnce();
  });

  it("hashes and uploads a document before completing it", async () => {
    const digest = new Uint8Array(32).fill(10).buffer;
    vi.stubGlobal("crypto", {
      subtle: { digest: vi.fn().mockResolvedValue(digest) },
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            document: { id: "doc-1" },
            uploadUrl: "http://localhost:3000/api/v1/documents/doc-1/content",
          }),
          { headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "doc-1", state: "AVAILABLE" }), {
          headers: { "content-type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["hello"], "cv.pdf", { type: "application/pdf" });
    await expect(sha256(file)).resolves.toBe("0a".repeat(32));
    await expect(uploadDocument(file)).resolves.toMatchObject({ id: "doc-1" });
    expect(fetchMock.mock.calls[1][0]).toBe(
      "http://localhost:3000/api/v1/documents/doc-1/content",
    );
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "PUT",
      body: file,
    });
  });

  it("rejects untrusted document URLs and downloads trusted files", async () => {
    expect(() => transferUrl("https://files.example.test/document")).toThrow(
      "Unexpected file transfer origin",
    );
    vi.spyOn(endpoints, "downloadUrl").mockResolvedValue({
      url: "/api/v1/documents/doc-1/content",
    });
    const click = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(click);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("file")));
    vi.stubGlobal("URL", URL);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:document");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    await downloadDocument("doc-1", "cv.pdf");
    expect(click).toHaveBeenCalledOnce();
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
  });
});
