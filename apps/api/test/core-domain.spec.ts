import {
  calculateMatchScore,
  canTransitionApplication,
  normalizeSkill,
} from "../src/modules/core-domain";

describe("core domain helpers", () => {
  const skills = [
    { id: "sql", name: "SQL", importance: "OPTIONAL" as const },
    { id: "js", name: "Java Script", importance: "REQUIRED" as const },
  ];

  it("normalizes, orders and scores skills deterministically", () => {
    expect(normalizeSkill(" JAVA\u00a0Script ")).toBe("java script");
    expect(calculateMatchScore(["js"], skills)).toEqual({
      calculationVersion: "skill-v1",
      score: 67,
      matchedSkills: ["Java Script"],
      missingSkills: ["SQL"],
      reason: "SKILL_OVERLAP",
    });
  });

  it("handles no posting skills and no matches", () => {
    expect(calculateMatchScore([], [])).toMatchObject({
      score: 0,
      reason: "NO_POSTING_SKILLS",
    });
    expect(calculateMatchScore([], skills)).toMatchObject({
      score: 0,
      matchedSkills: [],
      missingSkills: ["Java Script", "SQL"],
    });
  });

  it("enforces actor-specific transitions", () => {
    expect(canTransitionApplication("SUBMITTED", "WITHDRAWN", "student")).toBe(
      true,
    );
    expect(canTransitionApplication("SUBMITTED", "WITHDRAWN", "staff")).toBe(
      false,
    );
    expect(canTransitionApplication("ACCEPTED", "REJECTED", "staff")).toBe(
      false,
    );
  });
});
