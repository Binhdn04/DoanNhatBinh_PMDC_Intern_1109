import {
  canSavePerformanceEvaluation,
  canSaveSelfAssessment,
  hasValidAssessmentRatings,
} from "./index";

describe("assessment submission policies", () => {
  it("uses a populated 1--5 rating map for submissions", () => {
    expect(hasValidAssessmentRatings({}, false)).toBe(true);
    expect(hasValidAssessmentRatings({}, true)).toBe(false);
    expect(hasValidAssessmentRatings({ delivery: 5, teamwork: 1 }, true)).toBe(
      true,
    );
    expect(hasValidAssessmentRatings({ delivery: 0 }, true)).toBe(false);
    expect(hasValidAssessmentRatings([5], true)).toBe(false);
  });

  it("requires reflection and learning outcomes for self-assessment submission", () => {
    expect(
      canSaveSelfAssessment({ status: "DRAFT", ratings: {}, reflection: " " }),
    ).toBe(true);
    expect(
      canSaveSelfAssessment({
        status: "SUBMITTED",
        ratings: { delivery: 4 },
        reflection: " What I learned ",
        learningOutcomes: " Applied it ",
      }),
    ).toBe(true);
    expect(
      canSaveSelfAssessment({
        status: "SUBMITTED",
        ratings: { delivery: 4 },
        reflection: " ",
        learningOutcomes: " Applied it ",
      }),
    ).toBe(false);
  });

  it("requires a completion decision for performance evaluations", () => {
    expect(
      canSavePerformanceEvaluation({
        status: "DRAFT",
        ratings: {},
        completionDecision: "PENDING",
      }),
    ).toBe(true);
    expect(
      canSavePerformanceEvaluation({
        status: "SUBMITTED",
        ratings: { delivery: 5 },
        completionDecision: "PASSED",
      }),
    ).toBe(true);
    expect(
      canSavePerformanceEvaluation({
        status: "SUBMITTED",
        ratings: {},
        completionDecision: "PASSED",
      }),
    ).toBe(false);
    expect(
      canSavePerformanceEvaluation({
        status: "SUBMITTED",
        ratings: { delivery: 5 },
        completionDecision: "UNKNOWN",
      }),
    ).toBe(false);
  });
});
