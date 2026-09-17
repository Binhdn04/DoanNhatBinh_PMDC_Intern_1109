import { useState } from 'react';
import { landingByRole, navigationByRole, type Role, type Route, type View } from './types';
import { Card } from '@/shared/ui';
import { Workspace } from '@/features/workspace/Workspace';

const notifications = [
  { title: 'Your Week 2 report was submitted', time: '15 minutes ago', view: 'report-detail' as View, unread: true },
  { title: 'Application status changed to Under Review', time: '2 hours ago', view: 'application-detail' as View, unread: true },
  { title: 'A supervisor added a new task', time: 'Yesterday', view: 'tasks' as View, unread: false },
];

export default function AppShell() {
  const [role, setRole] = useState<Role>('Student');
  const [route, setRoute] = useState<Route>({ view: 'discover' });
  const [drawer, setDrawer] = useState(false);
  const [panel, setPanel] = useState(false);
  const [read, setRead] = useState<string[]>([]);
  const unread = notifications.filter(item => item.unread && !read.includes(item.title)).length;
  const items = navigationByRole[role];

  const navigate = (view: View, recordId?: string, tab?: string) => {
    setRoute({ view, recordId, tab });
    setPanel(false);
    setDrawer(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const changeRole = (next: Role) => {
    setRole(next);
    setRoute({ view: landingByRole[next] });
    setDrawer(false);
    setPanel(false);
  };
  const isActive = (view: View) => route.view === view || (view === 'placement' && ['tasks', 'reports', 'report-detail', 'report-editor', 'evaluations', 'self-assessment'].includes(route.view));

  const navigation = (mobile = false) => (
    <nav className={mobile ? 'drawer-nav' : 'header-nav'} aria-label="Primary navigation">
      {items.map(item => (
        <button key={item.view} className={isActive(item.view) ? 'nav-link active' : 'nav-link'} aria-current={isActive(item.view) ? 'page' : undefined} onClick={() => navigate(item.view)}>
          <span aria-hidden="true">{item.icon}</span>{item.label}
        </button>
      ))}
    </nav>
  );

  return <div className="app">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="topbar">
      <div className="header-inner">
        <button className="mobile-menu icon-button" aria-label="Open navigation menu" aria-expanded={drawer} aria-controls="mobile-navigation" onClick={() => setDrawer(value => !value)}>☰</button>
        <button className="brand" onClick={() => navigate(landingByRole[role])} aria-label="InternHub home"><span aria-hidden="true">✦</span>InternHub</button>
        {navigation()}
        <div className="header-actions">
          <button className="icon-button notification-button" aria-label={`Open notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={panel} onClick={() => setPanel(value => !value)}>♢{unread > 0 && <span className="notification-count">{unread}</span>}</button>
          <label className="role-switch"><span className="sr-only">Active role</span><select value={role} onChange={event => changeRole(event.target.value as Role)}>{(['Student', 'Company Staff', 'Supervisor', 'Admin'] as Role[]).map(item => <option key={item}>{item}</option>)}</select></label>
          <button className="account-button" aria-label="Account menu">BD <span aria-hidden="true">⌄</span></button>
        </div>
      </div>
      {panel && <Card className="notification-panel" role="region" aria-label="Recent notifications"><header><strong>Notifications</strong><button className="text-button" onClick={() => setRead(notifications.map(item => item.title))}>Mark all read</button></header>{notifications.map(item => <button className={`notification-item ${item.unread && !read.includes(item.title) ? 'unread' : ''}`} key={item.title} onClick={() => { setRead(items => [...items, item.title]); navigate(item.view); }}><strong>{item.title}</strong><small>{item.time}</small></button>)}<button className="notification-item notification-inbox" onClick={() => navigate('notifications')}>Open notification inbox</button></Card>}
    </header>
    {drawer && <><button className="drawer-backdrop" aria-label="Close navigation menu" onClick={() => setDrawer(false)} /><aside id="mobile-navigation" className="mobile-drawer" aria-label="Mobile navigation"><div className="drawer-header"><strong>Navigate</strong><button className="icon-button" aria-label="Close navigation menu" onClick={() => setDrawer(false)}>×</button></div>{navigation(true)}</aside></>}
    <main id="main-content" className="content"><Workspace role={role} route={route} navigate={navigate}/></main>
  </div>;
}
