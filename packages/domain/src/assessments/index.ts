export type AssessmentStatus = "DRAFT" | "SUBMITTED";

export interface SelfAssessmentSubmission {
  status: string;
  ratings: unknown;
  reflection?: string | null;
  learningOutcomes?: string | null;
}

export interface PerformanceEvaluationSubmission {
  status: string;
  ratings: unknown;
  completionDecision?: string | null;
}

/** Ratings use the same 1--5 scale for both assessment types. */
export function hasValidAssessmentRatings(
  ratings: unknown,
  required: boolean,
): ratings is Record<string, number> {
  return (
    typeof ratings === "object" &&
    ratings !== null &&
    !Array.isArray(ratings) &&
    (!required || Object.keys(ratings).length > 0) &&
    Object.values(ratings).every(
      (rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5,
    )
  );
}

export function canSaveSelfAssessment(
  assessment: SelfAssessmentSubmission,
): boolean {
  if (
    (assessment.status !== "DRAFT" && assessment.status !== "SUBMITTED") ||
    !hasValidAssessmentRatings(
      assessment.ratings,
      assessment.status === "SUBMITTED",
    )
  )
    return false;
  return (
    assessment.status === "DRAFT" ||
    (Boolean(assessment.reflection?.trim()) &&
      Boolean(assessment.learningOutcomes?.trim()))
  );
}

export function canSavePerformanceEvaluation(
  evaluation: PerformanceEvaluationSubmission,
): boolean {
  return (
    (evaluation.status === "DRAFT" || evaluation.status === "SUBMITTED") &&
    ["PASSED", "FAILED", "PENDING", "INCOMPLETE"].includes(
      evaluation.completionDecision ?? "",
    ) &&
    hasValidAssessmentRatings(
      evaluation.ratings,
      evaluation.status === "SUBMITTED",
    )
  );
}
