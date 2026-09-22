import {
  AcceptanceCommand,
  Application,
  canTransitionApplication,
} from "./index";

describe("application lifecycle", () => {
  it.each([
    ["SUBMITTED", "UNDER_REVIEW"],
    ["SUBMITTED", "REJECTED"],
    ["UNDER_REVIEW", "INTERVIEW"],
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

  it("rejects terminal, backwards, withdrawal, and commandless acceptance transitions", () => {
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
    const interview = Application.rehydrate("INTERVIEW");
    expect(interview.transitionTo("ACCEPTED", "staff")).toBe(false);
    expect(interview.status).toBe("INTERVIEW");
  });

  it("accepts once from interview and recognizes only a canonical replay", () => {
    const original = AcceptanceCommand.create({
      supervisorUserId: "supervisor-1",
      startDate: "2026-09-14",
      endDate: "2026-12-31",
      note: "  Initial assignment  ",
    })!;
    const replay = AcceptanceCommand.create({
      supervisorUserId: "supervisor-1",
      startDate: "2026-09-14",
      endDate: "2026-12-31",
      note: "Initial assignment",
    })!;
    const changed = AcceptanceCommand.create({
      supervisorUserId: "supervisor-2",
      startDate: "2026-09-14",
      endDate: "2026-12-31",
      note: "Initial assignment",
    })!;

    const pendingAcceptance = Application.rehydrate("INTERVIEW");
    expect(pendingAcceptance.accept(original)).toBe("ACCEPTED");
    expect(pendingAcceptance.status).toBe("ACCEPTED");

    expect(Application.rehydrate("ACCEPTED").accept(replay, original)).toBe(
      "REPLAY",
    );
    expect(Application.rehydrate("ACCEPTED").accept(changed, original)).toBe(
      "ACCEPTANCE_CONFLICT",
    );
    expect(Application.rehydrate("ACCEPTED").accept(replay)).toBe(
      "ACCEPTANCE_CONFLICT",
    );
  });

  it("normalizes blank notes and rejects invalid acceptance commands", () => {
    const blankNote = AcceptanceCommand.create({
      supervisorUserId: "supervisor-1",
      startDate: "2026-09-14",
      endDate: "2026-12-31",
      note: "   ",
    });
    expect(blankNote?.toData()).toEqual({
      supervisorUserId: "supervisor-1",
      startDate: "2026-09-14",
      endDate: "2026-12-31",
      note: null,
    });
    expect(
      AcceptanceCommand.create({
        supervisorUserId: "supervisor-1",
        startDate: "2026-12-31",
        endDate: "2026-09-14",
      }),
    ).toBeUndefined();
    expect(AcceptanceCommand.fromStored({ note: null })).toBeUndefined();
    expect(
      AcceptanceCommand.fromStored({
        supervisorUserId: "supervisor-1",
        startDate: "2026-09-14",
        endDate: "2026-12-31",
        note: " ",
      })?.equals(blankNote!),
    ).toBe(false);
  });

  it("keeps invalid and actor-disallowed transitions out of the aggregate", () => {
    const application = Application.rehydrate("SUBMITTED");
    expect(application.transitionTo("WITHDRAWN", "staff")).toBe(false);
    expect(application.status).toBe("SUBMITTED");
    const command = AcceptanceCommand.create({
      supervisorUserId: "supervisor-1",
      startDate: "2026-09-14",
      endDate: "2026-12-31",
    })!;
    expect(application.accept(command)).toBe("INVALID_TRANSITION");
  });
});
