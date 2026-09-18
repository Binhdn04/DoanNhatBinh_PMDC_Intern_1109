import { configureApi, endpoints } from "@/lib/api";
import { QueryClient } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionProvider, useSession } from "./session";

const user = {
  id: "u1",
  email: "student@example.test",
  fullName: "Student",
  roles: ["STUDENT"] as const,
};
let current: ReturnType<typeof useSession>;
function Probe() {
  current = useSession();
  return <span>{current.ready ? "ready" : "loading"}</span>;
}
function renderSession() {
  const client = new QueryClient();
  return {
    client,
    ...render(
      <SessionProvider client={client}>
        <Probe />
      </SessionProvider>,
    ),
  };
}

describe("SessionProvider", () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("becomes ready for an anonymous visitor", async () => {
    renderSession();
    await waitFor(() => expect(current.ready).toBe(true));
    expect(current.accessToken).toBe("");
  });

  it("restores a session and refreshes /me", async () => {
    sessionStorage.setItem(
      "internhub.session",
      JSON.stringify({ accessToken: "saved", activeRole: "STUDENT", user }),
    );
    vi.spyOn(endpoints, "me").mockResolvedValue({
      id: "u1",
      roles: ["STUDENT"],
      activeRole: "STUDENT",
    });
    renderSession();
    await waitFor(() => expect(current.ready).toBe(true));
    expect(endpoints.me).toHaveBeenCalledOnce();
    expect(current.user.id).toBe("u1");
  });

  it("signs in, changes active role, and signs out while resetting client state", async () => {
    vi.spyOn(endpoints, "signIn").mockResolvedValue({
      accessToken: "new-token",
      tokenType: "Bearer",
      activeRole: "STUDENT",
      user: { ...user, roles: ["STUDENT", "ADMIN"] },
    });
    vi.spyOn(endpoints, "me")
      .mockResolvedValueOnce({
        id: "u1",
        roles: ["STUDENT", "ADMIN"],
        activeRole: "STUDENT",
      })
      .mockResolvedValueOnce({
        id: "u1",
        roles: ["STUDENT", "ADMIN"],
        activeRole: "ADMIN",
      });
    vi.spyOn(endpoints, "setActiveRole").mockResolvedValue({
      accessToken: "admin-token",
      activeRole: "ADMIN",
    });
    vi.spyOn(endpoints, "signOut").mockResolvedValue({ ok: true });
    const { client } = renderSession();
    const clear = vi.spyOn(client, "clear");
    await waitFor(() => expect(current.ready).toBe(true));
    await act(async () => {
      await current.signIn("student@example.test", "password");
    });
    expect(current.accessToken).toBe("new-token");
    await act(async () => {
      await current.changeRole("ADMIN");
    });
    expect(current.activeRole).toBe("ADMIN");
    await act(async () => {
      await current.signOut();
    });
    expect(current.accessToken).toBe("");
    expect(sessionStorage.getItem("internhub.session")).toBeNull();
    expect(clear).toHaveBeenCalled();
  });

  it("cleans up an expired restored session and wires the unauthorized callback", async () => {
    sessionStorage.setItem(
      "internhub.session",
      JSON.stringify({ accessToken: "expired", activeRole: "STUDENT", user }),
    );
    vi.spyOn(endpoints, "me").mockRejectedValue(new Error("expired"));
    const configured = vi.spyOn(await import("@/lib/api"), "configureApi");
    renderSession();
    await waitFor(() => expect(current.ready).toBe(true));
    expect(current.accessToken).toBe("");
    expect(configured).toHaveBeenCalled();
    configureApi({ getToken: () => "", onUnauthorized: () => undefined });
  });
});
