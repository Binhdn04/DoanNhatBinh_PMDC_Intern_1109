import { canPublishPosting, canTransitionPosting } from "./index";

describe("posting policies", () => {
  const completeDraft = {
    status: "DRAFT",
    title: " Software Intern ",
    description: " Build useful things ",
    skillsDeclared: true,
    deadlineAt: new Date("2026-10-02T00:00:00.000Z"),
  };

  it("publishes only complete drafts before their deadline", () => {
    const now = new Date("2026-10-01T00:00:00.000Z");
    expect(canPublishPosting(completeDraft, now)).toBe(true);
    expect(
      canPublishPosting({ ...completeDraft, skillsDeclared: false }, now),
    ).toBe(false);
    expect(canPublishPosting({ ...completeDraft, title: "  " }, now)).toBe(
      false,
    );
    expect(
      canPublishPosting({ ...completeDraft, description: "  " }, now),
    ).toBe(false);
    expect(canPublishPosting({ ...completeDraft, deadlineAt: now }, now)).toBe(
      false,
    );
    expect(canPublishPosting({ ...completeDraft, status: "OPEN" }, now)).toBe(
      false,
    );
  });

  it("allows only the posting lifecycle transitions", () => {
    expect(canTransitionPosting("OPEN", "CLOSED")).toBe(true);
    expect(canTransitionPosting("CLOSED", "ARCHIVED")).toBe(true);
    expect(canTransitionPosting("DRAFT", "OPEN")).toBe(false);
    expect(canTransitionPosting("OPEN", "ARCHIVED")).toBe(false);
    expect(canTransitionPosting("ARCHIVED", "CLOSED")).toBe(false);
  });
});
