import { useState } from 'react';
import { Button, FormField, Input, Select } from '@/shared/ui';
import { INTERNSHIPS } from '@/features/discovery/data';
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                {done ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M2.5 7L5.5 10L11.5 4"/></svg> : step.id}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-blue-700' : done ? 'text-slate-600' : 'text-slate-400'}`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && <div className={`w-16 h-0.5 mb-5 mx-1 transition-all ${done ? 'bg-blue-600' : 'bg-slate-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

export function ApplyScreen({ internshipId, onBack }: { internshipId: string; onBack: () => void }) {
  const intern = INTERNSHIPS.find(i => i.id === internshipId) ?? INTERNSHIPS[0];
  const [step, setStep] = useState(1);
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
          <div className="flex justify-center mb-10"><Stepper currentStep={step} /></div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Step {step} of {STEPS.length}</span>
                <h2 className="text-lg font-semibold text-slate-900 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{STEPS[step - 1].label}</h2>
              </div>
            </div>

            <div className="px-8 py-7">
              {step === 1 && (
                <div className="grid grid-cols-2 gap-5">
                  <FormField label="Full name" required><Input value={fullName} onChange={setFullName} placeholder="Your full name" /></FormField>
                  <FormField label="Email address" required><Input type="email" value={email} onChange={setEmail} placeholder="you@university.edu.vn" /></FormField>
                  <FormField label="Phone number" required><Input type="tel" value={phone} onChange={setPhone} placeholder="+84 ..." /></FormField>
                  <FormField label="University" required><Input value={university} onChange={setUniversity} placeholder="Your university name" /></FormField>
                  <FormField label="Major" required><Input value={major} onChange={setMajor} placeholder="e.g. Computer Science" /></FormField>
                  <FormField label="Expected graduation"><Select options={['May 2025', 'Sep 2025', 'May 2026', 'Sep 2026', 'May 2027']} value="May 2025" /></FormField>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-700 flex items-start gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 7v4M8 5.5v.5"/></svg>
                    Keep your cover note concise and genuine. Recruiters spend an average of 30 seconds reading.
                  </div>
                  <FormField label="Cover note" required hint="150–300 words recommended">
                    <textarea value={coverNote} onChange={e => setCoverNote(e.target.value)} placeholder="Tell the company why you are interested..." rows={10} className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none leading-relaxed" />
                  </FormField>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-5">
                    <FormField label="Start date" required><Input type="date" value={startDate} onChange={setStartDate} /></FormField>
                    <FormField label="End date" required><Input type="date" value={endDate} onChange={setEndDate} /></FormField>
                  </div>
                  <FormField label="Weekly availability" required hint="How many hours per week can you commit?">
                    <Select options={['Full-time (40h/week)', 'Part-time (20h/week)', 'Part-time (30h/week)', 'Flexible']} value={weeklyHours} onChange={setWeeklyHours} />
                  </FormField>
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
                          <p className="text-xs text-slate-500">PDF · 2.4 MB</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M2 7l3.5 3.5L12 4"/></svg>
                          Uploaded
                        </span>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-blue-300 transition-all cursor-pointer">
                        <p className="text-sm font-medium text-slate-600">Drop your CV here or click to browse</p>
                      </div>
                    )}
                  </FormField>
                </div>
              )}

              {step === 5 && (
                <div className="flex flex-col items-center gap-6 py-6">
                  <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-500">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><circle cx="18" cy="12" r="5.5"/><path d="M5 31c0-7.18 5.82-11 13-11s13 3.82 13 11"/></svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>AI Interview</h3>
                    <p className="text-sm text-slate-600 max-w-md leading-relaxed">Complete a short AI-powered screening interview. This typically takes 10–15 minutes.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <Button variant="secondary" onClick={back}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M10 12L6 8l4-4"/></svg>
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{step} / {STEPS.length}</span>
                <Button onClick={next} disabled={step === STEPS.length}>
                  {step === STEPS.length ? 'Submit Application' : 'Continue'}
                  {step < STEPS.length && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 4: AI Interview ───────────────────────────────────────────────────

const INTERVIEW_QUESTIONS = [
  { id: 1, question: 'Tell me about yourself and your interest in AI engineering.', hint: 'Briefly describe your background, key experiences, and why you want to work in AI.', timeLimit: 120 },
  { id: 2, question: 'What is the difference between supervised and unsupervised learning? Give a real-world example of each.', hint: 'Focus on the core distinction and choose clear, practical examples you know well.', timeLimit: 150 },
  { id: 3, question: 'Tell me about a machine learning project you have worked on. What was your contribution and what did you learn?', hint: 'Use the STAR method: Situation, Task, Action, Result.', timeLimit: 180 },
  { id: 4, question: 'How would you handle a situation where your model performs well on training data but poorly on production data?', hint: 'Cover data drift, overfitting, evaluation strategies, and monitoring approaches.', timeLimit: 150 },
  { id: 5, question: 'Where do you see AI/ML technology evolving over the next 3 years, and how does that shape your career goals?', hint: 'Show awareness of industry trends and connect them to your personal development plan.', timeLimit: 120 },
];

export function InterviewScreen({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [currentQ, setCurrentQ] = useState(2);
  const [answers, setAnswers] = useState<Record<number, string>>({
    0: 'I am a final-year Computer Science student at HUST with strong interests in machine learning and computer vision...',
    1: 'Supervised learning uses labeled data — for example, training an image classifier on tagged photos. Unsupervised learning finds patterns without labels, such as customer segmentation by purchase behavior.'
  });
  const [isRecording, setIsRecording] = useState(false);
  const [answerMode, setAnswerMode] = useState<'text' | 'voice'>('text');

  const q = INTERVIEW_QUESTIONS[currentQ];
  const answered = Object.keys(answers).length;

  const handleNext = () => {
    if (currentQ < INTERVIEW_QUESTIONS.length - 1) { setCurrentQ(q => q + 1); setIsRecording(false); }
    else onComplete();
  };
  const handlePrev = () => { if (currentQ > 0) setCurrentQ(q => q - 1); else onBack(); };

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
        <div className="text-xs text-slate-400 font-medium">{answered} / {INTERVIEW_QUESTIONS.length} answered</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8 grid grid-cols-3 gap-8">
          <div className="col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              {INTERVIEW_QUESTIONS.map((_, i) => (
                <button key={i} onClick={() => setCurrentQ(i)} className={`transition-all duration-200 rounded-full ${i === currentQ ? 'w-8 h-3 bg-blue-600' : i < currentQ || answers[i] ? 'w-3 h-3 bg-blue-400' : 'w-3 h-3 bg-slate-200'}`} />
              ))}
              <span className="text-xs text-slate-500 ml-1">Question {currentQ + 1} of {INTERVIEW_QUESTIONS.length}</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Question {currentQ + 1}</span>
                <span className="text-xs text-slate-400">{Math.floor(q.timeLimit / 60)}:{String(q.timeLimit % 60).padStart(2, '0')} limit</span>
              </div>
              <div className="px-6 py-6">
                <p className="text-lg font-semibold text-slate-900 leading-snug mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>{q.question}</p>
                <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 mt-0.5"><circle cx="6" cy="6" r="4.5"/><path d="M6 5v3M6 4v.5"/></svg>
                  <span><strong className="text-slate-600">Tip:</strong> {q.hint}</span>
                </div>
              </div>

              <div className="px-6 pb-6 flex flex-col gap-4">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
                  {(['text', 'voice'] as const).map(mode => (
                    <button key={mode} onClick={() => setAnswerMode(mode)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${answerMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      {mode === 'text' ? '⌨ Text answer' : '🎙 Voice answer'}
                    </button>
                  ))}
                </div>

                {answerMode === 'text' ? (
                  <textarea value={answers[currentQ] ?? ''} onChange={e => setAnswers(a => ({ ...a, [currentQ]: e.target.value }))} placeholder="Type your answer here..." rows={8} className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none leading-relaxed" />
                ) : (
                  <div className="flex flex-col items-center gap-4 py-6">
                    <button onClick={() => setIsRecording(r => !r)} className={`w-20 h-20 rounded-full text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                      {isRecording
                        ? <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                        : <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="10" y="3" width="8" height="14" rx="4" fill="currentColor" stroke="none"/><path d="M5 14c0 5 4 8 9 8s9-3 9-8"/><path d="M14 22v3"/></svg>
                      }
                    </button>
                    <p className="text-sm font-medium text-slate-700">{isRecording ? 'Recording...' : 'Click to start recording'}</p>
                  </div>
                )}
              </div>
            </div>

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

          <div className="flex flex-col gap-5">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-blue-600"><path d="M8 2L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5L8 2Z" fill="currentColor"/></svg>
                <span className="text-sm font-semibold text-blue-900">AI Interview</span>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">The interview evaluates technical knowledge, problem solving and communication. Take your time.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Question Overview</span>
              </div>
              <div className="p-3 flex flex-col gap-1">
                {INTERVIEW_QUESTIONS.map((iq, i) => (
                  <button key={i} onClick={() => setCurrentQ(i)} className={`flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${i === currentQ ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${answers[i] ? 'bg-emerald-100 text-emerald-700' : i === currentQ ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {answers[i] ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs leading-relaxed line-clamp-2 ${i === currentQ ? 'text-blue-800 font-medium' : 'text-slate-600'}`}>{iq.question}</span>
                  </button>
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

export function InterviewResultScreen({ onRetake, onApplications }: { onRetake: () => void; onApplications: () => void }) {
  const overallScore = 84;

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
          <div className="bg-white rounded-xl border border-slate-200 p-8 mb-6 flex items-center gap-10">
            <div className="relative shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#2563eb" strokeWidth="10" strokeDasharray={`${2 * Math.PI * 50 * overallScore / 100} ${2 * Math.PI * 50 * (1 - overallScore / 100)}`} strokeLinecap="round"/>
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
              <p className="text-sm text-slate-700 leading-relaxed max-w-md mb-5">Strong understanding of machine learning concepts and good problem-solving ability. With slightly stronger structure and more concrete examples, this would be an excellent performance.</p>
              <div className="flex flex-col gap-3">
                {SCORE_CATEGORIES.map(cat => (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 font-medium">{cat.label}</span>
                      <span className="text-sm font-semibold text-slate-900">{cat.score}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${cat.score}%`, background: cat.score >= 85 ? '#2563eb' : cat.score >= 75 ? '#7c3aed' : '#f97316' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M2 7l3.5 3.5L12 4"/></svg>
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Strengths</h2>
              </div>
              <div className="flex flex-col gap-2.5">
                {['Strong technical fundamentals in Python and ML', 'Good understanding of ML workflows end-to-end', 'Practical project experience with real datasets', 'Demonstrated awareness of production challenges'].map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700"><span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>{s}</div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 2v6M7 10v1.5"/></svg>
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Areas for improvement</h2>
              </div>
              <div className="flex flex-col gap-2.5">
                {['Give more concrete, quantified examples (metrics, scale)', 'Improve answer structure using STAR method consistently', 'Explain technical decisions and trade-offs more clearly', 'Build confidence discussing industry trends'].map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700"><span className="text-amber-500 shrink-0 mt-0.5">•</span>{s}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <Button variant="secondary" onClick={onRetake}>Retake Interview</Button>
            <Button onClick={onApplications}>Back to My Applications →</Button>
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

const MY_APPLICATIONS: AppRecord[] = [
  { id: 'a1', title: 'AI Engineer Intern', company: 'FPT Software', companyInitial: 'FP', companyColor: '#f97316', matchScore: 92, appliedDate: 'Sep 5, 2026', status: 'Interview', lastUpdated: '2 days ago', timeline: [{ status: 'Submitted', date: 'Sep 5', note: 'Application submitted' }, { status: 'Under Review', date: 'Sep 6', note: 'Application moved to Under Review' }, { status: 'Interview', date: 'Sep 8', note: 'Interview invitation sent' }] },
  { id: 'a2', title: 'Data Analyst Intern', company: 'Viettel', companyInitial: 'VT', companyColor: '#dc2626', matchScore: 84, appliedDate: 'Aug 28, 2026', status: 'Under Review', lastUpdated: '5 days ago', timeline: [{ status: 'Submitted', date: 'Aug 28', note: 'Application submitted' }, { status: 'Under Review', date: 'Sep 1', note: 'Application moved to Under Review' }] },
  { id: 'a3', title: 'ML Engineer Intern', company: 'VinAI', companyInitial: 'VA', companyColor: '#8b5cf6', matchScore: 91, appliedDate: 'Aug 15, 2026', status: 'Accepted', lastUpdated: '1 week ago', timeline: [{ status: 'Submitted', date: 'Aug 15', note: 'Application submitted' }, { status: 'Under Review', date: 'Aug 18', note: 'Application moved to Under Review' }, { status: 'Interview', date: 'Aug 22', note: 'AI Interview completed — score 89/100' }, { status: 'Accepted', date: 'Aug 30', note: 'Offer letter sent via email' }] },
  { id: 'a4', title: 'Backend Engineer Intern', company: 'Grab Vietnam', companyInitial: 'GV', companyColor: '#10b981', matchScore: 76, appliedDate: 'Sep 1, 2026', status: 'Submitted', lastUpdated: '9 days ago', timeline: [{ status: 'Submitted', date: 'Sep 1', note: 'Application submitted' }] },
  { id: 'a5', title: 'Frontend Developer Intern', company: 'Tiki Corporation', companyInitial: 'TK', companyColor: '#0ea5e9', matchScore: 80, appliedDate: 'Aug 20, 2026', status: 'Rejected', lastUpdated: '3 weeks ago', timeline: [{ status: 'Submitted', date: 'Aug 20', note: 'Application submitted' }, { status: 'Under Review', date: 'Aug 23', note: 'Application under review' }, { status: 'Rejected', date: 'Aug 31', note: 'Application not progressed — position filled' }] },
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
        const last = i === allStatuses.length - 1;
        return (
          <div key={s} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${done ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-white'}`}>
                {done && <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M1.5 4L3 5.5L6.5 2"/></svg>}
              </div>
              {!last && <div className={`w-0.5 h-8 mt-0.5 ${done ? 'bg-blue-200' : 'bg-slate-100'}`} />}
            </div>
            <div className="pb-4 min-w-0">
              <p className={`text-sm font-medium ${done ? 'text-slate-900' : 'text-slate-400'}`}>{s}</p>
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

export function ApplicationsScreen({ onGoInterview }: { onGoInterview: () => void }) {
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>My Applications</h1>
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
        <div className="w-[420px] border-r border-slate-200 flex flex-col shrink-0">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 flex-wrap">
            {(['All', 'Submitted', 'Under Review', 'Interview', 'Accepted', 'Rejected'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${filterStatus === s ? s === 'All' ? 'bg-slate-900 text-white border-slate-900' : `${STATUS_COLORS[s as AppStatus]} font-semibold` : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{s}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {filtered.map(app => (
              <button key={app.id} onClick={() => setSelectedId(app.id)} className={`w-full px-5 py-4 text-left border-b border-slate-100 transition-all hover:bg-slate-50 ${selectedId === app.id ? 'bg-blue-50/60 border-l-2 border-l-blue-600' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: app.companyColor }}>{app.companyInitial}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{app.title}</p>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{app.company}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">✦ {app.matchScore}%</span>
                      <span className="text-[10px] text-slate-400">{app.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-7 flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0" style={{ background: selected.companyColor }}>{selected.companyInitial}</div>
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

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Application Status</h3>
              </div>
              <div className="px-6 py-5">
                <StatusTimeline timeline={selected.timeline} status={selected.status} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
