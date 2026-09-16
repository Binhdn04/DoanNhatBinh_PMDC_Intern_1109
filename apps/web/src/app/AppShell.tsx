import { useState } from 'react';
import { Sidebar } from './sidebar';
import { landingByRole, type Role, type Route, type View } from './types';
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
  const [drawer, setDrawer] = useState(false); const [panel, setPanel] = useState(false); const [read, setRead] = useState<string[]>([]);
  const navigate = (view: View, recordId?: string, tab?: string) => { setRoute({ view, recordId, tab }); setPanel(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const changeRole = (next: Role) => { setRole(next); setRoute({ view: landingByRole[next] }); setDrawer(false); setPanel(false); };
  const unread = notifications.filter(n => n.unread && !read.includes(n.title)).length;
  return <div className={`app ${drawer ? 'drawer-open' : ''}`}>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <Sidebar role={role} route={route} navigate={navigate} close={() => setDrawer(false)}/>
    <div className="shell-main">
      <header className="topbar"><button className="mobile-menu" aria-label="Open navigation menu" aria-expanded={drawer} onClick={() => setDrawer(v => !v)}>☰</button><button aria-label="Open notifications" aria-expanded={panel} onClick={() => setPanel(v => !v)}>◔ <sup>{unread || ''}</sup></button><select className="role-menu" aria-label="Active role" value={role} onChange={e => changeRole(e.target.value as Role)}>{(['Student', 'Company Staff', 'Supervisor', 'Admin'] as Role[]).map(r => <option key={r}>{r}</option>)}</select><button aria-label="Account menu">BD⌄</button>
        {panel && <Card className="notification-panel"><header><strong>Notifications</strong><button onClick={() => setRead(notifications.map(n => n.title))}>Mark all read</button></header>{notifications.map(n => <button className={`item ${n.unread && !read.includes(n.title) ? 'unread' : ''}`} key={n.title} onClick={() => { setRead(x => [...x, n.title]); navigate(n.view); }}><strong>{n.title}</strong><small>{n.time}</small></button>)}<button className="item" onClick={() => navigate('notifications')}>Open notification inbox</button></Card>}
      </header>
      <main id="main-content" className="content"><Workspace role={role} route={route} navigate={navigate}/></main>
    </div>
  </div>;
}
