export type PlacementStatus = "ACTIVE" | "COMPLETED" | "TERMINATED";
export type PlacementEndStatus = "COMPLETED" | "TERMINATED";

/** Owns the placement lifecycle and the Active-only write invariant. */
export class Placement {
  private constructor(private currentStatus: PlacementStatus) {}

  static rehydrate(status: PlacementStatus): Placement {
    return new Placement(status);
  }

  get status(): PlacementStatus {
    return this.currentStatus;
  }

  canAcceptActivity(): boolean {
    return this.currentStatus === "ACTIVE";
  }

  end(target: string): boolean {
    if (
      !this.canAcceptActivity() ||
      (target !== "COMPLETED" && target !== "TERMINATED")
    )
      return false;
    this.currentStatus = target;
    return true;
  }
}

export type WeeklyReportState =
  "DRAFT" | "SUBMITTED" | "REVISION_REQUESTED" | "APPROVED";

export type ReviewOutcome = "APPROVED" | "REVISION_REQUESTED";

export interface ReportDraftInput {
  accomplishments?: string | null;
  challenges?: string | null;
  nextWeekPlan?: string | null;
  attachmentDocumentIds?: readonly string[];
}

export interface ReportDraft {
  accomplishments: string;
  challenges: string;
  nextWeekPlan: string;
  attachmentDocumentIds: readonly string[];
}

export interface WeeklyReportSnapshot {
  state: WeeklyReportState;
  currentVersionNo: number;
  currentVersionId?: string;
  draft: ReportDraftInput;
}

export type ReportSubmissionResult =
  | {
      kind: "SUBMIT";
      versionNo: number;
      accomplishments: string;
      challenges: string;
      nextWeekPlan: string;
    }
  | { kind: "INCOMPLETE" }
  | { kind: "REPORT_VERSION_CONFLICT" };

export interface ReportReview {
  outcome: ReviewOutcome;
  feedback?: string;
}

/**
 * One report belongs to one immutable reporting period. The aggregate keeps the
 * mutable draft, state, and version number; submitted versions and reviews are
 * persisted as append-only records by the application service.
 */
export class WeeklyReport {
  private currentState: WeeklyReportState;
  private currentVersionNo: number;
  private readonly currentVersionId?: string;
  private currentDraft: ReportDraft;

  private constructor(snapshot: WeeklyReportSnapshot) {
    this.currentState = snapshot.state;
    this.currentVersionNo = snapshot.currentVersionNo;
    this.currentVersionId = snapshot.currentVersionId;
    this.currentDraft = toDraft(snapshot.draft);
  }

  static rehydrate(snapshot: WeeklyReportSnapshot): WeeklyReport {
    return new WeeklyReport(snapshot);
  }

  static createReview(
    outcome: string,
    feedback?: string | null,
  ): ReportReview | undefined {
    if (outcome !== "APPROVED" && outcome !== "REVISION_REQUESTED")
      return undefined;
    const normalizedFeedback = feedback?.trim() || undefined;
    if (outcome === "REVISION_REQUESTED" && !normalizedFeedback)
      return undefined;
    return { outcome, feedback: normalizedFeedback };
  }

  get state(): WeeklyReportState {
    return this.currentState;
  }

  get versionNo(): number {
    return this.currentVersionNo;
  }

  get draft(): ReportDraft {
    return {
      ...this.currentDraft,
      attachmentDocumentIds: [...this.currentDraft.attachmentDocumentIds],
    };
  }

  canEditDraft(): boolean {
    return (
      this.currentState === "DRAFT" ||
      this.currentState === "REVISION_REQUESTED"
    );
  }

  canReview(): boolean {
    return this.currentState === "SUBMITTED";
  }

  saveDraft(input: ReportDraftInput): boolean {
    if (!this.canEditDraft()) return false;
    this.currentDraft = toDraft(input);
    return true;
  }

  submit(): ReportSubmissionResult {
    if (!this.canEditDraft()) return { kind: "REPORT_VERSION_CONFLICT" };
    const accomplishments = this.currentDraft.accomplishments.trim();
    const challenges = this.currentDraft.challenges.trim();
    const nextWeekPlan = this.currentDraft.nextWeekPlan.trim();
    if (!accomplishments || !challenges || !nextWeekPlan)
      return { kind: "INCOMPLETE" };
    this.currentVersionNo += 1;
    this.currentState = "SUBMITTED";
    this.currentDraft = toDraft({});
    return {
      kind: "SUBMIT",
      versionNo: this.currentVersionNo,
      accomplishments,
      challenges,
      nextWeekPlan,
    };
  }

  review(
    review: ReportReview,
    requestedVersionId: string,
    alreadyReviewed: boolean,
  ): string | undefined {
    if (
      !this.canReview() ||
      !this.currentVersionId ||
      requestedVersionId !== this.currentVersionId ||
      alreadyReviewed
    )
      return undefined;
    this.currentState = review.outcome;
    return this.currentVersionId;
  }
}

function toDraft(input: ReportDraftInput): ReportDraft {
  return {
    accomplishments: input.accomplishments ?? "",
    challenges: input.challenges ?? "",
    nextWeekPlan: input.nextWeekPlan ?? "",
    attachmentDocumentIds: [...(input.attachmentDocumentIds ?? [])],
  };
}
