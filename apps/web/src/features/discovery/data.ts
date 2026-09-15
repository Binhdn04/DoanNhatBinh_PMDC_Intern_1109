


// ─── Types ───────────────────────────────────────────────────────────────────

export interface Internship {
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

export const INTERNSHIPS: Internship[] = [
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
    description: 'Build beautiful, high-performance user interfaces for Vietnam\'s leading e-commerce platform.',
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
    description: 'Support VinAI\'s research teams with data pipelines, exploratory analysis, and visualization dashboards.',
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
    description: 'Help build the payment infrastructure that powers Vietnam\'s most popular digital wallet.',
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
    description: 'Design intuitive, delightful experiences for Shopee\'s mobile and web platforms.',
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
    description: 'Work on VNG\'s cloud infrastructure team, managing Kubernetes clusters and CI/CD pipelines.',
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

export function matchColor(score: number) {
  if (score >= 85) return { bg: '#eff6ff', text: '#1d4ed8', bar: '#2563eb' };
  if (score >= 70) return { bg: '#f5f3ff', text: '#6d28d9', bar: '#7c3aed' };
  return { bg: '#fff7ed', text: '#c2410c', bar: '#f97316' };
}

export function workTypeBadge(type: string) {
  if (type === 'Remote') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (type === 'Hybrid') return 'bg-blue-50 text-blue-700 border border-blue-200';
  return 'bg-slate-100 text-slate-600 border border-slate-200';
}

