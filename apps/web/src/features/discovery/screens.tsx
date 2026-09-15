import { useState } from 'react';
import { Button, Select, SkillTag } from '@/shared/ui';
import { INTERNSHIPS, type Internship, matchColor, workTypeBadge } from './data';
// ─── Screen 1: Discover ───────────────────────────────────────────────────────

const CATEGORIES = ['All Categories', 'Engineering', 'Data Science', 'Design', 'Marketing', 'Finance'];
const LOCATIONS = ['All Locations', 'Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Remote'];
const DURATIONS = ['Any Duration', '1–2 months', '3 months', '4–6 months', '6+ months'];
const WORK_TYPES = ['All Types', 'Full-time', 'Part-time', 'Remote', 'Hybrid', 'On-site'];
const SORT_OPTIONS = ['Relevance', 'Newest', 'Match Score'];

function InternshipCard({ intern, onView }: { intern: Internship; onView: () => void }) {
  const c = matchColor(intern.matchScore);
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 group flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: intern.companyColor }}>
            {intern.companyInitial}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{intern.title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{intern.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold shrink-0" style={{ background: c.bg, color: c.text }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1L7.5 4.5H11L8.25 6.75L9.25 10.5L6 8.5L2.75 10.5L3.75 6.75L1 4.5H4.5L6 1Z"/></svg>
          {intern.matchScore}%
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 1C4.067 1 2.5 2.567 2.5 4.5c0 3 3.5 6.5 3.5 6.5s3.5-3.5 3.5-6.5C9.5 2.567 7.933 1 6 1z"/><circle cx="6" cy="4.5" r="1"/></svg>
          {intern.location}
        </span>
        <span>·</span>
        <span>{intern.duration}</span>
        <span>·</span>
        <span className={`px-1.5 py-0.5 rounded font-medium ${workTypeBadge(intern.workType)}`}>{intern.workType}</span>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{intern.description}</p>

      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5 text-blue-500">
          <path d="M7 1L8.5 5H13L9.5 7.5L11 11.5L7 9L3 11.5L4.5 7.5L1 5H5.5L7 1Z" fill="currentColor"/>
        </svg>
        <p className="text-xs text-blue-700">{intern.matchReason}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {intern.skills.slice(0, 4).map(s => <SkillTag key={s} label={s} />)}
        {intern.skills.length > 4 && <span className="text-xs text-slate-400 px-2 py-0.5">+{intern.skills.length - 4}</span>}
      </div>

      <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Match</span>
            <span className="text-xs font-semibold" style={{ color: c.text }}>{intern.matchScore}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${intern.matchScore}%`, background: c.bar }} />
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={onView}>View Details</Button>
      </div>
    </div>
  );
}

function FilterChip({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`appearance-none pl-3 pr-7 py-1.5 text-sm rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${value !== options[0] ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4.5l3 3 3-3"/></svg>
      </div>
    </div>
  );
}

export function DiscoverScreen({ onViewDetail }: { onViewDetail: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [workType, setWorkType] = useState(WORK_TYPES[0]);
  const [sort, setSort] = useState(SORT_OPTIONS[0]);

  const filtered = INTERNSHIPS.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !q || i.title.toLowerCase().includes(q) || i.company.toLowerCase().includes(q) || i.skills.some(s => s.toLowerCase().includes(q));
    const matchLoc = location === LOCATIONS[0] || i.location.includes(location);
    const matchWt = workType === WORK_TYPES[0] || i.workType === workType;
    return matchQ && matchLoc && matchWt;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'Match Score') return b.matchScore - a.matchScore;
    if (sort === 'Newest') return a.postedDays - b.postedDays;
    return b.matchScore - a.matchScore;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 pt-8 pb-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Find your next internship</h1>
            <p className="text-sm text-slate-500 mt-1">AI-matched opportunities based on your profile and skills</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-medium text-blue-700">AI matching active</span>
          </div>
        </div>

        <div className="relative mb-4">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><circle cx="8" cy="8" r="5.5"/><path d="M14.5 14.5l-2.5-2.5"/></svg>
          </div>
          <input
            type="text"
            placeholder="Search internships, skills, or companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-500 mr-1">Filter:</span>
          <FilterChip label="Category" options={CATEGORIES} value={category} onChange={setCategory} />
          <FilterChip label="Location" options={LOCATIONS} value={location} onChange={setLocation} />
          <FilterChip label="Duration" options={DURATIONS} value={duration} onChange={setDuration} />
          <FilterChip label="Work Type" options={WORK_TYPES} value={workType} onChange={setWorkType} />
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-500">Sort:</span>
            <FilterChip label="Sort" options={SORT_OPTIONS} value={sort} onChange={setSort} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{sorted.length * 21}</span> internships found
            {search && <span className="text-slate-400"> · filtered by "{search}"</span>}
          </p>
          <span className="text-xs text-slate-400">Updated 2 hours ago</span>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map(intern => (
            <InternshipCard key={intern.id} intern={intern} onView={() => onViewDetail(intern.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: Detail ─────────────────────────────────────────────────────────

export function DetailScreen({ internshipId, onApply, onBack }: { internshipId: string; onApply: () => void; onBack: () => void }) {
  const intern = INTERNSHIPS.find(i => i.id === internshipId) ?? INTERNSHIPS[0];
  const c = matchColor(intern.matchScore);
  const [saved, setSaved] = useState(false);
  const matchedSkills = intern.skills;
  const allRequiredSkills = ['Python', 'PyTorch', 'TensorFlow', 'SQL', 'Git', 'Machine Learning'];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M10 12L6 8l4-4"/></svg>
          Back to results
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSaved(!saved)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${saved ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5"><path d="M11 1H3a1 1 0 00-1 1v10.5l5-2.5 5 2.5V2a1 1 0 00-1-1z"/></svg>
            {saved ? 'Saved' : 'Save'}
          </button>
          <Button size="lg" onClick={onApply}>Apply Now →</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8 grid grid-cols-3 gap-8">
          <div className="col-span-2 flex flex-col gap-8">
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0" style={{ background: intern.companyColor }}>{intern.companyInitial}</div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>{intern.title}</h1>
                  <p className="text-slate-600 mt-1">{intern.company}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1C5.067 1 3.5 2.567 3.5 4.5c0 3 3.5 6.5 3.5 6.5s3.5-3.5 3.5-6.5C10.5 2.567 8.933 1 7 1z"/><circle cx="7" cy="4.5" r="1.25"/></svg>{intern.location}</span>
                <span className="text-slate-300">|</span>
                <span>{intern.duration}</span>
                <span className="text-slate-300">|</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${workTypeBadge(intern.workType)}`}>{intern.workType}</span>
                <span className="text-slate-300">|</span>
                <span>Deadline: {intern.deadline}</span>
              </div>
            </div>

            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>About the role</h2>
              <p className="text-sm text-slate-700 leading-relaxed">{intern.description} You will gain hands-on experience with production AI systems while being mentored by senior engineers with international backgrounds.</p>
            </section>

            {intern.responsibilities.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-slate-900 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Responsibilities</h2>
                <ul className="flex flex-col gap-2">
                  {intern.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Required skills</h2>
              <div className="flex flex-wrap gap-2">
                {allRequiredSkills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-50 text-slate-700 border border-slate-200">
                    {matchedSkills.includes(s) && <span className="text-emerald-500">✓</span>}{s}
                  </span>
                ))}
              </div>
            </section>

            {intern.benefits.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-slate-900 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Benefits</h2>
                <div className="grid grid-cols-2 gap-2">
                  {intern.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-blue-500 mt-0.5 shrink-0">✦</span>{b}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h2 className="text-base font-semibold text-slate-900 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>About {intern.company}</h2>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">{intern.companyDesc || `${intern.company} is a leading company in ${intern.industry}.`}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-xs text-slate-500 mb-0.5">Industry</p><p className="font-medium text-slate-800">{intern.industry}</p></div>
                <div><p className="text-xs text-slate-500 mb-0.5">Headcount</p><p className="font-medium text-slate-800">{intern.headcount}</p></div>
                <div><p className="text-xs text-slate-500 mb-0.5">Stipend</p><p className="font-medium text-slate-800">{intern.salary}</p></div>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-5">
            <div className="p-5 rounded-xl border-2 border-blue-100 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-900">AI Match Score</span>
              </div>
              <div className="flex flex-col items-center gap-3 mb-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4" style={{ background: 'white', color: c.text, borderColor: c.bar }}>{intern.matchScore}%</div>
                <div className="w-full h-2 rounded-full bg-white overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${intern.matchScore}%`, background: c.bar }} />
                </div>
              </div>
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Why this matches you</h3>
              <div className="flex flex-col gap-1.5 mb-3">
                {matchedSkills.map(s => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span className="text-slate-700">{s}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic bg-white/60 rounded-lg p-2.5 border border-blue-100">"{intern.matchReason}"</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col gap-3">
              <Button fullWidth size="lg" onClick={onApply}>Apply Now</Button>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Deadline: {intern.deadline}</span>
                <span className="text-amber-600 font-medium">18 days left</span>
              </div>
              <p className="text-xs text-slate-400 text-center">~5 min · AI interview included</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

