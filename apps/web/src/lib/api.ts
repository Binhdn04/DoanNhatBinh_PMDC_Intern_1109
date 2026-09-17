export type ApiRole = 'STUDENT' | 'COMPANY_STAFF' | 'SUPERVISOR' | 'ADMIN'

export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly detail?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '')
let getToken = () => ''
let onUnauthorized: () => void = () => undefined

export function configureApi(options: { getToken: () => string; onUnauthorized: () => void }) {
  getToken = options.getToken
  onUnauthorized = options.onUnauthorized
}

async function parse(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json') ? await response.json().catch(() => undefined) : await response.text().catch(() => '')
  if (!response.ok) {
    if (response.status === 401) onUnauthorized()
    const message = typeof body === 'object' && body ? String((body as { message?: string; detail?: string }).message ?? (body as { detail?: string }).detail ?? response.statusText) : response.statusText
    throw new ApiError(response.status, message || `Request failed (${response.status})`, body)
  }
  return body
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return parse(await fetch(`${baseUrl}${path}`, { ...init, headers })) as Promise<T>
}

export interface SessionResponse { accessToken: string; tokenType: 'Bearer'; activeRole: ApiRole; user: { id: string; email: string; fullName: string; roles: ApiRole[] } }
export interface Profile { userId: string; university?: string; major?: string; graduationYear?: number; bio?: string }
export interface Skill { id?: string; name: string; proficiency?: string }
export interface Preferences { industries: string[]; locations: string[]; workArrangements: string[]; minDurationWeeks?: number; maxDurationWeeks?: number }
export interface Document { id: string; originalName: string; contentType: string; sizeBytes: string | number; state: 'PENDING' | 'AVAILABLE' | 'REJECTED' | 'DELETED'; createdAt?: string }
export interface PostingSkill { id: string; name: string; importance: 'REQUIRED' | 'OPTIONAL' }
export interface Posting { id: string; companyId: string; title: string; description: string; category?: string; location?: string; workArrangement: string; durationWeeks: number; openings: number; applicationDeadline: string; status: string; skills: PostingSkill[]; match?: { score: number; matchedSkills: string[]; missingSkills: string[] } }
export interface Application { id: string; postingId: string; studentId: string; status: string; contactName?: string; contactEmail?: string; university?: string; major?: string; availability?: string; coverNote: string; submittedAt: string; history?: Array<{ id: string; fromStatus?: string; toStatus: string; actorUserId: string; note?: string; changedAt: string }> }
export interface Supervisor { id: string; fullName?: string; email?: string; title?: string }
export interface ReportingPeriod { id: string; weekStart: string; weekEnd: string; dueAt: string }
export interface Report { id: string; placementId: string; reportingPeriodId: string; state: string; currentVersionNo: number; draftAccomplishments?: string; draftChallenges?: string; draftNextWeekPlan?: string; versions?: Array<{ id: string; versionNo: number; accomplishments: string; challenges: string; nextWeekPlan: string; submittedAt: string }>; reviews?: Array<{ outcome: string; feedback?: string; reviewedAt: string }> }

export const endpoints = {
  signIn: (email: string, password: string, activeRole?: ApiRole) => api<SessionResponse>('/auth/sign-in', { method: 'POST', body: JSON.stringify({ email, password, activeRole }) }),
  signOut: () => api<{ ok: boolean }>('/auth/sign-out', { method: 'POST' }),
  me: () => api<{ id: string; roles: ApiRole[]; activeRole: ApiRole }>('/me'),
  setActiveRole: (role: ApiRole) => api<{ activeRole: ApiRole; accessToken: string }>('/me/active-role', { method: 'PUT', body: JSON.stringify({ role }) }),
  profile: () => api<Profile>('/students/me'), updateProfile: (body: Partial<Profile>) => api<Profile>('/students/me', { method: 'PATCH', body: JSON.stringify(body) }),
  skills: () => api<Skill[]>('/students/me/skills'), setSkills: (skills: Skill[]) => api<Skill[]>('/students/me/skills', { method: 'PUT', body: JSON.stringify({ skills }) }),
  preferences: () => api<Preferences>('/students/me/preferences'), setPreferences: (body: Preferences) => api<Preferences>('/students/me/preferences', { method: 'PUT', body: JSON.stringify(body) }),
  documents: () => api<{ items: Document[] }>('/documents'), deleteDocument: (id: string) => api<void>(`/documents/${id}`, { method: 'DELETE' }),
  beginDocument: (body: { originalName: string; contentType: string; sizeBytes: number; sha256: string; kind?: string }) => api<{ document: Document; uploadUrl: string }>('/documents', { method: 'POST', body: JSON.stringify(body) }),
  completeDocument: (id: string) => api<Document>(`/documents/${id}/complete`, { method: 'POST' }), downloadUrl: (id: string) => api<{ url: string }>(`/documents/${id}/download-url`),
  postings: () => api<Posting[]>('/postings'), posting: (id: string) => api<Posting>(`/postings/${id}`), createPosting: (body: Omit<Posting, 'id' | 'status' | 'skills'> & { deadlineTimezone?: string; skills: Array<{ id?: string; name: string; importance: string }> }) => api<Posting>('/postings', { method: 'POST', body: JSON.stringify(body) }),
  savePosting: (id: string) => api<{ saved: boolean }>(`/postings/${id}/saved`, { method: 'PUT' }),
  applications: () => api<Application[]>('/applications'), application: (id: string) => api<Application>(`/applications/${id}`), apply: (body: Record<string, unknown>) => api<Application>('/applications', { method: 'POST', body: JSON.stringify(body) }),
  supervisors: (applicationId: string, search = '') => api<{ items?: Supervisor[] } | Supervisor[]>(`/supervisors?applicationId=${encodeURIComponent(applicationId)}&search=${encodeURIComponent(search)}`), accept: (id: string, body: { status: 'ACCEPTED'; supervisorUserId: string; startDate: string; endDate: string; note?: string }) => api<{ application: Application; placement: { id: string } }>(`/applications/${id}/status`, { method: 'POST', body: JSON.stringify(body) }),
  periods: (placementId: string) => api<ReportingPeriod[]>(`/placements/${placementId}/reporting-periods`), reports: (placementId: string) => api<Report[]>(`/placements/${placementId}/reports`), report: (id: string) => api<Report>(`/reports/${id}`),
  createReport: (placementId: string, body: Record<string, unknown>) => api<Report>(`/placements/${placementId}/reports`, { method: 'POST', body: JSON.stringify(body) }), patchReport: (id: string, body: Record<string, unknown>) => api<Report>(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify(body) }), submitReport: (id: string) => api<Report>(`/reports/${id}/submit`, { method: 'POST' }), reviewReport: (id: string, body: Record<string, unknown>) => api<Report>(`/reports/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
  selfAssessment: (placementId: string) => api<Record<string, unknown>>(`/placements/${placementId}/self-assessment`), putSelfAssessment: (placementId: string, body: Record<string, unknown>) => api<Record<string, unknown>>(`/placements/${placementId}/self-assessment`, { method: 'PUT', body: JSON.stringify(body) }),
  performanceEvaluation: (placementId: string) => api<Record<string, unknown>>(`/placements/${placementId}/performance-evaluation`), putPerformanceEvaluation: (placementId: string, body: Record<string, unknown>) => api<Record<string, unknown>>(`/placements/${placementId}/performance-evaluation`, { method: 'PUT', body: JSON.stringify(body) }),
  monitoring: (params = '') => api<Record<string, unknown>>(`/monitoring${params ? `?${params}` : ''}`), createAiJob: (body: Record<string, unknown>) => api<{ id: string; status: string }>('/ai-jobs', { method: 'POST', body: JSON.stringify(body) }), aiJob: (id: string) => api<{ id: string; status: string; generatedContent?: string; errorCode?: string }>(`/ai-jobs/${id}`),
}

export async function sha256(file: File) {
  const bytes = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  return [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, '0')).join('')
}

export async function uploadDocument(file: File, kind = 'OTHER') {
  const started = await endpoints.beginDocument({ originalName: file.name, contentType: file.type || 'application/octet-stream', sizeBytes: file.size, sha256: await sha256(file), kind })
  const response = await fetch(started.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream', Authorization: `Bearer ${getToken()}` } })
  await parse(response)
  return endpoints.completeDocument(started.document.id)
}
