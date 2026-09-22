export type ApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export type ApplicationActor = "student" | "staff";

export interface AcceptanceCommandData {
  supervisorUserId: string;
  startDate: string;
  endDate: string;
  note: string | null;
}

export interface AcceptanceCommandInput {
  supervisorUserId?: string;
  startDate?: string;
  endDate?: string;
  note?: string | null;
}

/**
 * Immutable, canonical acceptance input retained with the accepted history row.
 * Its equality is deliberately value based so a client retry can be recognized
 * without depending on object identity or the later supervisor assignment.
 */
export class AcceptanceCommand {
  private constructor(private readonly data: Readonly<AcceptanceCommandData>) {}

  static create(input: AcceptanceCommandInput): AcceptanceCommand | undefined {
    if (
      !input.supervisorUserId ||
      !input.startDate ||
      !input.endDate ||
      input.endDate < input.startDate
    )
      return undefined;
    return new AcceptanceCommand({
      supervisorUserId: input.supervisorUserId,
      startDate: input.startDate,
      endDate: input.endDate,
      note: input.note?.trim() || null,
    });
  }

  static fromStored(value: unknown): AcceptanceCommand | undefined {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return undefined;
    const input = value as Record<string, unknown>;
    if (
      typeof input.supervisorUserId !== "string" ||
      typeof input.startDate !== "string" ||
      typeof input.endDate !== "string" ||
      (input.note !== null && typeof input.note !== "string")
    )
      return undefined;
    if (
      !input.supervisorUserId ||
      !input.startDate ||
      !input.endDate ||
      input.endDate < input.startDate
    )
      return undefined;
    // Stored commands are already canonical. Do not normalize them on read:
    // a malformed legacy value must not accidentally become a replay match.
    return new AcceptanceCommand({
      supervisorUserId: input.supervisorUserId,
      startDate: input.startDate,
      endDate: input.endDate,
      note: input.note,
    });
  }

  equals(other: AcceptanceCommand): boolean {
    return (
      this.data.supervisorUserId === other.data.supervisorUserId &&
      this.data.startDate === other.data.startDate &&
      this.data.endDate === other.data.endDate &&
      this.data.note === other.data.note
    );
  }

  toData(): AcceptanceCommandData {
    return { ...this.data };
  }

  get supervisorUserId(): string {
    return this.data.supervisorUserId;
  }

  get startDate(): string {
    return this.data.startDate;
  }

  get endDate(): string {
    return this.data.endDate;
  }

  get note(): string | null {
    return this.data.note;
  }
}

export type ApplicationAcceptanceResult =
  "ACCEPTED" | "REPLAY" | "ACCEPTANCE_CONFLICT" | "INVALID_TRANSITION";

/**
 * The Application aggregate owns its status transition and acceptance replay
 * decisions. Persistence, authorization, and the placement side effects stay
 * with the application service.
 */
export class Application {
  private constructor(private currentStatus: ApplicationStatus) {}

  static rehydrate(status: ApplicationStatus): Application {
    return new Application(status);
  }

  get status(): ApplicationStatus {
    return this.currentStatus;
  }

  transitionTo(target: ApplicationStatus, actor: ApplicationActor): boolean {
    if (!canTransitionApplication(this.currentStatus, target, actor))
      return false;
    this.currentStatus = target;
    return true;
  }

  accept(
    command: AcceptanceCommand,
    storedCommand?: AcceptanceCommand,
  ): ApplicationAcceptanceResult {
    if (this.currentStatus === "ACCEPTED")
      return storedCommand?.equals(command) ? "REPLAY" : "ACCEPTANCE_CONFLICT";
    if (this.currentStatus !== "INTERVIEW") return "INVALID_TRANSITION";
    this.currentStatus = "ACCEPTED";
    return "ACCEPTED";
  }
}

const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED", "WITHDRAWN"],
  UNDER_REVIEW: ["INTERVIEW", "REJECTED", "WITHDRAWN"],
  INTERVIEW: ["ACCEPTED", "REJECTED", "WITHDRAWN"],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};
export const canTransitionApplication = (
  from: ApplicationStatus,
  to: ApplicationStatus,
  actor: ApplicationActor,
) =>
  actor === "student"
    ? to === "WITHDRAWN" && transitions[from].includes(to)
    : transitions[from].includes(to) && to !== "WITHDRAWN";
