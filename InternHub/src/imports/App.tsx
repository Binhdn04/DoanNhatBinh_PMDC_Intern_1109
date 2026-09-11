import { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = 'discover' | 'detail' | 'apply' | 'interview' | 'interview-result' | 'applications' | 'internship' | 'reports' | 'profile';

interface Internship {
  id: string;
  title: string;
  company: string;
  companyInitial: string;
  companyColor: string;
  location: string;
  duration: string;
  workType: string;
  postedDays: number;
  deadline: string;
  matchScore: number;
  matchReason: string;
  description: string;
  skills: string[];
  responsibilities: string[];
  preferredSkills: string[];
  benefits: string[];
  companyDesc: string;
  headcount: string;
  industry: string;
  salary: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INTERNSHIPS: Internship[] = [
  {
    id: '1',
    title: 'AI Engineer Intern',
    company: 'FPT Software',
    companyInitial: 'FP',
    companyColor: '#f97316',
    location: 'Hanoi',
    duration: '3 months',
    workType: 'Full-time',
    postedDays: 2,
    deadline: 'Dec 31, 2026',
    matchScore: 92,
    matchReason: 'Strong match based on your Python, ML and Computer Vision skills.',
    description: 'Join our AI Research team to build and deploy machine learning models that power intelligent features across FPT\'s product suite. You\'ll work closely with senior engineers on real production systems.',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Computer Vision', 'Git'],
    responsibilities: [
      'Design and implement ML pipelines for production systems',
      'Collaborate on computer vision and NLP experiments',
      'Optimize model performance and inference latency',
      'Write clean, well-documented Python code',
      'Present findings to engineering and product teams',
    ],
    preferredSkills: ['PyTorch', 'Docker', 'MLflow', 'FastAPI'],
    benefits: ['Competitive stipend (8M–12M VND/month)', 'Mentorship from senior AI engineers', 'Return offer consideration', 'Flexible working hours', 'Access to GPU compute clusters'],
    companyDesc: 'FPT Software is one of Southeast Asia\'s largest IT services companies, serving 1,000+ clients across 30 countries. Our AI division focuses on applied machine learning, computer vision, and NLP.',
    headcount: '35,000+',
    industry: 'Technology / IT Services',
    salary: '8M–12M VND/month',
  },
  {
    id: '2',
    title: 'Frontend Developer Intern',
    company: 'Tiki Corporation',
    companyInitial: 'TK',
    companyColor: '#0ea5e9',
    location: 'Ho Chi Minh City',
    duration: '4 months',
    workType: 'Hybrid',
    postedDays: 5,
    deadline: 'Jan 15, 2027',
    matchScore: 85,
    matchReason: 'Your React and TypeScript skills match 85% of requirements.',
    description: 'Build beautiful, high-performance user interfaces for Vietnam\'s leading e-commerce platform. Collaborate with product designers and backend engineers to ship features used by millions of users.',
    skills: ['React', 'TypeScript', 'CSS', 'REST APIs', 'Git'],
    responsibilities: [],
    preferredSkills: [],
    benefits: [],
    companyDesc: '',
    headcount: '2,000+',
    industry: 'E-commerce',
    salary: '6M–10M VND/month',
  },
  {
    id: '3',
    title: 'Data Analyst Intern',
    company: 'VinAI Research',
    companyInitial: 'VA',
    companyColor: '#8b5cf6',
    location: 'Hanoi (Remote OK)',
    duration: '6 months',
    workType: 'Remote',
    postedDays: 1,
    deadline: 'Jan 5, 2027',
    matchScore: 78,
    matchReason: 'Good match on SQL and Python; slight gap in statistical modeling.',
    description: 'Support VinAI\'s research teams with data pipelines, exploratory analysis, and visualization dashboards. Learn from world-class AI researchers in a fast-paced environment.',
    skills: ['Python', 'SQL', 'Pandas', 'Tableau', 'Statistics'],
    responsibilities: [],
    preferredSkills: [],
    benefits: [],
    companyDesc: '',
    headcount: '300+',
    industry: 'AI Research',
    salary: '7M–9M VND/month',
  },
  {
    id: '4',
    title: 'Backend Engineer Intern',
    company: 'MoMo',
    companyInitial: 'MM',
    companyColor: '#a855f7',
    location: 'Ho Chi Minh City',
    duration: '3 months',
    workType: 'On-site',
    postedDays: 8,
    deadline: 'Dec 20, 2026',
    matchScore: 71,
    matchReason: 'Java and Spring Boot skills match; limited fintech experience.',
    description: 'Help build the payment infrastructure that powers Vietnam\'s most popular digital wallet. Work on high-throughput APIs, security, and real-time transaction processing.',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Docker'],
    responsibilities: [],
    preferredSkills: [],
    benefits: [],
    companyDesc: '',
    headcount: '4,000+',
    industry: 'Fintech',
    salary: '7M–11M VND/month',
  },
  {
    id: '5',
    title: 'UX Design Intern',
    company: 'Shopee Vietnam',
    companyInitial: 'SH',
    companyColor: '#f97316',
    location: 'Ho Chi Minh City',
    duration: '3 months',
    workType: 'Hybrid',
    postedDays: 3,
    deadline: 'Jan 10, 2027',
    matchScore: 67,
    matchReason: 'Figma proficiency matches; portfolio depth could be stronger.',
    description: 'Design intuitive, delightful experiences for Shopee\'s mobile and web platforms. You\'ll conduct user research, create wireframes, and collaborate closely with product and engineering.',
    skills: ['Figma', 'User Research', 'Prototyping', 'UI Design', 'Usability Testing'],
    responsibilities: [],
    preferredSkills: [],
    benefits: [],
    companyDesc: '',
    headcount: '10,000+',
    industry: 'E-commerce',
    salary: '5M–8M VND/month',
  },
  {
    id: '6',
    title: 'Cloud Infrastructure Intern',
    company: 'VNG Cloud',
    companyInitial: 'VN',
    companyColor: '#10b981',
    location: 'Ho Chi Minh City',
    duration: '4 months',
    workType: 'On-site',
    postedDays: 6,
    deadline: 'Jan 20, 2027',
    matchScore: 61,
    matchReason: 'Linux skills match; cloud platforms knowledge needs growth.',
    description: 'Work on VNG\'s cloud infrastructure team, managing Kubernetes clusters, CI/CD pipelines, and monitoring systems that serve hundreds of millions of users across Southeast Asia.',
    skills: ['Linux', 'Kubernetes', 'Terraform', 'AWS', 'Python'],
    responsibilities: [],
    preferredSkills: [],
    benefits: [],
    companyDesc: '',
    headcount: '800+',
    industry: 'Cloud Computing',
    salary: '6M–9M VND/month',
  },
];

// ─── Design Tokens / Helpers ──────────────────────────────────────────────────

function matchColor(score: number) {
  if (score >= 85) return { bg: '#eff6ff', text: '#1d4ed8', bar: '#2563eb' };
  if (score >= 70) return { bg: '#f5f3ff', text: '#6d28d9', bar: '#7c3aed' };
  return { bg: '#fff7ed', text: '#c2410c', bar: '#f97316' };
}

function workTypeBadge(type: string) {
  if (type === 'Remote') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (type === 'Hybrid') return 'bg-blue-50 text-blue-700 border border-blue-200';
  return 'bg-slate-100 text-slate-600 border border-slate-200';
}

// ─── Shared UI Components ─────────────────────────────────────────────────────

function SkillTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {label}
    </span>
  );
}

function MatchBadge({ score, size = 'sm' }: { score: number; size?: 'sm' | 'lg' }) {
  const c = matchColor(score);
  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-2xl"
          style={{ background: c.bg, color: c.text }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L12.09 7.26L17.78 7.64L13.6 11.26L15 17L10 14L5 17L6.4 11.26L2.22 7.64L7.91 7.26L10 2Z" fill="currentColor" opacity="0.8"/>
          </svg>
          {score}% Match
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden" style={{ minWidth: 120 }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: c.bar }} />
        </div>
      </div>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="text-[10px]">✦</span>
      {score}%
    </span>
  );
}

function Button({
  children, variant = 'primary', size = 'md', onClick, disabled, fullWidth, type = 'button',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const sizes = { sm: 'px-3 py-1.5 text-sm gap-1.5', md: 'px-4 py-2 text-sm gap-2', lg: 'px-6 py-3 text-base gap-2' };
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-300 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </button>
  );
}

function FormField({
  label, required, children, hint,
}: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Input({
  placeholder, value, onChange, type = 'text',
}: { placeholder?: string; value?: string; onChange?: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
    />
  );
}

function Select({ options, value, onChange }: { options: string[]; value?: string; onChange?: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange?.(e.target.value)}
      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
    >
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

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
  { id: 'profile', label: 'Profile', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="6" r="3"/><path d="M3 16c0-3.314 2.686-5 6-5s6 1.686 6 5"/>
    </svg>
  )},
];

function Sidebar({ activeScreen, onNavigate }: { activeScreen: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <aside className="flex flex-col w-56 min-h-screen bg-white border-r border-slate-200 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L10 6.5L15 7L11.5 10.5L12.5 15L8 12.5L3.5 15L4.5 10.5L1 7L6 6.5L8 2Z" fill="white"/>
          </svg>
        </div>
        <span className="font-bold text-slate-900 text-base" style={{ fontFamily: "'DM Sans', sans-serif" }}>InternHub</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(item => {
          const active = activeScreen === item.id || (activeScreen === 'detail' && item.id === 'discover') || (activeScreen === 'apply' && item.id === 'discover');
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

      {/* AI Badge */}
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

      {/* User */}
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
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: intern.companyColor }}
          >
            {intern.companyInitial}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{intern.title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{intern.company}</p>
          </div>
        </div>
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold shrink-0"
          style={{ background: c.bg, color: c.text }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1L7.5 4.5H11L8.25 6.75L9.25 10.5L6 8.5L2.75 10.5L3.75 6.75L1 4.5H4.5L6 1Z"/>
          </svg>
          {intern.matchScore}%
        </div>
      </div>

      {/* Meta */}
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

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{intern.description}</p>

      {/* AI Explanation */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5 text-blue-500">
          <path d="M7 1L8.5 5H13L9.5 7.5L11 11.5L7 9L3 11.5L4.5 7.5L1 5H5.5L7 1Z" fill="currentColor"/>
        </svg>
        <p className="text-xs text-blue-700">{intern.matchReason}</p>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {intern.skills.slice(0, 4).map(s => <SkillTag key={s} label={s} />)}
        {intern.skills.length > 4 && (
          <span className="text-xs text-slate-400 px-2 py-0.5">+{intern.skills.length - 4}</span>
        )}
      </div>

      {/* Match bar + CTA */}
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

function FilterChip({
  label, options, value, onChange,
}: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`appearance-none pl-3 pr-7 py-1.5 text-sm rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
          value !== options[0]
            ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4.5l3 3 3-3"/></svg>
      </div>
    </div>
  );
}

function DiscoverScreen({ onViewDetail }: { onViewDetail: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [workType, setWorkType] = useState(WORK_TYPES[0]);
  const [sort, setSort] = useState(SORT_OPTIONS[0]);

  const filtered = INTERNSHIPS.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !q || i.title.toLowerCase().includes(q) || i.company.toLowerCase().includes(q) || i.skills.some(s => s.toLowerCase().includes(q));
    const matchCat = category === CATEGORIES[0] || true;
    const matchLoc = location === LOCATIONS[0] || i.location.includes(location);
    const matchWt = workType === WORK_TYPES[0] || i.workType === workType;
    return matchQ && matchCat && matchLoc && matchWt;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'Match Score') return b.matchScore - a.matchScore;
    if (sort === 'Newest') return a.postedDays - b.postedDays;
    return b.matchScore - a.matchScore;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
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

        {/* Search */}
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

        {/* Filters row */}
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

      {/* Results */}
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

function DetailScreen({ internshipId, onApply, onBack }: { internshipId: string; onApply: () => void; onBack: () => void }) {
  const intern = INTERNSHIPS.find(i => i.id === internshipId) ?? INTERNSHIPS[0];
  const c = matchColor(intern.matchScore);
  const [saved, setSaved] = useState(false);

  const matchedSkills = intern.skills;
  const allRequiredSkills = ['Python', 'PyTorch', 'TensorFlow', 'SQL', 'Git', 'Machine Learning'];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sticky top bar */}
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
          <Button size="lg" onClick={onApply}>
            Apply Now →
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8 grid grid-cols-3 gap-8">
          {/* Main content */}
          <div className="col-span-2 flex flex-col gap-8">
            {/* Title block */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                  style={{ background: intern.companyColor }}
                >
                  {intern.companyInitial}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>{intern.title}</h1>
                  <p className="text-slate-600 mt-1">{intern.company}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1C5.067 1 3.5 2.567 3.5 4.5c0 3 3.5 6.5 3.5 6.5s3.5-3.5 3.5-6.5C10.5 2.567 8.933 1 7 1z"/><circle cx="7" cy="4.5" r="1.25"/></svg>
                  {intern.location}
                </span>
                <span className="text-slate-300">|</span>
                <span>{intern.duration}</span>
                <span className="text-slate-300">|</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${workTypeBadge(intern.workType)}`}>{intern.workType}</span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="12" height="10" rx="1.5"/><path d="M1 6h12M5 3V1M9 3V1"/></svg>
                  Deadline: {intern.deadline}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">Posted {intern.postedDays}d ago</span>
              </div>
            </div>

            {/* About the role */}
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>About the role</h2>
              <p className="text-sm text-slate-700 leading-relaxed">{intern.description} You will gain hands-on experience with production AI systems while being mentored by senior engineers with international backgrounds.</p>
            </section>

            {/* Responsibilities */}
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Responsibilities</h2>
              <ul className="flex flex-col gap-2">
                {intern.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>

            {/* Required skills */}
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Required skills</h2>
              <div className="flex flex-wrap gap-2">
                {allRequiredSkills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-50 text-slate-700 border border-slate-200">
                    {matchedSkills.includes(s) && <span className="text-emerald-500">✓</span>}
                    {s}
                  </span>
                ))}
              </div>
            </section>

            {/* Preferred skills */}
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Preferred skills</h2>
              <div className="flex flex-wrap gap-2">
                {intern.preferredSkills.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-lg text-sm text-slate-600 bg-white border border-dashed border-slate-200">{s}</span>
                ))}
              </div>
            </section>

            {/* Benefits */}
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Benefits</h2>
              <div className="grid grid-cols-2 gap-2">
                {intern.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-blue-500 mt-0.5 shrink-0">✦</span>
                    {b}
                  </div>
                ))}
              </div>
            </section>

            {/* Company info */}
            <section className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h2 className="text-base font-semibold text-slate-900 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>About {intern.company}</h2>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">{intern.companyDesc}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Industry</p>
                  <p className="font-medium text-slate-800">{intern.industry}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Headcount</p>
                  <p className="font-medium text-slate-800">{intern.headcount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Stipend</p>
                  <p className="font-medium text-slate-800">{intern.salary}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Match card */}
            <div className="p-5 rounded-xl border-2 border-blue-100 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-900">AI Match Score</span>
              </div>
              <div className="flex flex-col items-center gap-3 mb-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4"
                  style={{ background: 'white', color: c.text, borderColor: c.bar }}
                >
                  {intern.matchScore}%
                </div>
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
              <p className="text-xs text-slate-600 leading-relaxed italic bg-white/60 rounded-lg p-2.5 border border-blue-100">
                "{intern.matchReason.replace('Strong match based on your', 'Your')} experience strongly matches the technical requirements of this role."
              </p>
            </div>

            {/* Apply CTA */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col gap-3">
              <Button fullWidth size="lg" onClick={onApply}>
                Apply Now
              </Button>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="10" height="8" rx="1"/><path d="M1 5h10M4 3V1M8 3V1"/></svg>
                  Deadline: {intern.deadline}
                </span>
                <span className="text-amber-600 font-medium">18 days left</span>
              </div>
              <p className="text-xs text-slate-400 text-center">~5 min · AI interview included</p>
            </div>

            {/* Quick stats */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Application Stats</h3>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Applicants', value: '143' },
                  { label: 'Avg. match score', value: '64%' },
                  { label: 'Interviews sent', value: '28' },
                  { label: 'Posted', value: `${intern.postedDays} days ago` },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{s.label}</span>
                    <span className="font-medium text-slate-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3: Apply ──────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Personal Information' },
  { id: 2, label: 'Cover Note' },
  { id: 3, label: 'Availability' },
  { id: 4, label: 'Documents' },
  { id: 5, label: 'AI Interview' },
];

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const done = step.id < currentStep;
        const active = step.id === currentStep;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M2.5 7L5.5 10L11.5 4"/></svg>
                ) : step.id}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-blue-700' : done ? 'text-slate-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-16 h-0.5 mb-5 mx-1 transition-all ${done ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ApplyScreen({ internshipId, onBack }: { internshipId: string; onBack: () => void }) {
  const intern = INTERNSHIPS.find(i => i.id === internshipId) ?? INTERNSHIPS[0];
  const [step, setStep] = useState(1);

  // Form state
  const [fullName, setFullName] = useState('Binh Do');
  const [email, setEmail] = useState('binh.do@sis.hust.edu.vn');
  const [phone, setPhone] = useState('+84 98 765 4321');
  const [university, setUniversity] = useState('Hanoi University of Science and Technology');
  const [major, setMajor] = useState('Computer Science');
  const [coverNote, setCoverNote] = useState('');
  const [startDate, setStartDate] = useState('2027-01-15');
  const [endDate, setEndDate] = useState('2027-04-15');
  const [weeklyHours, setWeeklyHours] = useState('Full-time (40h/week)');
  const [fileUploaded] = useState(true);

  const next = () => setStep(s => Math.min(s + 1, STEPS.length));
  const back = () => { if (step === 1) onBack(); else setStep(s => s - 1); };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M10 12L6 8l4-4"/></svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Apply — {intern.title}</h1>
            <p className="text-sm text-slate-500">{intern.company} · {intern.location}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {/* Stepper */}
          <div className="flex justify-center mb-10">
            <Stepper currentStep={step} />
          </div>

          {/* Step content */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Step header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Step {step} of {STEPS.length}</span>
                <h2 className="text-lg font-semibold text-slate-900 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{STEPS[step - 1].label}</h2>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="4.5"/><path d="M6 4v2.5L7.5 8"/></svg>
                ~{6 - step} min remaining
              </div>
            </div>

            {/* Step body */}
            <div className="px-8 py-7">
              {step === 1 && (
                <div className="grid grid-cols-2 gap-5">
                  <FormField label="Full name" required>
                    <Input value={fullName} onChange={setFullName} placeholder="Your full name" />
                  </FormField>
                  <FormField label="Email address" required>
                    <Input type="email" value={email} onChange={setEmail} placeholder="you@university.edu.vn" />
                  </FormField>
                  <FormField label="Phone number" required>
                    <Input type="tel" value={phone} onChange={setPhone} placeholder="+84 ..." />
                  </FormField>
                  <FormField label="University" required>
                    <Input value={university} onChange={setUniversity} placeholder="Your university name" />
                  </FormField>
                  <FormField label="Major" required>
                    <Input value={major} onChange={setMajor} placeholder="e.g. Computer Science" />
                  </FormField>
                  <FormField label="Expected graduation">
                    <Select options={['May 2025', 'Sep 2025', 'May 2026', 'Sep 2026', 'May 2027']} value="May 2025" />
                  </FormField>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-700 flex items-start gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 7v4M8 5.5v.5"/></svg>
                    Keep your cover note concise and genuine. Recruiters spend an average of 30 seconds reading.
                  </div>
                  <FormField label="Cover note" required hint="150–300 words recommended">
                    <textarea
                      value={coverNote}
                      onChange={e => setCoverNote(e.target.value)}
                      placeholder="Tell the company why you are interested in this internship and how your experience makes you a strong candidate..."
                      rows={10}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none leading-relaxed"
                    />
                  </FormField>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{coverNote.split(' ').filter(Boolean).length} words</span>
                    <span className={coverNote.split(' ').filter(Boolean).length >= 150 ? 'text-emerald-600 font-medium' : ''}>
                      {coverNote.split(' ').filter(Boolean).length >= 150 ? '✓ Good length' : `${150 - coverNote.split(' ').filter(Boolean).length} more words recommended`}
                    </span>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-5">
                    <FormField label="Start date" required>
                      <Input type="date" value={startDate} onChange={setStartDate} />
                    </FormField>
                    <FormField label="End date" required>
                      <Input type="date" value={endDate} onChange={setEndDate} />
                    </FormField>
                  </div>
                  <FormField label="Weekly availability" required hint="How many hours per week can you commit?">
                    <Select
                      options={['Full-time (40h/week)', 'Part-time (20h/week)', 'Part-time (30h/week)', 'Flexible']}
                      value={weeklyHours}
                      onChange={setWeeklyHours}
                    />
                  </FormField>
                  <FormField label="Preferred working hours">
                    <Select options={['Standard (9AM–5PM)', 'Flexible schedule', 'Morning (7AM–2PM)', 'Afternoon (1PM–8PM)']} />
                  </FormField>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-1">Duration summary</p>
                    <p className="text-sm text-slate-500">Jan 15, 2027 → Apr 15, 2027 · <strong className="text-slate-700">3 months</strong> · {weeklyHours.split('(')[0].trim()}</p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-6">
                  <FormField label="Curriculum Vitae (CV)" required hint="PDF, DOCX — max 10MB">
                    {fileUploaded ? (
                      <div className="flex items-center gap-3 p-4 rounded-lg border border-emerald-200 bg-emerald-50">
                        <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white text-xs font-bold shrink-0">PDF</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">Binh_Do_CV.pdf</p>
                          <p className="text-xs text-slate-500">PDF · 2.4 MB · Uploaded just now</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M2 7l3.5 3.5L12 4"/></svg>
                          Uploaded
                        </span>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3 text-slate-300" stroke="currentColor" strokeWidth="1.5"><path d="M16 4v18M10 10l6-6 6 6"/><rect x="4" y="22" width="24" height="6" rx="2"/></svg>
                        <p className="text-sm font-medium text-slate-600">Drop your CV here or click to browse</p>
                        <p className="text-xs text-slate-400 mt-1">PDF or DOCX, up to 10MB</p>
                      </div>
                    )}
                  </FormField>

                  <FormField label="Portfolio / GitHub (optional)" hint="Link to your work samples">
                    <Input placeholder="https://github.com/yourname" value="https://github.com/binh-do-hust" onChange={() => {}} />
                  </FormField>

                  <FormField label="Additional documents (optional)" hint="Transcript, certifications, etc.">
                    <div className="border-2 border-dashed border-slate-100 rounded-xl p-6 text-center hover:border-slate-200 transition cursor-pointer">
                      <p className="text-sm text-slate-400">+ Add documents</p>
                    </div>
                  </FormField>
                </div>
              )}

              {step === 5 && (
                <div className="flex flex-col items-center gap-6 py-6">
                  <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-500">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><circle cx="18" cy="12" r="5.5"/><path d="M5 31c0-7.18 5.82-11 13-11s13 3.82 13 11"/><path d="M27 16l2 2 4-4"/></svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>AI Interview</h3>
                    <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                      Complete a short AI-powered screening interview. This typically takes 10–15 minutes and consists of 5 questions tailored to this role.
                    </p>
                  </div>
                  <div className="w-full max-w-sm flex flex-col gap-3">
                    {[
                      { q: 'Tell us about your Python and ML experience', time: '~3 min' },
                      { q: 'Describe a computer vision project you\'ve worked on', time: '~2 min' },
                      { q: 'How do you approach debugging a failing model?', time: '~3 min' },
                      { q: 'What interests you most about FPT Software?', time: '~2 min' },
                      { q: 'Where do you see your AI career in 5 years?', time: '~2 min' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700">{item.q}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 5v2.5L8.5 9"/></svg>
                    Total time: ~12 minutes
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <Button variant="secondary" onClick={back}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M10 12L6 8l4-4"/></svg>
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{step} / {STEPS.length}</span>
                <Button onClick={next} disabled={step === STEPS.length}>
                  {step === STEPS.length ? 'Submit Application' : 'Continue'}
                  {step < STEPS.length && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Progress summary */}
          <div className="mt-4 px-4 py-3 rounded-lg bg-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Application progress</span>
            <div className="flex-1 mx-4 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-700">{Math.round(((step - 1) / (STEPS.length - 1)) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 4: AI Interview ───────────────────────────────────────────────────

const INTERVIEW_QUESTIONS = [
  {
    id: 1,
    question: 'Tell me about yourself and your interest in AI engineering.',
    hint: 'Briefly describe your background, key experiences, and why you want to work in AI.',
    timeLimit: 120,
  },
  {
    id: 2,
    question: 'What is the difference between supervised and unsupervised learning? Give a real-world example of each.',
    hint: 'Focus on the core distinction and choose clear, practical examples you know well.',
    timeLimit: 150,
  },
  {
    id: 3,
    question: 'Tell me about a machine learning project you have worked on. What was your contribution and what did you learn?',
    hint: 'Use the STAR method: Situation, Task, Action, Result. Be specific about your technical role.',
    timeLimit: 180,
  },
  {
    id: 4,
    question: 'How would you handle a situation where your model performs well on training data but poorly on production data?',
    hint: 'Cover data drift, overfitting, evaluation strategies, and monitoring approaches.',
    timeLimit: 150,
  },
  {
    id: 5,
    question: 'Where do you see AI/ML technology evolving over the next 3 years, and how does that shape your career goals?',
    hint: 'Show awareness of industry trends and connect them to your personal development plan.',
    timeLimit: 120,
  },
];

function InterviewScreen({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [currentQ, setCurrentQ] = useState(2); // show Q3 as active (0-indexed: 2)
  const [answers, setAnswers] = useState<Record<number, string>>({ 0: 'I am a final-year Computer Science student at HUST with strong interests in machine learning and computer vision...', 1: 'Supervised learning uses labeled data — for example, training an image classifier on tagged photos. Unsupervised learning finds patterns without labels, such as customer segmentation by purchase behavior.' });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(42);
  const [answerMode, setAnswerMode] = useState<'text' | 'voice'>('text');

  const q = INTERVIEW_QUESTIONS[currentQ];
  const answered = Object.keys(answers).length;

  const handleRecord = () => {
    setIsRecording(r => !r);
  };

  const handleNext = () => {
    if (currentQ < INTERVIEW_QUESTIONS.length - 1) {
      setCurrentQ(q => q + 1);
      setIsRecording(false);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(q => q - 1);
    else onBack();
  };

  const totalTime = q.timeLimit;
  const remaining = totalTime - (isRecording ? recordingTime : 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M10 12L6 8l4-4"/></svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>AI Interview</h1>
            <p className="text-xs text-slate-500">AI Engineer Intern · FPT Software</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="4.5"/><path d="M6 3.5v3L7.5 8"/></svg>
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} remaining
          </div>
          <div className="text-xs text-slate-400 font-medium">{answered} / {INTERVIEW_QUESTIONS.length} answered</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8 grid grid-cols-3 gap-8">
          {/* Main panel */}
          <div className="col-span-2 flex flex-col gap-6">
            {/* Progress dots */}
            <div className="flex items-center gap-3">
              {INTERVIEW_QUESTIONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`transition-all duration-200 rounded-full ${
                    i === currentQ
                      ? 'w-8 h-3 bg-blue-600'
                      : i < currentQ || answers[i]
                      ? 'w-3 h-3 bg-blue-400'
                      : 'w-3 h-3 bg-slate-200'
                  }`}
                />
              ))}
              <span className="text-xs text-slate-500 ml-1">Question {currentQ + 1} of {INTERVIEW_QUESTIONS.length}</span>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Question {currentQ + 1}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="4.5"/><path d="M6 3.5v3L7.5 8"/></svg>
                  {Math.floor(q.timeLimit / 60)}:{String(q.timeLimit % 60).padStart(2, '0')} limit
                </span>
              </div>
              <div className="px-6 py-6">
                <p className="text-lg font-semibold text-slate-900 leading-snug mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {q.question}
                </p>
                <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 mt-0.5"><circle cx="6" cy="6" r="4.5"/><path d="M6 5v3M6 4v.5"/></svg>
                  <span><strong className="text-slate-600">Tip:</strong> {q.hint}</span>
                </div>
              </div>

              {/* Answer mode tabs */}
              <div className="px-6 pb-6 flex flex-col gap-4">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
                  {(['text', 'voice'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setAnswerMode(mode)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${answerMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {mode === 'text' ? '⌨ Text answer' : '🎙 Voice answer'}
                    </button>
                  ))}
                </div>

                {answerMode === 'text' ? (
                  <textarea
                    value={answers[currentQ] ?? ''}
                    onChange={e => setAnswers(a => ({ ...a, [currentQ]: e.target.value }))}
                    placeholder="Type your answer here..."
                    rows={8}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none leading-relaxed"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 py-6">
                    {isRecording ? (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping" />
                          <button
                            onClick={handleRecord}
                            className="relative w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all"
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-sm font-semibold text-slate-900">Recording...</span>
                          <span className="text-sm font-mono text-slate-500">
                            {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:{String(recordingTime % 60).padStart(2, '0')}
                          </span>
                        </div>
                        <div className="w-full h-10 flex items-center justify-center gap-0.5">
                          {Array.from({ length: 48 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1 rounded-full bg-blue-400 opacity-70"
                              style={{ height: `${20 + Math.sin(i * 0.4 + Date.now() * 0.001) * 16}px` }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">Click to stop recording</p>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleRecord}
                          className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105"
                        >
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <rect x="10" y="3" width="8" height="14" rx="4" fill="currentColor" stroke="none"/>
                            <path d="M5 14c0 5 4 8 9 8s9-3 9-8"/>
                            <path d="M14 22v3"/>
                          </svg>
                        </button>
                        <p className="text-sm font-medium text-slate-700">Click to start recording</p>
                        <p className="text-xs text-slate-400">Your answer will be transcribed automatically</p>
                      </>
                    )}
                  </div>
                )}

                {/* Word count for text mode */}
                {answerMode === 'text' && (
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{(answers[currentQ] ?? '').split(' ').filter(Boolean).length} words</span>
                    <span className={(answers[currentQ] ?? '').split(' ').filter(Boolean).length >= 50 ? 'text-emerald-600 font-medium' : ''}>
                      {(answers[currentQ] ?? '').split(' ').filter(Boolean).length >= 50 ? '✓ Good detail' : 'Aim for 50+ words'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={handlePrev}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M10 12L6 8l4-4"/></svg>
                Previous
              </Button>
              <Button onClick={handleNext}>
                {currentQ === INTERVIEW_QUESTIONS.length - 1 ? 'Submit Interview' : 'Next question'}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Info card */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-blue-600">
                  <path d="M8 2L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5L8 2Z" fill="currentColor"/>
                </svg>
                <span className="text-sm font-semibold text-blue-900">AI Interview</span>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">The interview evaluates technical knowledge, problem solving and communication. Take your time — there is no need to rush.</p>
            </div>

            {/* Question overview */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Question Overview</span>
              </div>
              <div className="p-3 flex flex-col gap-1">
                {INTERVIEW_QUESTIONS.map((iq, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${i === currentQ ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
                      answers[i] ? 'bg-emerald-100 text-emerald-700' : i === currentQ ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {answers[i] ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs leading-relaxed line-clamp-2 ${i === currentQ ? 'text-blue-800 font-medium' : 'text-slate-600'}`}>
                      {iq.question}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Answer tips</h3>
              <div className="flex flex-col gap-2">
                {['Be specific and use real examples', 'Structure: Situation → Action → Result', 'Keep answers between 1–3 minutes', 'Speak clearly and at a natural pace'].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-blue-400 shrink-0 mt-0.5">✦</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 5: Interview Result ───────────────────────────────────────────────

const SCORE_CATEGORIES = [
  { label: 'Technical Knowledge', score: 88, desc: 'Strong ML/AI fundamentals and hands-on framework experience.' },
  { label: 'Problem Solving', score: 86, desc: 'Logical, structured approach to debugging and model issues.' },
  { label: 'Communication', score: 78, desc: 'Clear explanations; could improve answer structure and examples.' },
];

const STRENGTHS = [
  'Strong technical fundamentals in Python and ML',
  'Good understanding of ML workflows end-to-end',
  'Practical project experience with real datasets',
  'Demonstrated awareness of production challenges',
];

const IMPROVEMENTS = [
  'Give more concrete, quantified examples (metrics, scale)',
  'Improve answer structure using STAR method consistently',
  'Explain technical decisions and trade-offs more clearly',
  'Build confidence discussing industry trends',
];

function InterviewResultScreen({ onRetake, onApplications }: { onRetake: () => void; onApplications: () => void }) {
  const overallScore = 84;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Interview Results</h1>
            <p className="text-sm text-slate-500">AI Engineer Intern · FPT Software</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onRetake}>Retake Interview</Button>
            <Button onClick={onApplications}>View My Applications →</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Score hero */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 mb-6 flex items-center gap-10">
            {/* Circle score */}
            <div className="relative shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10"/>
                <circle
                  cx="60" cy="60" r="50" fill="none" stroke="#2563eb" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 50 * overallScore / 100} ${2 * Math.PI * 50 * (1 - overallScore / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>{overallScore}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Overall Score</span>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">Good</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed max-w-md mb-5">
                Strong understanding of machine learning concepts and good problem-solving ability. Your answers demonstrate practical experience with Python and model development. With slightly stronger structure and more concrete examples, this would be an excellent performance.
              </p>

              {/* Score breakdown */}
              <div className="flex flex-col gap-3">
                {SCORE_CATEGORIES.map(cat => (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 font-medium">{cat.label}</span>
                      <span className="text-sm font-semibold text-slate-900">{cat.score}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${cat.score}%`, background: cat.score >= 85 ? '#2563eb' : cat.score >= 75 ? '#7c3aed' : '#f97316' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Strengths */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M2 7l3.5 3.5L12 4"/></svg>
                </div>
                <h2 className="text-sm font-semibold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Strengths</h2>
              </div>
              <div className="flex flex-col gap-2.5">
                {STRENGTHS.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for improvement */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 2v6M7 10v1.5"/></svg>
                </div>
                <h2 className="text-sm font-semibold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Areas for improvement</h2>
              </div>
              <div className="flex flex-col gap-2.5">
                {IMPROVEMENTS.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Per-question breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Question-by-question feedback</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { q: 'Tell me about yourself and your interest in AI engineering.', score: 82, feedback: 'Good overview. Could be more concise and focus on technical highlights.' },
                { q: 'What is the difference between supervised and unsupervised learning?', score: 90, feedback: 'Excellent — clear distinction with strong real-world examples.' },
                { q: 'Tell me about a machine learning project you have worked on.', score: 88, feedback: 'Strong STAR structure. Quantify impact (accuracy, speed) next time.' },
                { q: 'How would you handle overfitting in production?', score: 85, feedback: 'Solid grasp of regularization and monitoring. Good practical depth.' },
                { q: 'Where do you see AI/ML evolving over the next 3 years?', score: 74, feedback: 'Interesting perspective. Back up predictions with specific evidence.' },
              ].map((item, i) => (
                <div key={i} className="px-6 py-4 flex items-start gap-4">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${item.score >= 85 ? 'bg-blue-50 text-blue-700' : item.score >= 75 ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'}`}>
                    {item.score}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 mb-0.5">Q{i + 1}: {item.q}</p>
                    <p className="text-xs text-slate-500">{item.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What happens next */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l1.5 4.5H14l-3.5 2.5 1.25 4.5L8 10 4.25 12.5l1.25-4.5L2 5.5h4.5L8 1z"/></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-1">What happens next</p>
              <p className="text-sm text-slate-600 leading-relaxed">FPT Software's recruiting team will review your application and interview results within <strong>5–7 business days</strong>. You'll receive an email notification when your status is updated. You can track progress in <strong>My Applications</strong>.</p>
            </div>
          </div>

          {/* CTA row */}
          <div className="flex items-center justify-between mt-6">
            <Button variant="secondary" onClick={onRetake}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M2 7a5 5 0 1 0 5-5 5 5 0 0 0-3.5 1.5L2 5"/><path d="M2 2.5V5h2.5"/></svg>
              Retake Interview
            </Button>
            <Button onClick={onApplications}>
              Back to My Applications →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 6: My Applications ────────────────────────────────────────────────

type AppStatus = 'Submitted' | 'Under Review' | 'Interview' | 'Accepted' | 'Rejected';

interface AppRecord {
  id: string;
  title: string;
  company: string;
  companyInitial: string;
  companyColor: string;
  matchScore: number;
  appliedDate: string;
  status: AppStatus;
  lastUpdated: string;
  timeline: { status: AppStatus; date: string; note: string }[];
}

const STATUS_COLORS: Record<AppStatus, string> = {
  Submitted: 'bg-slate-100 text-slate-600 border-slate-200',
  'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
  Interview: 'bg-violet-50 text-violet-700 border-violet-200',
  Accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_DOT: Record<AppStatus, string> = {
  Submitted: 'bg-slate-400',
  'Under Review': 'bg-blue-500',
  Interview: 'bg-violet-500',
  Accepted: 'bg-emerald-500',
  Rejected: 'bg-red-500',
};

const STATUS_ORDER: AppStatus[] = ['Submitted', 'Under Review', 'Interview', 'Accepted'];

const MY_APPLICATIONS: AppRecord[] = [
  {
    id: 'a1',
    title: 'AI Engineer Intern',
    company: 'FPT Software',
    companyInitial: 'FP',
    companyColor: '#f97316',
    matchScore: 92,
    appliedDate: 'Sep 5, 2026',
    status: 'Interview',
    lastUpdated: '2 days ago',
    timeline: [
      { status: 'Submitted', date: 'Sep 5', note: 'Application submitted' },
      { status: 'Under Review', date: 'Sep 6', note: 'Application moved to Under Review' },
      { status: 'Interview', date: 'Sep 8', note: 'Interview invitation sent' },
    ],
  },
  {
    id: 'a2',
    title: 'Data Analyst Intern',
    company: 'Viettel',
    companyInitial: 'VT',
    companyColor: '#dc2626',
    matchScore: 84,
    appliedDate: 'Aug 28, 2026',
    status: 'Under Review',
    lastUpdated: '5 days ago',
    timeline: [
      { status: 'Submitted', date: 'Aug 28', note: 'Application submitted' },
      { status: 'Under Review', date: 'Sep 1', note: 'Application moved to Under Review' },
    ],
  },
  {
    id: 'a3',
    title: 'ML Engineer Intern',
    company: 'VinAI',
    companyInitial: 'VA',
    companyColor: '#8b5cf6',
    matchScore: 91,
    appliedDate: 'Aug 15, 2026',
    status: 'Accepted',
    lastUpdated: '1 week ago',
    timeline: [
      { status: 'Submitted', date: 'Aug 15', note: 'Application submitted' },
      { status: 'Under Review', date: 'Aug 18', note: 'Application moved to Under Review' },
      { status: 'Interview', date: 'Aug 22', note: 'AI Interview completed — score 89/100' },
      { status: 'Accepted', date: 'Aug 30', note: 'Offer letter sent via email' },
    ],
  },
  {
    id: 'a4',
    title: 'Backend Engineer Intern',
    company: 'Grab Vietnam',
    companyInitial: 'GV',
    companyColor: '#10b981',
    matchScore: 76,
    appliedDate: 'Sep 1, 2026',
    status: 'Submitted',
    lastUpdated: '9 days ago',
    timeline: [
      { status: 'Submitted', date: 'Sep 1', note: 'Application submitted' },
    ],
  },
  {
    id: 'a5',
    title: 'Frontend Developer Intern',
    company: 'Tiki Corporation',
    companyInitial: 'TK',
    companyColor: '#0ea5e9',
    matchScore: 80,
    appliedDate: 'Aug 20, 2026',
    status: 'Rejected',
    lastUpdated: '3 weeks ago',
    timeline: [
      { status: 'Submitted', date: 'Aug 20', note: 'Application submitted' },
      { status: 'Under Review', date: 'Aug 23', note: 'Application under review' },
      { status: 'Rejected', date: 'Aug 31', note: 'Application not progressed — position filled' },
    ],
  },
];

function StatusBadge({ status }: { status: AppStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border ${STATUS_COLORS[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

function StatusTimeline({ timeline, status }: { timeline: AppRecord['timeline']; status: AppStatus }) {
  const allStatuses: AppStatus[] = ['Submitted', 'Under Review', 'Interview', 'Accepted'];
  const currentIdx = allStatuses.indexOf(status);
  const isRejected = status === 'Rejected';

  return (
    <div className="flex flex-col gap-0">
      {allStatuses.map((s, i) => {
        const event = timeline.find(t => t.status === s);
        const done = isRejected ? event !== undefined : i <= currentIdx;
        const active = !isRejected && s === status;
        const last = i === allStatuses.length - 1;

        return (
          <div key={s} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                done ? 'border-blue-600 bg-blue-600' : active ? 'border-blue-600 bg-white' : 'border-slate-200 bg-white'
              }`}>
                {done && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <path d="M1.5 4L3 5.5L6.5 2"/>
                  </svg>
                )}
              </div>
              {!last && <div className={`w-0.5 h-8 mt-0.5 ${done ? 'bg-blue-200' : 'bg-slate-100'}`} />}
            </div>
            <div className="pb-4 min-w-0">
              <p className={`text-sm font-medium ${done || active ? 'text-slate-900' : 'text-slate-400'}`}>{s}</p>
              {event && <p className="text-xs text-slate-500 mt-0.5">{event.date} · {event.note}</p>}
            </div>
          </div>
        );
      })}
      {isRejected && (
        <div className="flex items-start gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-red-400 bg-red-400 flex items-center justify-center shrink-0">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M2 2l4 4M6 2L2 6"/></svg>
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium text-red-600">Rejected</p>
            {timeline.find(t => t.status === 'Rejected') && (
              <p className="text-xs text-slate-500 mt-0.5">{timeline.find(t => t.status === 'Rejected')!.date} · {timeline.find(t => t.status === 'Rejected')!.note}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationsScreen({ onGoInterview }: { onGoInterview: () => void }) {
  const [selectedId, setSelectedId] = useState('a1');
  const [filterStatus, setFilterStatus] = useState<AppStatus | 'All'>('All');

  const selected = MY_APPLICATIONS.find(a => a.id === selectedId) ?? MY_APPLICATIONS[0];
  const filtered = filterStatus === 'All' ? MY_APPLICATIONS : MY_APPLICATIONS.filter(a => a.status === filterStatus);

  const stats = {
    total: MY_APPLICATIONS.length + 7,
    review: MY_APPLICATIONS.filter(a => a.status === 'Under Review').length + 2,
    interview: MY_APPLICATIONS.filter(a => a.status === 'Interview').length + 1,
    accepted: MY_APPLICATIONS.filter(a => a.status === 'Accepted').length,
  };

  const statusHistory = [
    { date: 'Sep 10', label: 'Interview completed', icon: '🎙', color: 'text-violet-600' },
    { date: 'Sep 8', label: 'Application moved to Interview — FPT Software', icon: '→', color: 'text-blue-600' },
    { date: 'Sep 5', label: 'Application submitted — FPT Software', icon: '✓', color: 'text-slate-600' },
    { date: 'Sep 1', label: 'Application submitted — Grab Vietnam', icon: '✓', color: 'text-slate-600' },
    { date: 'Aug 31', label: 'Application rejected — Tiki Corporation', icon: '✕', color: 'text-red-500' },
    { date: 'Aug 30', label: 'Offer letter received — VinAI Research', icon: '🎉', color: 'text-emerald-600' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>My Applications</h1>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Applications', value: stats.total, color: 'text-slate-900', bg: 'bg-slate-50', border: 'border-slate-200' },
            { label: 'Under Review', value: stats.review, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'Interviews', value: stats.interview, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-100' },
            { label: 'Accepted', value: stats.accepted, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl px-5 py-4`}>
              <p className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Left: application list */}
        <div className="w-[420px] border-r border-slate-200 flex flex-col shrink-0">
          {/* Filter bar */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 flex-wrap">
            {(['All', 'Submitted', 'Under Review', 'Interview', 'Accepted', 'Rejected'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                  filterStatus === s
                    ? s === 'All' ? 'bg-slate-900 text-white border-slate-900' : `${STATUS_COLORS[s as AppStatus]} font-semibold`
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto py-2">
            {filtered.map(app => (
              <button
                key={app.id}
                onClick={() => setSelectedId(app.id)}
                className={`w-full px-5 py-4 text-left border-b border-slate-100 transition-all hover:bg-slate-50 ${selectedId === app.id ? 'bg-blue-50/60 border-l-2 border-l-blue-600' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: app.companyColor }}
                  >
                    {app.companyInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{app.title}</p>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{app.company}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">✦ {app.matchScore}%</span>
                        <span className="text-[10px] text-slate-400">· Applied {app.appliedDate}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{app.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: detail panel */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-7 flex flex-col gap-6">
            {/* App header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                  style={{ background: selected.companyColor }}
                >
                  {selected.companyInitial}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>{selected.title}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{selected.company}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={selected.status} />
                    <span className="text-xs text-slate-400">Updated {selected.lastUpdated}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selected.status === 'Interview' && (
                  <Button onClick={onGoInterview}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><rect x="2" y="4" width="10" height="7" rx="1.5"/><path d="M5 4V3a2 2 0 014 0v1"/></svg>
                    Start Interview
                  </Button>
                )}
                <Button variant="secondary">View Internship</Button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Applied', value: selected.appliedDate },
                { label: 'Match score', value: `${selected.matchScore}%`, color: 'text-blue-700' },
                { label: 'Last updated', value: selected.lastUpdated },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
                  <p className={`text-sm font-semibold ${s.color ?? 'text-slate-900'}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Application Status</h3>
              </div>
              <div className="px-6 py-5">
                <StatusTimeline timeline={selected.timeline} status={selected.status} />
              </div>
            </div>

            {/* Status history */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Status History</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {selected.timeline.slice().reverse().map((event, i) => (
                  <div key={i} className="px-6 py-3.5 flex items-start gap-3">
                    <span className="text-xs text-slate-400 w-12 shrink-0 pt-0.5">{event.date}</span>
                    <div className="flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${STATUS_DOT[event.status]}`} />
                      <p className="text-sm text-slate-700">{event.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Far right: activity feed */}
        <div className="w-64 border-l border-slate-200 flex flex-col shrink-0">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Activity</h3>
          </div>
          <div className="flex-1 overflow-y-auto py-3">
            {statusHistory.map((item, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                <span className="text-base shrink-0">{item.icon}</span>
                <div>
                  <p className="text-xs text-slate-700 leading-relaxed">{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder screens ──────────────────────────────────────────────────────

function PlaceholderScreen({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-12">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{title}</h2>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('discover');
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>('1');

  const handleViewDetail = (id: string) => {
    setSelectedInternshipId(id);
    setScreen('detail');
  };

  const handleApply = () => setScreen('apply');
  const handleBackToDetail = () => setScreen('detail');
  const handleBackToDiscover = () => setScreen('discover');

  return (
    <div className="flex h-full overflow-hidden bg-[#f8f9fb]">
      <Sidebar activeScreen={screen} onNavigate={s => setScreen(s)} />

      <main className="flex-1 overflow-hidden flex flex-col">
        {screen === 'discover' && (
          <DiscoverScreen onViewDetail={handleViewDetail} />
        )}
        {screen === 'detail' && (
          <DetailScreen internshipId={selectedInternshipId} onApply={handleApply} onBack={handleBackToDiscover} />
        )}
        {screen === 'apply' && (
          <ApplyScreen internshipId={selectedInternshipId} onBack={handleBackToDetail} />
        )}
        {screen === 'interview' && (
          <InterviewScreen onComplete={() => setScreen('interview-result')} onBack={() => setScreen('applications')} />
        )}
        {screen === 'interview-result' && (
          <InterviewResultScreen onRetake={() => setScreen('interview')} onApplications={() => setScreen('applications')} />
        )}
        {screen === 'applications' && (
          <ApplicationsScreen onGoInterview={() => setScreen('interview')} />
        )}
        {screen === 'internship' && (
          <PlaceholderScreen title="My Internship" desc="Manage tasks, check-ins, and progress for your active internship." />
        )}

        {screen === 'reports' && (
          <PlaceholderScreen title="Weekly Reports" desc="Submit and review your weekly progress reports." />
        )}
        {screen === 'profile' && (
          <PlaceholderScreen title="Profile" desc="Manage your skills, experience, and preferences." />
        )}
      </main>
    </div>
  );
}
