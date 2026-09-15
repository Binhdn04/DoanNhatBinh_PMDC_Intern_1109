
// ─── Screen 12: Admin Dashboard ───────────────────────────────────────────────

const ADMIN_INTERNSHIPS = [
  { student: 'Binh Do', company: 'FPT Software', role: 'AI Engineer Intern', status: 'Active', progress: 72, week: 4 },
  { student: 'Minh Tran', company: 'VinAI Research', role: 'ML Engineer Intern', status: 'Active', progress: 85, week: 6 },
  { student: 'Linh Nguyen', company: 'Tiki Corporation', role: 'Frontend Developer Intern', status: 'Active', progress: 60, week: 3 },
  { student: 'Hoa Le', company: 'MoMo', role: 'Backend Engineer Intern', status: 'Completed', progress: 100, week: 12 },
  { student: 'Nam Pham', company: 'Grab Vietnam', role: 'Data Analyst Intern', status: 'Pending', progress: 0, week: 0 },
  { student: 'Thu Vo', company: 'VNG Cloud', role: 'Cloud Infra Intern', status: 'Active', progress: 45, week: 2 },
];

const DEADLINES = [
  { date: 'Sep 15', label: 'Week 04 Report due', student: 'Binh Do', type: 'report' },
  { date: 'Sep 16', label: 'Mid-term evaluation', student: 'Minh Tran', type: 'eval' },
  { date: 'Sep 18', label: 'Week 04 Report due', student: 'Linh Nguyen', type: 'report' },
  { date: 'Sep 20', label: 'Onboarding deadline', student: 'Nam Pham', type: 'admin' },
];

const NOTIFICATIONS = [
  { time: '2h ago', text: 'Binh Do submitted Week 04 report', icon: '📄', color: 'text-blue-600' },
  { time: '4h ago', text: 'Minh Tran evaluation approved by supervisor', icon: '✓', color: 'text-emerald-600' },
  { time: '1d ago', text: 'Hoa Le completed internship at MoMo', icon: '🎉', color: 'text-violet-600' },
  { time: '1d ago', text: 'Nam Pham accepted offer at Grab Vietnam', icon: '→', color: 'text-slate-600' },
  { time: '2d ago', text: 'Thu Vo missed Week 01 report deadline', icon: '!', color: 'text-red-500' },
];

const STATUS_CHART_DATA = [
  { label: 'Active', value: 3, color: '#2563eb' },
  { label: 'Completed', value: 1, color: '#059669' },
  { label: 'Pending', value: 1, color: '#f59e0b' },
  { label: 'Applications', value: 12, color: '#7c3aed' },
];

export function AdminDashboardScreen() {
  const totalStudents = ADMIN_INTERNSHIPS.length;
  const activeCount = ADMIN_INTERNSHIPS.filter(i => i.status === 'Active').length;
  const completedCount = ADMIN_INTERNSHIPS.filter(i => i.status === 'Completed').length;
  const maxChart = Math.max(...STATUS_CHART_DATA.map(d => d.value));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Internship Monitoring</h1>
          <p className="text-sm text-slate-500 mt-0.5">University Coordinator Dashboard · Sep 15, 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="4.5"/><path d="M6 4v2.5L7.5 8"/></svg>
            HUST · Fall 2026
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: totalStudents, sub: 'Enrolled this semester', color: 'text-slate-900', bg: 'bg-white', border: 'border-slate-200', icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="6" r="3"/><path d="M3 16c0-3.3 2.7-5 6-5s6 1.7 6 5"/></svg>
            )},
            { label: 'Active Internships', value: activeCount, sub: 'Currently ongoing', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="7" width="14" height="9" rx="2"/><path d="M6 7V5a3 3 0 016 0v2"/></svg>
            )},
            { label: 'Applications', value: 24, sub: '+5 this week', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-100', icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="2" width="12" height="14" rx="2"/><path d="M6 6h6M6 9h6M6 12h3"/></svg>
            )},
            { label: 'Completed', value: completedCount, sub: 'This semester', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"><path d="M3 9l4.5 4.5L15 6"/></svg>
            )},
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl px-5 py-4 flex items-start gap-3`}>
              <div className={`w-8 h-8 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center shrink-0`}>{s.icon}</div>
              <div>
                <p className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.value}</p>
                <p className="text-xs font-medium text-slate-700">{s.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Internship status table */}
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Student Internships</h2>
              <span className="text-xs text-slate-400">{ADMIN_INTERNSHIPS.length} total</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500">Student</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Role</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Progress</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Week</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ADMIN_INTERNSHIPS.map((item, i) => {
                    const statusStyle = item.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-200' : item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200';
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-900">{item.student}</p>
                          <p className="text-xs text-slate-500">{item.company}</p>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600 max-w-[140px] truncate">{item.role}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full bg-blue-500" style={{ width: `${item.progress}%` }} />
                            </div>
                            <span className="text-xs font-medium text-slate-700">{item.progress}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusStyle}`}>{item.status}</span>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-500">{item.week > 0 ? `W${item.week}` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Simple bar chart */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">Internship Status</h2>
              </div>
              <div className="px-5 py-4 flex flex-col gap-3">
                {STATUS_CHART_DATA.map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">{item.label}</span>
                      <span className="text-xs font-bold text-slate-900">{item.value}</span>
                    </div>
                    <div className="h-4 rounded-md bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-md transition-all"
                        style={{ width: `${(item.value / maxChart) * 100}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming deadlines */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">Upcoming Deadlines</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {DEADLINES.map((d, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] text-slate-500 leading-none">{d.date.split(' ')[0]}</span>
                      <span className="text-xs font-bold text-slate-900 leading-none">{d.date.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{d.label}</p>
                      <p className="text-[10px] text-slate-400">{d.student}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${d.type === 'report' ? 'bg-blue-50 text-blue-600 border-blue-100' : d.type === 'eval' ? 'bg-violet-50 text-violet-600 border-violet-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {d.type === 'report' ? 'Report' : d.type === 'eval' ? 'Eval' : 'Admin'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent notifications */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {NOTIFICATIONS.map((n, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <span className={`text-base w-6 text-center shrink-0 ${n.color}`}>{n.icon}</span>
                <p className="flex-1 text-sm text-slate-700">{n.text}</p>
                <span className="text-xs text-slate-400 shrink-0">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
