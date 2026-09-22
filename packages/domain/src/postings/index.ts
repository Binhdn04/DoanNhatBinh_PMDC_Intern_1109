export type PostingStatus = "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED";

export interface PostingPublication {
  status: string;
  title: string;
  description: string;
  skillsDeclared: boolean;
  deadlineAt: Date;
}

/**
 * Posting lifecycle decisions are kept separate from querying, authorization,
 * persistence, and deadline timezone conversion.
 */
export function canPublishPosting(
  posting: PostingPublication,
  now: Date,
): boolean {
  return (
    posting.status === "DRAFT" &&
    posting.skillsDeclared &&
    Boolean(posting.title.trim()) &&
    Boolean(posting.description.trim()) &&
    posting.deadlineAt.getTime() > now.getTime()
  );
}

export function canTransitionPosting(from: string, to: string): boolean {
  return (
    (from === "OPEN" && to === "CLOSED") ||
    (from === "CLOSED" && to === "ARCHIVED")
  );
}
