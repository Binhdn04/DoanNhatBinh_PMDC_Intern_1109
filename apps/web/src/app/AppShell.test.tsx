import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import AppShell from "./AppShell";

afterEach(() => {
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
  vi.unstubAllGlobals();
});

it("does not retry client errors from queries rendered through the app shell", async () => {
  window.history.replaceState({}, "", "/discover");
  sessionStorage.setItem(
    "internhub.session",
    JSON.stringify({
      accessToken: "token",
      activeRole: "STUDENT",
      user: {
        id: "student-1",
        email: "student@example.test",
        fullName: "Student",
        roles: ["STUDENT"],
      },
    }),
  );
  const fetchMock = vi.fn(async (input: RequestInfo | URL) =>
    String(input).endsWith("/me")
      ? new Response(
          JSON.stringify({
            id: "student-1",
            roles: ["STUDENT"],
            activeRole: "STUDENT",
          }),
          { headers: { "content-type": "application/json" } },
        )
      : new Response(JSON.stringify({ message: "Not found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        }),
  );
  vi.stubGlobal("fetch", fetchMock);
  render(<AppShell />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Not found");
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
});
