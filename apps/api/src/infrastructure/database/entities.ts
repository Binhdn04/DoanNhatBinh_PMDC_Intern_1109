import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export type Role = "STUDENT" | "COMPANY_STAFF" | "SUPERVISOR" | "ADMIN";
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ unique: true }) email!: string;
  @Column({ name: "password_hash" }) passwordHash!: string;
  @Column({ name: "full_name" }) fullName!: string;
  @Column({ nullable: true }) phone?: string;
  @CreateDateColumn({ name: "created_at" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt!: Date;
}
@Entity("user_roles")
export class UserRole {
  @PrimaryColumn({ name: "user_id", type: "uuid" }) userId!: string;
  @PrimaryColumn() role!: Role;
}
@Entity("auth_sessions")
export class AuthSession {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "user_id" }) userId!: string;
  @Column({ name: "active_role" }) activeRole!: Role;
  @Column({ default: 1 }) version!: number;
  @Column({ name: "expires_at", type: "timestamptz" }) expiresAt!: Date;
  @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
  revokedAt?: Date;
}
@Entity("student_profiles")
export class StudentProfile {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "user_id", type: "uuid", unique: true }) userId!: string;
  @Column({ nullable: true }) university?: string;
  @Column({ nullable: true }) major?: string;
  @Column({ name: "graduation_year", nullable: true }) graduationYear?: number;
  @Column({ nullable: true }) bio?: string;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt!: Date;
}
@Entity("student_preferences")
export class StudentPreference {
  @PrimaryColumn({ name: "student_id", type: "uuid" }) studentId!: string;
  @Column("text", { array: true, default: "{}" }) industries!: string[];
  @Column("text", { array: true, default: "{}" }) locations!: string[];
  @Column("text", { name: "work_arrangements", array: true, default: "{}" })
  workArrangements!: string[];
  @Column({ name: "min_duration_weeks", nullable: true })
  minDurationWeeks?: number;
  @Column({ name: "max_duration_weeks", nullable: true })
  maxDurationWeeks?: number;
}
@Entity("skills")
export class Skill {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column() name!: string;
  @Index({ unique: true })
  @Column({ name: "normalized_name" })
  normalizedName!: string;
  @Column({ nullable: true }) category?: string;
}
@Entity("student_skills")
export class StudentSkill {
  @PrimaryColumn({ name: "student_id", type: "uuid" }) studentId!: string;
  @PrimaryColumn({ name: "skill_id", type: "uuid" }) skillId!: string;
  @Column({ nullable: true }) proficiency?: string;
}
@Entity("companies")
export class Company {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Index({ unique: true }) @Column() name!: string;
  @Column({ nullable: true }) website?: string;
  @Column({ nullable: true }) industry?: string;
  @Column({ nullable: true }) description?: string;
  @CreateDateColumn({ name: "created_at" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt!: Date;
}
@Entity("company_staff")
export class CompanyStaff {
  @PrimaryColumn({ name: "company_id", type: "uuid" }) companyId!: string;
  @PrimaryColumn({ name: "user_id", type: "uuid" }) userId!: string;
  @Column({ default: true }) active!: boolean;
  @Column({ nullable: true }) title?: string;
}
@Entity("postings")
export class Posting {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "company_id" }) companyId!: string;
  @Column({ nullable: true, name: "term_id" }) termId?: string;
  @Column() title!: string;
  @Column() description!: string;
  @Column({ nullable: true }) category?: string;
  @Column({ nullable: true }) location?: string;
  @Column({ name: "work_arrangement" }) workArrangement!: string;
  @Column({ name: "duration_weeks", type: "int" }) durationWeeks!: number;
  @Column({ type: "int" }) openings!: number;
  @Column({ name: "application_deadline", type: "date" })
  applicationDeadline!: string;
  @Column({ name: "deadline_timezone", default: "Asia/Ho_Chi_Minh" })
  deadlineTimezone!: string;
  @Column({ name: "skills_declared", default: false }) skillsDeclared!: boolean;
  @Column({ default: "DRAFT" }) status!: string;
  @Column({ name: "created_by_user_id" }) createdByUserId!: string;
  @CreateDateColumn({ name: "created_at" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt!: Date;
}
@Entity("posting_skills")
export class PostingSkill {
  @PrimaryColumn({ name: "posting_id", type: "uuid" }) postingId!: string;
  @PrimaryColumn({ name: "skill_id", type: "uuid" }) skillId!: string;
  @Column() importance!: "REQUIRED" | "OPTIONAL";
}
@Entity("saved_postings")
@Index(["studentId", "postingId"], { unique: true })
export class SavedPosting {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "student_id" }) studentId!: string;
  @Column({ name: "posting_id" }) postingId!: string;
  @CreateDateColumn({ name: "saved_at" }) savedAt!: Date;
}
@Entity("applications")
@Index(["studentId", "postingId"], { unique: true })
export class Application {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "student_id" }) studentId!: string;
  @Column({ name: "posting_id" }) postingId!: string;
  @Column({ name: "cv_document_id", nullable: true }) cvDocumentId?: string;
  @Column({ default: "SUBMITTED" }) status!: string;
  @Column({ name: "contact_name", nullable: true }) contactName?: string;
  @Column({ name: "contact_email", nullable: true }) contactEmail?: string;
  @Column({ name: "contact_phone", nullable: true }) contactPhone?: string;
  @Column({ nullable: true }) university?: string;
  @Column({ nullable: true }) major?: string;
  @Column({ name: "graduation_year", nullable: true }) graduationYear?: number;
  @Column({ nullable: true }) availability?: string;
  @Column({ name: "cover_note" }) coverNote!: string;
  @CreateDateColumn({ name: "submitted_at" }) submittedAt!: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt!: Date;
}
@Entity("application_status_history")
export class ApplicationHistory {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "application_id" }) applicationId!: string;
  @Column({ name: "from_status", nullable: true }) fromStatus?: string;
  @Column({ name: "to_status" }) toStatus!: string;
  @Column({ name: "actor_user_id" }) actorUserId!: string;
  @Column({ nullable: true }) note?: string;
  @Column({ name: "acceptance_command", type: "jsonb", nullable: true })
  acceptanceCommand?: object;
  @CreateDateColumn({ name: "changed_at" }) changedAt!: Date;
}
@Entity("placements")
export class Placement {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Index({ unique: true })
  @Column({ name: "application_id" })
  applicationId!: string;
  @Column({ name: "student_id" }) studentId!: string;
  @Column({ name: "posting_id" }) postingId!: string;
  @Column({ name: "company_id" }) companyId!: string;
  @Column({ nullable: true, name: "term_id" }) termId?: string;
  @Column({ name: "reporting_timezone", default: "Asia/Ho_Chi_Minh" })
  reportingTimezone!: string;
  @Column({ name: "start_date", type: "date" }) startDate!: string;
  @Column({ name: "end_date", type: "date" }) endDate!: string;
  @Column({ default: "ACTIVE" }) status!: string;
  @Column({ name: "ended_at", type: "timestamptz", nullable: true })
  endedAt?: Date;
  @Column({ name: "ended_by_user_id", nullable: true }) endedByUserId?: string;
  @CreateDateColumn({ name: "created_at" }) createdAt!: Date;
}
@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "placement_id" }) placementId!: string;
  @Column({ name: "created_by_user_id", nullable: true })
  createdByUserId?: string;
  @Column() title!: string;
  @Column() description!: string;
  @Column() priority!: string;
  @Column({ name: "due_date", type: "date", nullable: true }) dueDate?: string;
  @Column({ default: "TODO" }) status!: string;
  @CreateDateColumn({ name: "created_at" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt!: Date;
}
@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "recipient_user_id" }) recipientUserId!: string;
  @Column() type!: string;
  @Column() title!: string;
  @Column({ nullable: true }) body?: string;
  @Column({ name: "target_type", nullable: true }) targetType?: string;
  @Column({ name: "target_id", nullable: true }) targetId?: string;
  @Column({ name: "reporting_period_id", nullable: true })
  reportingPeriodId?: string;
  @Column({ name: "dedupe_key", nullable: true }) dedupeKey?: string;
  @Column({ name: "read_at", type: "timestamptz", nullable: true })
  readAt?: Date;
  @CreateDateColumn({ name: "created_at" }) createdAt!: Date;
}

/**
 * These entities are intentionally separate from the first development schema.
 * The corrective migration creates them without rewriting already-applied history.
 * New workflow code only writes these retained records.
 */
@Entity("programs")
export class Program {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Index({ unique: true }) @Column() code!: string;
  @Column() name!: string;
  @Column({ default: true }) active!: boolean;
  @Column({ default: "Asia/Ho_Chi_Minh" }) timezone!: string;
  @CreateDateColumn({ name: "created_at" }) createdAt!: Date;
}
@Entity("academic_terms")
@Index(["programId", "name"], { unique: true })
export class AcademicTerm {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "program_id" }) programId!: string;
  @Column() name!: string;
  @Column({ name: "starts_on", type: "date" }) startsOn!: string;
  @Column({ name: "ends_on", type: "date" }) endsOn!: string;
  @Column({ nullable: true }) timezone?: string;
}
@Entity("supervisor_profiles")
export class SupervisorProfile {
  @PrimaryColumn({ name: "user_id", type: "uuid" }) userId!: string;
  @Column({ nullable: true }) title?: string;
  @Column({ nullable: true }) department?: string;
}
@Entity("placement_supervisor_assignments")
export class SupervisorAssignment {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "placement_id" }) placementId!: string;
  @Column({ name: "supervisor_user_id" }) supervisorUserId!: string;
  @Column({ name: "assigned_by_user_id" }) assignedByUserId!: string;
  @Column({ nullable: true }) reason?: string;
  @CreateDateColumn({ name: "assigned_at" }) assignedAt!: Date;
  @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
  revokedAt?: Date;
  @Column({ name: "revoked_by_user_id", nullable: true })
  revokedByUserId?: string;
  @Column({ name: "revocation_reason", nullable: true })
  revocationReason?: string;
}
@Entity("reporting_periods")
@Index(["placementId", "weekStart"], { unique: true })
export class ReportingPeriod {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "placement_id" }) placementId!: string;
  @Column({ name: "week_start", type: "date" }) weekStart!: string;
  @Column({ name: "week_end", type: "date" }) weekEnd!: string;
  @Column({ name: "due_at", type: "timestamptz" }) dueAt!: Date;
}
@Entity("documents")
export class Document {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "owner_user_id" }) ownerUserId!: string;
  @Index({ unique: true }) @Column({ name: "object_key" }) objectKey!: string;
  @Column({ name: "original_name" }) originalName!: string;
  @Column({ name: "content_type" }) contentType!: string;
  @Column({ name: "size_bytes", type: "bigint" }) sizeBytes!: string;
  @Column({ length: 64 }) sha256!: string;
  @Column({ default: "PENDING" })
  state!: "PENDING" | "AVAILABLE" | "REJECTED" | "DELETED";
  @CreateDateColumn({ name: "created_at" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt!: Date;
}
@Entity("student_documents")
@Index(["studentId", "documentId"], { unique: true })
export class StudentDocument {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "student_id" }) studentId!: string;
  @Column({ name: "document_id" }) documentId!: string;
  @Column({ default: "OTHER" }) kind!: string;
  @Column({ name: "is_default_cv", default: false }) isDefaultCv!: boolean;
  @CreateDateColumn({ name: "created_at" }) createdAt!: Date;
}
@Entity("application_documents")
@Index(["applicationId", "documentId"], { unique: true })
export class ApplicationDocument {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "application_id" }) applicationId!: string;
  @Column({ name: "document_id" }) documentId!: string;
  @Column({ default: "SUPPORTING" }) kind!: string;
  @CreateDateColumn({ name: "created_at" }) createdAt!: Date;
}
@Entity("weekly_reports")
@Index(["reportingPeriodId"], { unique: true })
export class WeeklyReport {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "placement_id" }) placementId!: string;
  @Column({ name: "reporting_period_id" }) reportingPeriodId!: string;
  @Column({ default: "DRAFT" })
  state!: "DRAFT" | "SUBMITTED" | "REVISION_REQUESTED" | "APPROVED";
  @Column({ name: "draft_accomplishments", type: "text", nullable: true })
  draftAccomplishments?: string;
  @Column({ name: "draft_challenges", type: "text", nullable: true })
  draftChallenges?: string;
  @Column({ name: "draft_next_week_plan", type: "text", nullable: true })
  draftNextWeekPlan?: string;
  @Column({ name: "draft_saved_at", type: "timestamptz", nullable: true })
  draftSavedAt?: Date;
  @Column({ name: "current_version_no", default: 0 }) currentVersionNo!: number;
  @CreateDateColumn({ name: "created_at" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt!: Date;
}
@Entity("report_versions")
@Index(["reportId", "versionNo"], { unique: true })
export class ReportVersion {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "report_id" }) reportId!: string;
  @Column({ name: "version_no" }) versionNo!: number;
  @Column({ type: "text" }) accomplishments!: string;
  @Column({ type: "text" }) challenges!: string;
  @Column({ name: "next_week_plan", type: "text" }) nextWeekPlan!: string;
  @Column({ name: "submitted_by_user_id" }) submittedByUserId!: string;
  @CreateDateColumn({ name: "submitted_at" }) submittedAt!: Date;
}
@Entity("report_reviews")
@Index(["reportVersionId"], { unique: true })
export class ReportReview {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "report_version_id" }) reportVersionId!: string;
  @Column() outcome!: "APPROVED" | "REVISION_REQUESTED";
  @Column({ nullable: true, type: "text" }) feedback?: string;
  @Column({ name: "reviewed_by_user_id" }) reviewedByUserId!: string;
  @CreateDateColumn({ name: "reviewed_at" }) reviewedAt!: Date;
}
@Entity("report_draft_documents")
@Index(["reportId", "documentId"], { unique: true })
export class ReportDraftDocument {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "report_id" }) reportId!: string;
  @Column({ name: "document_id" }) documentId!: string;
}
@Entity("report_version_documents")
@Index(["reportVersionId", "documentId"], { unique: true })
export class ReportVersionDocument {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "report_version_id" }) reportVersionId!: string;
  @Column({ name: "document_id" }) documentId!: string;
}
@Entity("self_assessments")
@Index(["placementId"], { unique: true })
export class SelfAssessment {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "placement_id" }) placementId!: string;
  @Column({ default: "DRAFT" }) status!: "DRAFT" | "SUBMITTED";
  @Column("jsonb", { default: {} }) ratings!: Record<string, number>;
  @Column({ nullable: true, type: "text" }) reflection?: string;
  @Column({ name: "learning_outcomes", nullable: true, type: "text" })
  learningOutcomes?: string;
  @Column({ name: "submitted_at", type: "timestamptz", nullable: true })
  submittedAt?: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt!: Date;
}
@Entity("performance_evaluations")
@Index(["placementId"], { unique: true })
export class PerformanceEvaluation {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "placement_id" }) placementId!: string;
  @Column({ name: "author_user_id" }) authorUserId!: string;
  @Column({ default: "DRAFT" }) status!: "DRAFT" | "SUBMITTED";
  @Column("jsonb", { default: {} }) ratings!: Record<string, number>;
  @Column({ nullable: true, type: "text" }) comments?: string;
  @Column({ name: "completion_decision", default: "PENDING" })
  completionDecision!: string;
  @Column({ name: "submitted_at", type: "timestamptz", nullable: true })
  submittedAt?: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt!: Date;
}
@Entity("audit_events")
export class AuditEvent {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "subject_type" }) subjectType!: string;
  @Column({ name: "subject_id" }) subjectId!: string;
  @Column({ name: "event_type" }) eventType!: string;
  @Column({ name: "actor_user_id", nullable: true }) actorUserId?: string;
  @Column("jsonb", { default: {} }) payload!: object;
  @CreateDateColumn({ name: "occurred_at" }) occurredAt!: Date;
}
@Entity("ai_jobs")
export class AiJob {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "requested_by_user_id" }) requestedByUserId!: string;
  @Column() kind!: "MATCH_EXPLANATION" | "REPORT_SUMMARY";
  @Column({ name: "posting_id", nullable: true }) postingId?: string;
  @Column({ name: "report_version_id", nullable: true })
  reportVersionId?: string;
  @Column({ name: "input_fingerprint", length: 64 }) inputFingerprint!: string;
  @Column({ name: "input_snapshot", type: "jsonb" }) inputSnapshot!: object;
  @Column({ name: "prompt_version", default: "v1" }) promptVersion!: string;
  @Column({ default: "PENDING" })
  status!: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED";
  @Column({ default: 0 }) attempts!: number;
  @Column({ name: "claim_token", nullable: true }) claimToken?: string;
  @Column({ name: "lease_expires_at", type: "timestamptz", nullable: true })
  leaseExpiresAt?: Date;
  @Column({ name: "claimed_at", type: "timestamptz", nullable: true })
  claimedAt?: Date;
  @Column({ name: "available_at", type: "timestamptz", default: () => "now()" })
  availableAt!: Date;
  @Column({ name: "completed_at", type: "timestamptz", nullable: true })
  completedAt?: Date;
  @Column({ name: "generated_content", type: "text", nullable: true })
  generatedContent?: string;
  @Column({ name: "error_code", nullable: true }) errorCode?: string;
  @CreateDateColumn({ name: "created_at" }) createdAt!: Date;
}

export const canonicalEntities = [
  UserRole,
  StudentPreference,
  Skill,
  StudentSkill,
  CompanyStaff,
  PostingSkill,
  Program,
  AcademicTerm,
  SupervisorProfile,
  SupervisorAssignment,
  ReportingPeriod,
  Document,
  StudentDocument,
  ApplicationDocument,
  WeeklyReport,
  ReportVersion,
  ReportReview,
  ReportDraftDocument,
  ReportVersionDocument,
  SelfAssessment,
  PerformanceEvaluation,
  AuditEvent,
  AiJob,
];
export const entities = [
  User,
  AuthSession,
  StudentProfile,
  Company,
  Posting,
  SavedPosting,
  Application,
  ApplicationHistory,
  Placement,
  Task,
  Notification,
  ...canonicalEntities,
];
