import { useState } from 'react';
import { Button, FormField, Input, Select } from '@/shared/ui';
// ─── Screen 11: Profile & Organization ───────────────────────────────────────

type ProfileTab = 'Profile' | 'Skills & Preferences' | 'Organization';

const SKILL_TAGS = ['Python', 'Machine Learning', 'TensorFlow', 'Computer Vision', 'Git', 'FastAPI', 'Docker', 'PyTorch', 'SQL', 'Linux'];
const PREFERRED_INDUSTRIES = ['AI / Machine Learning', 'Technology', 'Research', 'Fintech'];
const PREFERRED_LOCATIONS = ['Hanoi', 'Remote', 'Ho Chi Minh City'];

export function ProfileOrgScreen() {
  const [tab, setTab] = useState<ProfileTab>('Profile');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 py-5 bg-white border-b border-slate-200 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Profile & Organization</h1>
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          {(['Profile', 'Skills & Preferences', 'Organization'] as ProfileTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-5">

          {tab === 'Profile' && (
            <>
              {/* Avatar + name */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0">BD</div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Binh Do</h2>
                  <p className="text-sm text-slate-500">Computer Science · HUST Class of 2025</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">Student</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Active Intern</span>
                  </div>
                </div>
                <Button variant="secondary" size="sm">Edit Profile</Button>
              </div>

              {/* Personal info */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
                </div>
                <div className="px-5 py-5 grid grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', value: 'Binh Do' },
                    { label: 'Email', value: 'binh.do@sis.hust.edu.vn' },
                    { label: 'Phone', value: '+84 98 765 4321' },
                    { label: 'University', value: 'Hanoi University of Science and Technology' },
                    { label: 'Major', value: 'Computer Science' },
                    { label: 'Expected Graduation', value: 'May 2025' },
                    { label: 'GPA', value: '3.72 / 4.00' },
                    { label: 'Student ID', value: 'HUST-20200462' },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                      <p className="text-sm font-medium text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile completeness */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Profile completeness</p>
                  <div className="h-2 rounded-full bg-blue-200 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: '84%' }} />
                  </div>
                  <p className="text-xs text-blue-600 mt-1">84% — Add a portfolio link to reach 100%</p>
                </div>
                <span className="text-2xl font-bold text-blue-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>84%</span>
              </div>
            </>
          )}

          {tab === 'Skills & Preferences' && (
            <>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Technical Skills</h3>
                  <Button variant="ghost" size="sm">+ Add skill</Button>
                </div>
                <div className="px-5 py-4 flex flex-wrap gap-2">
                  {SKILL_TAGS.map(s => (
                    <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-50 text-slate-700 border border-slate-200 group hover:border-red-200 hover:bg-red-50 transition-all cursor-default">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Internship Preferences</h3>
                </div>
                <div className="px-5 py-5 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Preferred Industries</p>
                    <div className="flex flex-col gap-2">
                      {PREFERRED_INDUSTRIES.map(ind => (
                        <div key={ind} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />{ind}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Preferred Locations</p>
                    <div className="flex flex-col gap-2">
                      {PREFERRED_LOCATIONS.map(loc => (
                        <div key={loc} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />{loc}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Work Type</p>
                    <div className="flex flex-wrap gap-2">
                      {['Full-time', 'Remote'].map(t => (
                        <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Duration</p>
                    <p className="text-sm text-slate-700">3–6 months</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
                </div>
                <div className="px-5 py-4 flex flex-col gap-3">
                  {[
                    { name: 'Binh_Do_CV.pdf', type: 'CV', size: '2.4 MB', updated: 'Sep 1, 2026' },
                    { name: 'Portfolio_2026.pdf', type: 'Portfolio', size: '5.1 MB', updated: 'Aug 20, 2026' },
                  ].map(doc => (
                    <div key={doc.name} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="w-9 h-9 rounded-lg bg-red-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">PDF</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.type} · {doc.size} · Updated {doc.updated}</p>
                      </div>
                      <Button variant="ghost" size="sm">Replace</Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'Organization' && (
            <>
              {/* Company profile */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: '#f97316' }}>FP</div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">FPT Software</h3>
                    <p className="text-xs text-slate-500">Technology / IT Services</p>
                  </div>
                </div>
                <div className="px-5 py-5 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Industry', value: 'Technology / IT Services' },
                    { label: 'Headcount', value: '35,000+' },
                    { label: 'Location', value: 'Hanoi, Vietnam' },
                    { label: 'Founded', value: '1999' },
                    { label: 'Website', value: 'fpt-software.com' },
                    { label: 'Contact', value: 'hr@fpt-software.com' },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                      <p className="text-sm font-medium text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <p className="text-xs text-slate-500 mb-1.5">About</p>
                  <p className="text-sm text-slate-700 leading-relaxed">FPT Software is one of Southeast Asia's largest IT services companies, serving 1,000+ clients across 30 countries. Our AI division focuses on applied machine learning, computer vision, and NLP.</p>
                </div>
              </div>

              {/* Internship posting */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Internship Posting</h3>
                </div>
                <div className="px-5 py-5 grid grid-cols-2 gap-4">
                  {[
                    { label: 'Position', value: 'AI Engineer Intern' },
                    { label: 'Status', value: 'Active' },
                    { label: 'Posted', value: 'Nov 1, 2026' },
                    { label: 'Deadline', value: 'Dec 31, 2026' },
                    { label: 'Duration', value: '3 months' },
                    { label: 'Stipend', value: '8M–12M VND/month' },
                    { label: 'Applicants', value: '143' },
                    { label: 'Interviews sent', value: '28' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-xs text-slate-500">{item.label}</span>
                      <span className={`text-sm font-medium ${item.label === 'Status' ? 'text-emerald-700' : 'text-slate-900'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account role */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Account & Role</h3>
                </div>
                <div className="px-5 py-4 flex flex-col gap-3">
                  {[
                    { role: 'Student', desc: 'Binh Do — can apply, complete interviews, submit reports', active: true },
                    { role: 'Supervisor', desc: 'Nguyen Van A — can review reports and evaluate interns', active: false },
                    { role: 'Admin', desc: 'University Coordinator — can monitor all internships', active: false },
                  ].map(item => (
                    <div key={item.role} className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${item.active ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${item.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {item.role[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${item.active ? 'text-blue-900' : 'text-slate-700'}`}>{item.role}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      {item.active && <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">Current</span>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

