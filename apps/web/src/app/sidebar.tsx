import type { Screen } from './types';
// ─── Sidebar Navigation ───────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'discover', label: 'Discover', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="5.5"/><path d="M14.5 14.5l-2.5-2.5"/>
    </svg>
  )},
  { id: 'applications', label: 'My Applications', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="12" height="14" rx="2"/><path d="M6 6h6M6 9h6M6 12h3"/>
    </svg>
  )},
  { id: 'internship', label: 'My Internship', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="14" height="9" rx="2"/><path d="M6 7V5a3 3 0 016 0v2"/>
    </svg>
  )},
  { id: 'reports', label: 'Weekly Reports', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14V8l6-5 6 5v6M7 16v-5h4v5"/>
    </svg>
  )},
  { id: 'evaluation', label: 'Evaluation', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2L10.5 6.5H15.5L11.5 9.5L13 14L9 11.5L5 14L6.5 9.5L2.5 6.5H7.5L9 2Z"/>
    </svg>
  )},
  { id: 'profile-org', label: 'Profile', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="6" r="3"/><path d="M3 16c0-3.314 2.686-5 6-5s6 1.686 6 5"/>
    </svg>
  )},
  { id: 'admin-dashboard', label: 'Admin', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="6" height="6" rx="1.5"/><rect x="10" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="10" width="6" height="6" rx="1.5"/><rect x="10" y="10" width="6" height="6" rx="1.5"/>
    </svg>
  )},
];

export function Sidebar({ activeScreen, onNavigate }: { activeScreen: Screen; onNavigate: (s: Screen) => void }) {
  const activeNav = (s: Screen) => {
    if (s === 'discover' && (activeScreen === 'discover' || activeScreen === 'detail' || activeScreen === 'apply')) return true;
    if (s === 'applications' && (activeScreen === 'applications' || activeScreen === 'interview' || activeScreen === 'interview-result')) return true;
    if (s === 'internship' && (activeScreen === 'internship' || activeScreen === 'weekly-report' || activeScreen === 'supervisor-review')) return true;
    if (s === 'reports' && activeScreen === 'reports') return true;
    if (s === 'evaluation' && activeScreen === 'evaluation') return true;
    if (s === 'profile-org' && (activeScreen === 'profile-org' || activeScreen === 'profile')) return true;
    if (s === 'admin-dashboard' && activeScreen === 'admin-dashboard') return true;
    return false;
  };

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-white border-r border-slate-200 shrink-0">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L10 6.5L15 7L11.5 10.5L12.5 15L8 12.5L3.5 15L4.5 10.5L1 7L6 6.5L8 2Z" fill="white"/>
          </svg>
        </div>
        <span className="font-bold text-slate-900 text-base" style={{ fontFamily: "'DM Sans', sans-serif" }}>InternHub</span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(item => {
          const active = activeNav(item.id as Screen);
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Screen)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left w-full ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={active ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 px-3 py-2.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-blue-600">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L8.5 5H13L9.5 7.5L11 11.5L7 9L3 11.5L4.5 7.5L1 5H5.5L7 1Z" fill="currentColor"/>
            </svg>
          </span>
          <span className="text-xs font-semibold text-blue-800">AI Matching Active</span>
        </div>
        <p className="text-xs text-blue-600/80">Your profile is 84% complete</p>
      </div>

      <div className="flex items-center gap-3 px-4 py-4 border-t border-slate-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">BD</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">Binh Do</p>
          <p className="text-xs text-slate-500 truncate">HUST · CS 2025</p>
        </div>
      </div>
    </aside>
  );
}
