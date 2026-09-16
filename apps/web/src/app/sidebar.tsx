import type { Role, Route, View } from './types';
import { navigationByRole } from './types';

export function Sidebar({ role, route, navigate, close }: { role: Role; route: Route; navigate: (view: View) => void; close?: () => void }) {
  return <aside className="shell-sidebar" aria-label="Primary navigation">
    <div className="brand"><span aria-hidden="true">✦</span> InternHub</div>
    <nav className="nav-list">
      {navigationByRole[role].map(item => <button key={item.view} className={route.view === item.view || (item.view === 'placement' && ['tasks', 'reports', 'report-detail', 'report-editor'].includes(route.view)) ? 'nav-item active' : 'nav-item'} onClick={() => { navigate(item.view); close?.(); }}>
        <span aria-hidden="true">{item.icon}</span>{item.label}
      </button>)}
    </nav>
    <div className="sidebar-role"><span className="eyebrow">Active role</span><strong>{role}</strong><span>Mock workspace</span></div>
  </aside>;
}
