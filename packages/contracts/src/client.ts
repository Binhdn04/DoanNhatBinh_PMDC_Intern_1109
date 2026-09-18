import type { components } from "./generated/openapi";
type ApiRole = components["schemas"]["Role"];
export interface SessionResponse {
  accessToken: string;
  tokenType: "Bearer";
  activeRole: ApiRole;
  user: { id: string; email: string; fullName: string; roles: ApiRole[] };
}
export interface Profile {
  userId: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  bio?: string;
}
export interface Skill {
  id?: string;
  name: string;
  proficiency?: string;
}
export interface Preferences {
  industries: string[];
  locations: string[];
  workArrangements: string[];
  minDurationWeeks?: number;
  maxDurationWeeks?: number;
}
export interface Document {
  id: string;
  originalName: string;
  contentType: string;
  sizeBytes: string | number;
  state: "PENDING" | "AVAILABLE" | "REJECTED" | "DELETED";
  createdAt?: string;
}
export interface PostingSkill {
  id: string;
  name: string;
  importance: "REQUIRED" | "OPTIONAL";
}
export interface Posting {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  workArrangement: string;
  durationWeeks: number;
  openings: number;
  applicationDeadline: string;
  status: string;
  skills: PostingSkill[];
  match?: { score: number; matchedSkills: string[]; missingSkills: string[] };
}
export interface Application {
  cvDocumentId?: string;
  id: string;
  postingId: string;
  studentId: string;
  status: string;
  contactName?: string;
  contactEmail?: string;
  university?: string;
  major?: string;
  availability?: string;
  coverNote: string;
  submittedAt: string;
  history?: Array<{
    id: string;
    fromStatus?: string;
    toStatus: string;
    actorUserId: string;
    note?: string;
    changedAt: string;
  }>;
}
export interface Supervisor {
  id: string;
  fullName?: string;
  email?: string;
  title?: string;
}
export interface ReportingPeriod {
  id: string;
  weekStart: string;
  weekEnd: string;
  dueAt: string;
}
export interface Report {
  weekStart?: string;
  weekEnd?: string;
  dueAt?: string;
  id: string;
  placementId: string;
  reportingPeriodId: string;
  state: string;
  currentVersionNo: number;
  draft?: {
    reportingPeriodId?: string;
    accomplishments: string;
    challenges: string;
    nextWeekPlan: string;
    attachmentDocumentIds: string[];
  };
  versions?: Array<{
    id: string;
    versionNo: number;
    accomplishments: string;
    challenges: string;
    nextWeekPlan: string;
    submittedAt: string;
    attachmentDocumentIds: string[];
  }>;
  reviews?: Array<{ outcome: string; feedback?: string; reviewedAt: string }>;
}

export interface Placement {
  id: string;
  applicationId: string;
  studentId: string;
  companyId: string;
  status: string;
  startDate: string;
  endDate: string;
}
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate?: string;
}
export interface Notification {
  id: string;
  title: string;
  readAt?: string;
  targetType: string;
  targetId: string;
}
