import { Placement, WeeklyReport } from "./index";

describe("placement lifecycle", () => {
  it("allows one terminal transition and blocks later activity", () => {
    const placement = Placement.rehydrate("ACTIVE");
    expect(placement.canAcceptActivity()).toBe(true);
    expect(placement.end("COMPLETED")).toBe(true);
    expect(placement.status).toBe("COMPLETED");
    expect(placement.canAcceptActivity()).toBe(false);
    expect(placement.end("TERMINATED")).toBe(false);
  });

  it("rejects an unsupported placement transition", () => {
    expect(Placement.rehydrate("ACTIVE").end("ACTIVE")).toBe(false);
  });
});

describe("weekly report lifecycle", () => {
  const draft = {
    accomplishments: " Accomplished work ",
    challenges: " A challenge ",
    nextWeekPlan: " Next steps ",
    attachmentDocumentIds: ["document-1"],
  };

  it("permits empty drafts but requires complete content to submit a version", () => {
    const report = WeeklyReport.rehydrate({
      state: "DRAFT",
      currentVersionNo: 0,
      draft: {},
    });
    expect(report.saveDraft({ accomplishments: " " })).toBe(true);
    expect(report.submit()).toEqual({ kind: "INCOMPLETE" });
    expect(report.state).toBe("DRAFT");

    report.saveDraft(draft);
    expect(report.submit()).toEqual({
      kind: "SUBMIT",
      versionNo: 1,
      accomplishments: "Accomplished work",
      challenges: "A challenge",
      nextWeekPlan: "Next steps",
    });
    expect(report.state).toBe("SUBMITTED");
    expect(report.versionNo).toBe(1);
    expect(report.draft).toEqual({
      accomplishments: "",
      challenges: "",
      nextWeekPlan: "",
      attachmentDocumentIds: [],
    });
  });

  it("only edits draft or revision-requested reports", () => {
    const submitted = WeeklyReport.rehydrate({
      state: "SUBMITTED",
      currentVersionNo: 1,
      draft,
    });
    expect(submitted.saveDraft(draft)).toBe(false);
    expect(submitted.submit()).toEqual({ kind: "REPORT_VERSION_CONFLICT" });

    const revision = WeeklyReport.rehydrate({
      state: "REVISION_REQUESTED",
      currentVersionNo: 1,
      draft: {},
    });
    expect(revision.saveDraft(draft)).toBe(true);
    expect(revision.submit()).toMatchObject({ kind: "SUBMIT", versionNo: 2 });
  });

  it("reviews only the current unreviewed submitted version", () => {
    const revision = WeeklyReport.createReview(
      "REVISION_REQUESTED",
      " Add examples ",
    )!;
    expect(
      WeeklyReport.createReview("REVISION_REQUESTED", "   "),
    ).toBeUndefined();

    const report = WeeklyReport.rehydrate({
      state: "SUBMITTED",
      currentVersionNo: 2,
      currentVersionId: "v2",
      draft: {},
    });
    expect(report.review(revision, "v1", false)).toBeUndefined();
    expect(report.review(revision, "v2", true)).toBeUndefined();
    expect(report.review(revision, "v2", false)).toBe("v2");
    expect(report.state).toBe("REVISION_REQUESTED");
  });
});
