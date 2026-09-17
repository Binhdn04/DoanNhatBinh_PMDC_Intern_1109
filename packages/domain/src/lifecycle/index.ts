export type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'REJECTED', 'WITHDRAWN'], UNDER_REVIEW: ['INTERVIEW', 'REJECTED', 'WITHDRAWN'], INTERVIEW: ['ACCEPTED', 'REJECTED', 'WITHDRAWN'], ACCEPTED: [], REJECTED: [], WITHDRAWN: [],
};
export const canTransitionApplication = (from: ApplicationStatus, to: ApplicationStatus, actor: 'student' | 'staff') => actor === 'student' ? to === 'WITHDRAWN' && transitions[from].includes(to) : transitions[from].includes(to) && to !== 'WITHDRAWN';
