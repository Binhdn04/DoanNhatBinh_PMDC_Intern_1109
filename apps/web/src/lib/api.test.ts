import { afterEach, describe, expect, it, vi } from "vitest";
import { api, configureApi, endpoints, sha256, uploadDocument } from "./api";

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
});
