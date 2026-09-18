export type LegacySkill = {
  id?: unknown;
  name?: unknown;
  proficiency?: unknown;
  importance?: unknown;
};

export const normalizeCanonicalSkill = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("und");
  return normalized.length > 0 && normalized.length <= 100 ? normalized : null;
};

export const canonicalRoles = (raw: unknown): string[] => {
  const allowed = new Set(["STUDENT", "COMPANY_STAFF", "SUPERVISOR", "ADMIN"]);
  return [
    ...new Set(
      String(raw ?? "")
        .split(",")
        .map((x) => x.trim().toUpperCase())
        .filter((x) => allowed.has(x)),
    ),
  ];
};

/** Keeps a deterministic, canonical skill set while preserving rejected input for the archive. */
export function mapLegacySkills(input: unknown, mode: "student" | "posting") {
  const accepted: Array<{
    name: string;
    normalizedName: string;
    proficiency?: string;
    importance?: string;
  }> = [];
  const rejected: Array<{ value: unknown; reason: string }> = [];
  if (!Array.isArray(input))
    return {
      accepted,
      rejected:
        input == null ? rejected : [{ value: input, reason: "NOT_AN_ARRAY" }],
    };
  const seen = new Set<string>();
  for (const value of input as LegacySkill[]) {
    const normalizedName = normalizeCanonicalSkill(value?.name);
    if (!normalizedName) {
      rejected.push({ value, reason: "INVALID_SKILL_NAME" });
      continue;
    }
    if (seen.has(normalizedName)) {
      rejected.push({ value, reason: "DUPLICATE_NORMALIZED_SKILL" });
      continue;
    }
    const proficiency =
      typeof value.proficiency === "string"
        ? value.proficiency.toUpperCase()
        : undefined;
    const importance =
      typeof value.importance === "string"
        ? value.importance.toUpperCase()
        : undefined;
    if (
      mode === "student" &&
      proficiency &&
      !["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(proficiency)
    ) {
      rejected.push({ value, reason: "INVALID_PROFICIENCY" });
      continue;
    }
    if (
      mode === "posting" &&
      importance &&
      !["REQUIRED", "OPTIONAL"].includes(importance)
    ) {
      rejected.push({ value, reason: "INVALID_IMPORTANCE" });
      continue;
    }
    seen.add(normalizedName);
    accepted.push({
      name: String(value.name).normalize("NFKC").trim().replace(/\s+/gu, " "),
      normalizedName,
      proficiency,
      importance,
    });
  }
  return { accepted, rejected };
}
