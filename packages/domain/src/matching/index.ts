export type SkillImportance = "REQUIRED" | "OPTIONAL";
export interface SkillInput {
  id: string;
  name: string;
  importance: SkillImportance;
}
export interface MatchScore {
  calculationVersion: "skill-v1";
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  reason: "SKILL_OVERLAP" | "NO_POSTING_SKILLS";
}

export function normalizeSkill(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("und");
}

export function calculateMatchScore(
  studentSkillIds: Iterable<string>,
  postingSkills: SkillInput[],
): MatchScore {
  const owned = new Set(studentSkillIds);
  const ordered = [...postingSkills].sort(
    (a, b) =>
      normalizeSkill(a.name).localeCompare(normalizeSkill(b.name)) ||
      a.id.localeCompare(b.id),
  );
  const total = ordered.reduce(
    (sum, skill) => sum + (skill.importance === "REQUIRED" ? 2 : 1),
    0,
  );
  if (!total)
    return {
      calculationVersion: "skill-v1",
      score: 0,
      matchedSkills: [],
      missingSkills: [],
      reason: "NO_POSTING_SKILLS",
    };
  const matched = ordered.filter((skill) => owned.has(skill.id));
  const weight = matched.reduce(
    (sum, skill) => sum + (skill.importance === "REQUIRED" ? 2 : 1),
    0,
  );
  return {
    calculationVersion: "skill-v1",
    score: Math.floor((100 * weight) / total + 0.5),
    matchedSkills: matched.map((s) => s.name),
    missingSkills: ordered.filter((s) => !owned.has(s.id)).map((s) => s.name),
    reason: "SKILL_OVERLAP",
  };
}
