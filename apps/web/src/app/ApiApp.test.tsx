import { ApiError, endpoints, type AdminUser } from "@/lib/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import ApiApp, { numberValue, split, sum, tone, validateFile } from "./ApiApp";
import { SessionProvider } from "./session";

const user = {
  id: "u1",
  email: "student@example.test",
  fullName: "Student",
  roles: ["STUDENT"],
};
function setup(path: string, role = "STUDENT") {
  sessionStorage.setItem(
    "internhub.session",
    JSON.stringify({
      accessToken: "token",
      activeRole: role,
      user: { ...user, roles: role === "ADMIN" ? ["ADMIN"] : ["STUDENT"] },
    }),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <SessionProvider client={client}>
          <ApiApp />
        </SessionProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
describe("ApiApp utilities and routes", () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });
  it("normalizes view helper inputs and rejects unsafe files", () => {
    expect(tone("REJECTED")).toBe("red");
    expect(tone("OPEN")).toBe("green");
    expect(tone("DRAFT")).toBe("amber");
    expect(split(" React, , TypeScript ")).toEqual(["React", "TypeScript"]);
    expect(numberValue("4")).toBe(4);
    expect(numberValue("0")).toBeUndefined();
    expect(numberValue(null)).toBeUndefined();
    expect(sum({ one: 2, text: "x", two: 3 })).toBe(5);
    expect(sum(null)).toBe(0);
    expect(() =>
      validateFile(
        new File(["x"], "bad.exe", { type: "application/octet-stream" }),
      ),
    ).toThrow("Only PDF");
    expect(() =>
      validateFile(
        new File([new Uint8Array(10 * 1024 * 1024 + 1)], "big.pdf", {
          type: "application/pdf",
        }),
      ),
    ).toThrow("10 MiB");
  });
  it("redirects anonymous users to login and submits the login form", async () => {
    sessionStorage.clear();
    const client = new QueryClient();
    const signIn = vi.spyOn(endpoints, "signIn").mockResolvedValue({
      accessToken: "new",
      tokenType: "Bearer",
      activeRole: "STUDENT",
      user: user as any,
    });
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/discover"]}>
          <SessionProvider client={client}>
            <ApiApp />
          </SessionProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await screen.findByText("Welcome to InternHub");
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "pw" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith(user.email, "pw", undefined),
    );
  });
  it("renders discover data, filters it, and renders empty state", async () => {
    vi.spyOn(endpoints, "me").mockResolvedValue({
      id: "u1",
      roles: ["STUDENT"],
      activeRole: "STUDENT",
    });
    vi.spyOn(endpoints, "postings")
      .mockResolvedValueOnce([
        {
          id: "p1",
          title: "React Intern",
          description: "Frontend",
          location: "HCM",
          workArrangement: "REMOTE",
          durationWeeks: 12,
          openings: 1,
          applicationDeadline: "2027-01-01",
          status: "OPEN",
          companyId: "c",
          skills: [],
          match: { score: 80, matchedSkills: [], missingSkills: [] },
        },
      ] as any)
      .mockResolvedValue([]);
    setup("/discover");
    await screen.findByText("React Intern");
    fireEvent.change(screen.getByLabelText("Search postings"), {
      target: { value: "nothing" },
    });
    expect(
      await screen.findByText("No opportunities found"),
    ).toBeInTheDocument();
  });
  it("renders admin monitoring aggregates and unavailable role routes", async () => {
    vi.spyOn(endpoints, "me").mockResolvedValue({
      id: "u1",
      roles: ["ADMIN"],
      activeRole: "ADMIN",
    });
    vi.spyOn(endpoints, "monitoring").mockResolvedValue({
      applications: { SUBMITTED: 2 },
      placements: { ACTIVE: 1 },
      reports: { DRAFT: 3 },
      deadlines: [],
      recentActivity: [],
    });
    setup("/monitoring", "ADMIN");
    await screen.findByText("Monitoring");
    expect(await screen.findByText("2")).toBeInTheDocument();
    setup("/unknown", "ADMIN");
    expect(
      await screen.findByText("Feature not available"),
    ).toBeInTheDocument();
  });
  it("resets the Admin role editor when the selected user changes or refreshes", async () => {
    const first: AdminUser = {
      id: "admin-1",
      email: "first@example.test",
      fullName: "First Admin",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      roles: ["STUDENT"],
      memberships: [],
    };
    const refreshed: AdminUser = {
      ...first,
      updatedAt: "2026-01-02T00:00:00.000Z",
      roles: ["ADMIN"],
    };
    const second: AdminUser = {
      ...first,
      id: "admin-2",
      email: "second@example.test",
      fullName: "Second Admin",
      roles: ["ADMIN"],
    };
    vi.spyOn(endpoints, "me").mockResolvedValue({
      id: "u1",
      roles: ["ADMIN"],
      activeRole: "ADMIN",
    });
    vi.spyOn(endpoints, "adminUsers").mockResolvedValue({
      items: [first, second] as any,
      total: 2,
    });
    let firstCalls = 0;
    vi.spyOn(endpoints, "adminUser").mockImplementation(async (id) => {
      if (id === first.id) return ++firstCalls === 1 ? first : refreshed;
      return second;
    });
    vi.spyOn(endpoints, "companyCatalog").mockResolvedValue([]);
    vi.spyOn(endpoints, "updateAdminRoles").mockResolvedValue(refreshed);
    setup("/administration/users", "ADMIN");
    fireEvent.click(await screen.findByRole("button", { name: /First Admin/ }));
    expect(await screen.findByLabelText("STUDENT")).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Save roles" }));
    await waitFor(() => expect(screen.getByLabelText("ADMIN")).toBeChecked());
    expect(screen.getByLabelText("STUDENT")).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: /Second Admin/ }));
    await screen.findByRole("heading", { name: "Second Admin" });
    expect(screen.getByLabelText("ADMIN")).toBeChecked();
    expect(screen.getByLabelText("STUDENT")).not.toBeChecked();
  });
  it("shows an API error instead of retrying an unavailable route", async () => {
    vi.spyOn(endpoints, "me").mockResolvedValue({
      id: "u1",
      roles: ["STUDENT"],
      activeRole: "STUDENT",
    });
    vi.spyOn(endpoints, "postings").mockRejectedValue(
      new ApiError(404, "offline"),
    );
    setup("/discover");
    expect(await screen.findByRole("alert")).toHaveTextContent("offline");
  });
});
