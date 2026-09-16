export type Role = 'Student' | 'Company Staff' | 'Supervisor' | 'Admin';

export type View =
  | 'discover' | 'saved' | 'posting-detail' | 'apply' | 'applications' | 'application-detail'
  | 'placement' | 'reports' | 'report-editor' | 'report-detail' | 'evaluations' | 'self-assessment'
  | 'profile' | 'company' | 'companies' | 'postings' | 'posting-editor' | 'applicants'
  | 'application-review' | 'placements' | 'tasks' | 'report-review' | 'performance-evaluation'
  | 'monitoring' | 'notifications' | 'access-denied';

export interface Route { view: View; recordId?: string; tab?: string }

export const landingByRole: Record<Role, View> = {
  Student: 'discover', 'Company Staff': 'postings', Supervisor: 'placements', Admin: 'monitoring',
};

export const navigationByRole: Record<Role, Array<{ view: View; label: string; icon: string }>> = {
  Student: [
    { view: 'discover', label: 'Discover', icon: '⌕' }, { view: 'saved', label: 'Saved', icon: '♡' },
    { view: 'applications', label: 'Applications', icon: '▤' }, { view: 'placement', label: 'Placement', icon: '▣' },
    { view: 'reports', label: 'Reports', icon: '◫' }, { view: 'evaluations', label: 'Evaluation', icon: '☆' },
    { view: 'profile', label: 'Profile', icon: '◉' },
  ],
  'Company Staff': [
    { view: 'company', label: 'Company', icon: '▥' }, { view: 'postings', label: 'Postings', icon: '▤' },
    { view: 'applications', label: 'Applications', icon: '◫' }, { view: 'placements', label: 'Placements', icon: '▣' },
  ],
  Supervisor: [
    { view: 'placements', label: 'Assigned placements', icon: '▣' }, { view: 'report-review', label: 'Reports', icon: '◫' },
    { view: 'evaluations', label: 'Evaluations', icon: '☆' },
  ],
  Admin: [
    { view: 'monitoring', label: 'Monitoring', icon: '▦' }, { view: 'companies', label: 'Companies', icon: '▥' },
    { view: 'postings', label: 'Postings', icon: '▤' }, { view: 'applications', label: 'Applications', icon: '◫' },
    { view: 'placements', label: 'Placements', icon: '▣' }, { view: 'evaluations', label: 'Evaluations', icon: '☆' },
  ],
};
