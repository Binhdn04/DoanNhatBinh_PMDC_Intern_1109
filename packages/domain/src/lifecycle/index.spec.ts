import { canTransitionApplication } from "./index";

describe("application lifecycle", () => {
  it.each([
    ["SUBMITTED", "UNDER_REVIEW"],
    ["SUBMITTED", "REJECTED"],
    ["UNDER_REVIEW", "INTERVIEW"],
    ["INTERVIEW", "ACCEPTED"],
    ["INTERVIEW", "REJECTED"],
  ] as const)("allows staff transition %s -> %s", (from, to) => {
    expect(canTransitionApplication(from, to, "staff")).toBe(true);
  });

  it.each(["SUBMITTED", "UNDER_REVIEW", "INTERVIEW"] as const)(
    "allows students to withdraw %s",
    (from) => {
      expect(canTransitionApplication(from, "WITHDRAWN", "student")).toBe(true);
    },
  );

  it("rejects terminal, backwards, and staff withdrawal transitions", () => {
    expect(canTransitionApplication("ACCEPTED", "REJECTED", "staff")).toBe(
      false,
    );
    expect(canTransitionApplication("UNDER_REVIEW", "SUBMITTED", "staff")).toBe(
      false,
    );
    expect(canTransitionApplication("INTERVIEW", "WITHDRAWN", "staff")).toBe(
      false,
    );
    expect(canTransitionApplication("SUBMITTED", "ACCEPTED", "student")).toBe(
      false,
    );
  });
});
