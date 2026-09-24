import type {
  Application,
  components,
  Document,
  Notification,
  Placement,
  Posting,
  Preferences,
  Profile,
  Report,
  ReportingPeriod,
  SessionResponse,
  Skill,
  Supervisor,
  Task,
} from "../../../../packages/contracts/src";
export type {
  Application,
  Document,
  Notification,
  Placement,
  Posting,
  PostingSkill,
  Preferences,
  Profile,
  Report,
  ReportingPeriod,
  SessionResponse,
  Skill,
  Supervisor,
  Task,
} from "../../../../packages/contracts/src";
export type ApiRole = components["schemas"]["Role"];
export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: ApiRole[];
  memberships: Array<{ companyId: string; title?: string; active: boolean }>;
}
export interface SupervisorAssignment {
  id: string;
  supervisor: Supervisor;
  assignedAt: string;
  assignedByUserId: string;
  reason?: string;
  revokedAt?: string;
  revokedByUserId?: string;
  revocationReason?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "/api/v1").replace(
  /\/$/,
  "",
);
let getToken = () => "";
let onUnauthorized: () => void = () => undefined;

export function configureApi(options: {
  getToken: () => string;
  onUnauthorized: () => void;
}) {
  getToken = options.getToken;
  onUnauthorized = options.onUnauthorized;
}

async function parse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  const body =
    contentType.includes("application/json") || contentType.includes("+json")
      ? await response.json().catch(() => undefined)
      : await response.text().catch(() => "");
  if (!response.ok) {
    if (response.status === 401) onUnauthorized();
    const message =
      typeof body === "object" && body
        ? String(
            (body as { message?: string; detail?: string }).message ??
              (body as { detail?: string }).detail ??
              response.statusText,
          )
        : response.statusText;
    throw new ApiError(
      response.status,
      message || `Request failed (${response.status})`,
      body,
    );
  }
  return body;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  )
    headers.set("Content-Type", "application/json");
  return parse(
    await fetch(`${baseUrl}${path}`, { ...init, headers }),
  ) as Promise<T>;
}

export const endpoints = {
  companies: () => api<Array<{ id: string; name: string }>>("/companies/mine"),
  companyCatalog: () => api<Array<{ id: string; name: string }>>("/companies"),
  publish: (id: string) =>
    api<Posting>(`/postings/${id}/publish`, { method: "POST" }),
  postingLifecycle: (id: string, targetStatus: string) =>
    api<Posting>(`/postings/${id}/lifecycle`, {
      method: "POST",
      body: JSON.stringify({ targetStatus }),
    }),
  transition: (id: string, targetStatus: string) =>
    api<Application>(`/applications/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ targetStatus }),
    }),
  withdraw: (id: string) =>
    api<Application>(`/applications/${id}/withdraw`, { method: "POST" }),
  placements: (page = 1) => api<Placement[]>(`/placements?page=${page}`),
  placement: (id: string) => api<Placement>(`/placements/${id}`),
  placementLifecycle: (id: string, targetStatus: string) =>
    api<Placement>(`/placements/${id}/lifecycle`, {
      method: "POST",
      body: JSON.stringify({ targetStatus }),
    }),
  tasks: (id: string, page = 1) =>
    api<Task[]>(`/placements/${id}/tasks?page=${page}`),
  createTask: (id: string, body: Record<string, unknown>) =>
    api<Task>(`/placements/${id}/tasks`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  taskStatus: (id: string, taskId: string, status: string) =>
    api<Task>(`/placements/${id}/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  notifications: (page = 1) =>
    api<Notification[]>(`/notifications?page=${page}`),
  markRead: (id: string) =>
    api<{ updated: number }>(`/notifications/${id}/read`, { method: "POST" }),

  signIn: (email: string, password: string, activeRole?: ApiRole) =>
    api<SessionResponse>("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({ email, password, activeRole }),
    }),
  signOut: () => api<{ ok: boolean }>("/auth/sign-out", { method: "POST" }),
  register: (fullName: string, email: string, password: string) =>
    api<{ ok: boolean }>("/auth/registrations", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    }),
  requestEmailVerification: (email: string) =>
    api<{ ok: boolean }>("/auth/email-verification-requests", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  verifyEmail: (token: string) =>
    api<{ ok: boolean }>("/auth/email-verifications", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  requestPasswordReset: (email: string) =>
    api<{ ok: boolean }>("/auth/password-reset-requests", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    api<{ ok: boolean }>("/auth/password-resets", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
  me: () => api<{ id: string; roles: ApiRole[]; activeRole: ApiRole }>("/me"),
  setActiveRole: (role: ApiRole) =>
    api<{ activeRole: ApiRole; accessToken: string }>("/me/active-role", {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),
  profile: () => api<Profile>("/students/me"),
  updateProfile: (body: Partial<Profile>) =>
    api<Profile>("/students/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  skills: () => api<Skill[]>("/students/me/skills"),
  setSkills: (skills: Skill[]) =>
    api<Skill[]>("/students/me/skills", {
      method: "PUT",
      body: JSON.stringify({ skills }),
    }),
  preferences: () => api<Preferences>("/students/me/preferences"),
  setPreferences: (body: Preferences) =>
    api<Preferences>("/students/me/preferences", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  documents: () => api<{ items: Document[] }>("/documents"),
  deleteDocument: (id: string) =>
    api<void>(`/documents/${id}`, { method: "DELETE" }),
  beginDocument: (body: {
    originalName: string;
    contentType: string;
    sizeBytes: number;
    sha256: string;
    kind?: string;
  }) =>
    api<{ document: Document; uploadUrl: string }>("/documents", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  completeDocument: (id: string) =>
    api<Document>(`/documents/${id}/complete`, { method: "POST" }),
  downloadUrl: (id: string) =>
    api<{ url: string }>(`/documents/${id}/download-url`),
  postings: (query: { search?: string; sort?: string; page?: number } = {}) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query))
      if (value !== undefined && value !== "") params.set(key, String(value));
    return api<Posting[]>(`/postings?${params}`);
  },
  posting: (id: string) => api<Posting>(`/postings/${id}`),
  createPosting: (
    body: Omit<Posting, "id" | "status" | "skills"> & {
      deadlineTimezone?: string;
      skills: Array<{ id?: string; name: string; importance: string }>;
    },
  ) =>
    api<Posting>("/postings", { method: "POST", body: JSON.stringify(body) }),
  savePosting: (id: string) =>
    api<{ saved: boolean }>(`/postings/${id}/saved`, { method: "PUT" }),
  applications: (page = 1) => api<Application[]>(`/applications?page=${page}`),
  application: (id: string) => api<Application>(`/applications/${id}`),
  apply: (body: Record<string, unknown>) =>
    api<Application>("/applications", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  supervisors: (applicationId: string, search = "") =>
    api<{ items?: Supervisor[] } | Supervisor[]>(
      `/supervisors?applicationId=${encodeURIComponent(applicationId)}&search=${encodeURIComponent(search)}`,
    ),
  placementSupervisors: (placementId: string, search = "") =>
    api<{ items?: Supervisor[] } | Supervisor[]>(
      `/supervisors?placementId=${encodeURIComponent(placementId)}&search=${encodeURIComponent(search)}`,
    ),
  assignmentHistory: (placementId: string) =>
    api<SupervisorAssignment[]>(
      `/placements/${placementId}/supervisor-assignments`,
    ),
  changeAssignment: (
    placementId: string,
    body: {
      expectedAssignmentId: string | null;
      supervisorUserId: string | null;
      reason: string;
    },
  ) =>
    api<SupervisorAssignment>(
      `/placements/${placementId}/supervisor-assignments`,
      { method: "PUT", body: JSON.stringify(body) },
    ),
  accept: (
    id: string,
    body: {
      targetStatus: "ACCEPTED";
      supervisorUserId: string;
      startDate: string;
      endDate: string;
      note?: string;
    },
  ) =>
    api<{ application: Application; placement: { id: string } }>(
      `/applications/${id}/status`,
      { method: "POST", body: JSON.stringify(body) },
    ),
  periods: (placementId: string) =>
    api<ReportingPeriod[]>(`/placements/${placementId}/reporting-periods`),
  reports: (placementId: string) =>
    api<Report[]>(`/placements/${placementId}/reports`),
  report: (id: string) => api<Report>(`/reports/${id}`),
  createReport: (placementId: string, body: Record<string, unknown>) =>
    api<Report>(`/placements/${placementId}/reports`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  patchReport: (id: string, body: Record<string, unknown>) =>
    api<Report>(`/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  submitReport: (id: string) =>
    api<Report>(`/reports/${id}/submit`, { method: "POST" }),
  reviewReport: (id: string, body: Record<string, unknown>) =>
    api<Report>(`/reports/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  selfAssessment: (placementId: string) =>
    api<Record<string, unknown>>(`/placements/${placementId}/self-assessment`),
  putSelfAssessment: (placementId: string, body: Record<string, unknown>) =>
    api<Record<string, unknown>>(`/placements/${placementId}/self-assessment`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  performanceEvaluation: (placementId: string) =>
    api<Record<string, unknown>>(
      `/placements/${placementId}/performance-evaluation`,
    ),
  putPerformanceEvaluation: (
    placementId: string,
    body: Record<string, unknown>,
  ) =>
    api<Record<string, unknown>>(
      `/placements/${placementId}/performance-evaluation`,
      { method: "PUT", body: JSON.stringify(body) },
    ),
  monitoring: (params = "") =>
    api<Record<string, unknown>>(`/monitoring${params ? `?${params}` : ""}`),
  adminUsers: (search = "", page = 1) =>
    api<{ items: AdminUser[]; total: number }>(
      `/admin/users?search=${encodeURIComponent(search)}&page=${page}`,
    ),
  adminUser: (id: string) => api<AdminUser>(`/admin/users/${id}`),
  updateAdminAccount: (
    id: string,
    body: { expectedUpdatedAt: string; isActive: boolean },
  ) =>
    api<AdminUser>(`/admin/users/${id}/account`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  updateAdminRoles: (
    id: string,
    body: { expectedUpdatedAt: string; roles: ApiRole[] },
  ) =>
    api<AdminUser>(`/admin/users/${id}/roles`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  updateAdminMemberships: (
    id: string,
    body: { expectedUpdatedAt: string; memberships: AdminUser["memberships"] },
  ) =>
    api<AdminUser>(`/admin/users/${id}/company-memberships`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

export async function sha256(file: File) {
  const bytes = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(bytes)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function uploadDocument(file: File, kind = "OTHER") {
  const started = await endpoints.beginDocument({
    originalName: file.name,
    contentType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    sha256: await sha256(file),
    kind,
  });
  const response = await fetch(transferUrl(started.uploadUrl), {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  await parse(response);
  return endpoints.completeDocument(started.document.id);
}

export function transferUrl(value: string) {
  const apiOrigin = new URL(baseUrl, window.location.origin).origin;
  const target = new URL(value, apiOrigin);
  if (target.origin !== apiOrigin)
    throw new Error("Unexpected file transfer origin");
  return target.href;
}
export async function downloadDocument(id: string, name: string) {
  const { url } = await endpoints.downloadUrl(id);
  const response = await fetch(transferUrl(url), {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) await parse(response);
  const objectUrl = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
