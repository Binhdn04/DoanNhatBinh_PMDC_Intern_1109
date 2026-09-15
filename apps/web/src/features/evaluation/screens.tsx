import { useState } from 'react';
import { Button } from '@/shared/ui';
// ─── Screen 10: Internship Evaluation ────────────────────────────────────────

type CompletionDecision = 'Passed' | 'Failed' | 'Pending';

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-slate-700 w-40 shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`w-7 h-7 rounded-lg transition-all text-sm ${star <= value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            {star}
          </button>
        ))}
      </div>
      <span className="text-xs text-slate-400 ml-1">
        {value === 1 ? 'Poor' : value === 2 ? 'Fair' : value === 3 ? 'Good' : value === 4 ? 'Very Good' : 'Excellent'}
      </span>
    </div>
  );
}

export function EvaluationScreen() {
  const [selfRatings, setSelfRatings] = useState({ workQuality: 4, teamwork: 4, communication: 3, initiative: 4, punctuality: 5 });
  const [supRatings, setSupRatings] = useState({ workQuality: 4, teamwork: 5, communication: 4, initiative: 3, punctuality: 5 });
  const [outcomes, setOutcomes] = useState<Record<string, boolean>>({
    'Applied ML techniques to real problems': true,
    'Deployed a production-ready API': true,
    'Collaborated in an agile team': true,
    'Used industry-standard tools (Git, Docker, CI/CD)': true,
    'Presented technical findings to stakeholders': false,
    'Wrote technical documentation': true,
  });
  const [decision, setDecision] = useState<CompletionDecision>('Passed');
  const [submitted, setSubmitted] = useState(false);

  const selfAvg = Math.round(Object.values(selfRatings).reduce((a, b) => a + b, 0) / Object.values(selfRatings).length * 20);
  const supAvg = Math.round(Object.values(supRatings).reduce((a, b) => a + b, 0) / Object.values(supRatings).length * 20);
  const overallScore = Math.round((selfAvg + supAvg) / 2);

  const decisionStyle: Record<CompletionDecision, string> = {
    Passed: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    Failed: 'bg-red-50 border-red-200 text-red-700',
    Pending: 'bg-amber-50 border-amber-200 text-amber-700',
  };
  const decisionDot: Record<CompletionDecision, string> = {
    Passed: 'bg-emerald-500', Failed: 'bg-red-500', Pending: 'bg-amber-500',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 py-5 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Internship Evaluation</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI Engineer Intern · FPT Software · Jun 01 – Aug 31, 2026</p>
        </div>
        {submitted && (
          <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>
            Evaluation submitted
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-5">

          {/* Overall score hero */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-8">
            <div className="relative shrink-0">
              <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
                <circle cx="48" cy="48" r="40" fill="none" stroke="#2563eb" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40 * overallScore / 100} ${2 * Math.PI * 40 * (1 - overallScore / 100)}`}
                  strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>{overallScore}</span>
                <span className="text-[10px] text-slate-500">/ 100</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Overall Evaluation Score</p>
              <div className="flex gap-6 mb-3">
                {[{ label: 'Self-Assessment', value: selfAvg, color: '#7c3aed' }, { label: 'Supervisor Rating', value: supAvg, color: '#2563eb' }].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-28 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Completion decision */}
            <div className="flex flex-col gap-2 shrink-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completion</p>
              <div className="flex gap-2">
                {(['Passed', 'Failed', 'Pending'] as CompletionDecision[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDecision(d)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${decision === d ? decisionStyle[d] : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${decision === d ? decisionDot[d] : 'bg-slate-300'}`} />
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Student self-assessment */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-violet-50 border border-violet-100 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round"><circle cx="6" cy="4" r="2"/><path d="M2 10c0-2.2 1.79-3.5 4-3.5s4 1.3 4 3.5"/></svg>
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Student Self-Assessment</h2>
                <span className="ml-auto text-xs font-bold text-violet-700">{selfAvg}/100</span>
              </div>
              <div className="px-5 py-4 flex flex-col gap-3">
                {(Object.keys(selfRatings) as (keyof typeof selfRatings)[]).map(key => (
                  <RatingRow
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    value={selfRatings[key]}
                    onChange={v => setSelfRatings(r => ({ ...r, [key]: v }))}
                  />
                ))}
              </div>
            </div>

            {/* Supervisor rating */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#2563eb" strokeWidth="1.75" strokeLinecap="round"><rect x="1" y="2" width="10" height="8" rx="1.5"/><path d="M4 10v1.5M8 10v1.5"/></svg>
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Supervisor Performance Rating</h2>
                <span className="ml-auto text-xs font-bold text-blue-700">{supAvg}/100</span>
              </div>
              <div className="px-5 py-4 flex flex-col gap-3">
                {(Object.keys(supRatings) as (keyof typeof supRatings)[]).map(key => (
                  <RatingRow
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    value={supRatings[key]}
                    onChange={v => setSupRatings(r => ({ ...r, [key]: v }))}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Learning outcomes */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#059669" strokeWidth="1.75" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>
              </div>
              <h2 className="text-sm font-semibold text-slate-900">Learning Outcomes</h2>
              <span className="ml-auto text-xs text-slate-500">{Object.values(outcomes).filter(Boolean).length}/{Object.keys(outcomes).length} achieved</span>
            </div>
            <div className="px-5 py-4 grid grid-cols-2 gap-3">
              {Object.entries(outcomes).map(([label, checked]) => (
                <label key={label} className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => setOutcomes(o => ({ ...o, [label]: !o[label] }))}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-emerald-400'}`}
                  >
                    {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M2 5l2 2 4-4"/></svg>}
                  </div>
                  <span className={`text-sm leading-snug transition-colors ${checked ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pb-2">
            <Button variant="secondary">Save Draft</Button>
            <Button size="lg" onClick={() => setSubmitted(true)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M2 7l3.5 3.5L12 4"/></svg>
              Submit Evaluation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

