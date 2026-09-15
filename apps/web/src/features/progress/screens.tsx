import { useState } from 'react';
import { Button, FormField, Input, Select } from '@/shared/ui';
// ─── Screen 7: My Internship (Kanban + Progress) ──────────────────────────────

type TaskStatus = 'todo' | 'inprogress' | 'done';
type TaskPriority = 'High' | 'Medium' | 'Low';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedBy: string;
  completedDate?: string;
}

const KANBAN_TASKS: Task[] = [
  { id: 't1', title: 'Prepare dataset', description: 'Collect and clean image dataset for classification model training.', status: 'todo', priority: 'Medium', dueDate: 'Sep 15', assignedBy: 'Nguyen Van A' },
  { id: 't2', title: 'Write unit tests for API', description: 'Add test coverage for inference endpoints.', status: 'todo', priority: 'Low', dueDate: 'Sep 20', assignedBy: 'Nguyen Van A' },
  { id: 't3', title: 'Review model architecture', description: 'Compare ResNet vs EfficientNet for the classification task.', status: 'todo', priority: 'Medium', dueDate: 'Sep 22', assignedBy: 'Nguyen Van A' },
  { id: 't4', title: 'Build image classification API', description: 'Implement FastAPI endpoints to serve the trained image classification model.', status: 'inprogress', priority: 'High', dueDate: 'Sep 18', assignedBy: 'Nguyen Van A' },
  { id: 't5', title: 'Optimize inference pipeline', description: 'Reduce latency for model serving using ONNX and batching.', status: 'inprogress', priority: 'High', dueDate: 'Sep 19', assignedBy: 'Nguyen Van A' },
  { id: 't6', title: 'Set up development environment', description: 'Configure Docker, virtual environments, and project dependencies.', status: 'done', priority: 'High', dueDate: 'Sep 05', assignedBy: 'Nguyen Van A', completedDate: 'Sep 05' },
  { id: 't7', title: 'Attend team onboarding', description: 'Complete all onboarding sessions and meet team members.', status: 'done', priority: 'Medium', dueDate: 'Sep 06', assignedBy: 'Nguyen Van A', completedDate: 'Sep 06' },
  { id: 't8', title: 'Research object detection models', description: 'Survey YOLO, SSD, and Faster R-CNN for the detection subtask.', status: 'done', priority: 'Medium', dueDate: 'Sep 08', assignedBy: 'Nguyen Van A', completedDate: 'Sep 09' },
  { id: 't9', title: 'Set up CI pipeline', description: 'Configure GitHub Actions for automated testing.', status: 'done', priority: 'Low', dueDate: 'Sep 10', assignedBy: 'Nguyen Van A', completedDate: 'Sep 10' },
  { id: 't10', title: 'Data preprocessing module', description: 'Write reusable transforms and augmentation pipeline.', status: 'done', priority: 'High', dueDate: 'Sep 12', assignedBy: 'Nguyen Van A', completedDate: 'Sep 12' },
  { id: 't11', title: 'Baseline model training', description: 'Train first baseline and log metrics to MLflow.', status: 'done', priority: 'High', dueDate: 'Sep 13', assignedBy: 'Nguyen Van A', completedDate: 'Sep 13' },
  { id: 't12', title: 'Fix deployment config bugs', description: 'Resolve Docker and environment variable issues in staging.', status: 'done', priority: 'Medium', dueDate: 'Sep 14', assignedBy: 'Nguyen Van A', completedDate: 'Sep 14' },
  { id: 't13', title: 'Write technical documentation', description: 'Document model architecture, API endpoints, and setup guide.', status: 'done', priority: 'Low', dueDate: 'Sep 14', assignedBy: 'Nguyen Van A', completedDate: 'Sep 14' },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
};

function KanbanCard({ task }: { task: Task }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900 leading-snug">{task.title}</p>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{task.description}</p>
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2" width="10" height="9" rx="1.5"/><path d="M1 5h10M4 2V1M8 2V1"/></svg>
          {task.completedDate ? `Completed ${task.completedDate}` : `Due ${task.dueDate}`}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="4" r="2"/><path d="M2 10c0-2.209 1.79-3.5 4-3.5s4 1.291 4 3.5"/></svg>
          {task.assignedBy}
        </div>
      </div>
    </div>
  );
}

export function InternshipScreen({ onSubmitReport }: { onSubmitReport: () => void }) {
  const todo = KANBAN_TASKS.filter(t => t.status === 'todo');
  const inprogress = KANBAN_TASKS.filter(t => t.status === 'inprogress');
  const done = KANBAN_TASKS.filter(t => t.status === 'done');
  const totalTasks = KANBAN_TASKS.length;
  const completedTasks = done.length;
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  const summaryCards = [
    { label: 'Completed Tasks', value: completedTasks, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', dotColor: 'bg-emerald-500' },
    { label: 'In Progress', value: inprogress.length, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', dotColor: 'bg-blue-500' },
    { label: 'To Do', value: todo.length, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', dotColor: 'bg-slate-400' },
    { label: 'Overdue', value: 0, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', dotColor: 'bg-red-500' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>My Internship</h1>
            <p className="text-sm text-slate-500 mt-0.5">AI Engineer Intern · FPT Software</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
        {/* Internship summary + progress */}
        <div className="grid grid-cols-3 gap-5">
          {/* Summary card */}
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-6 flex gap-8">
            <div className="flex flex-col gap-3 flex-1">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Internship Details</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Supervisor', value: 'Nguyen Van A' },
                    { label: 'Duration', value: 'Jun 01 – Aug 31, 2026' },
                    { label: 'Location', value: 'Hanoi · Full-time' },
                    { label: 'Stipend', value: '10M VND/month' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500 w-20 shrink-0">{item.label}</span>
                      <span className="font-medium text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
                  <span className="text-2xl font-bold text-blue-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>{overallProgress}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${overallProgress}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">{completedTasks} of {totalTasks} tasks completed</p>
              </div>
            </div>

            {/* Circular progress */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="relative">
                <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#2563eb" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 42 * overallProgress / 100} ${2 * Math.PI * 42 * (1 - overallProgress / 100)}`}
                    strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>{overallProgress}%</span>
                  <span className="text-[10px] text-slate-500">complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-rows-4 gap-3">
            {summaryCards.map(card => (
              <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl px-4 py-3 flex items-center gap-3`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${card.dotColor}`} />
                <div>
                  <p className={`text-xl font-bold ${card.color}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>{card.value}</p>
                  <p className="text-xs text-slate-500">{card.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kanban board */}
        <div>
          <h2 className="text-base font-semibold text-slate-900 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Task Board</h2>
          <div className="grid grid-cols-3 gap-4">
            {/* TO DO */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">To Do</span>
                <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{todo.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {todo.map(t => <KanbanCard key={t.id} task={t} />)}
              </div>
            </div>

            {/* IN PROGRESS */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">In Progress</span>
                <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{inprogress.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {inprogress.map(t => <KanbanCard key={t.id} task={t} />)}
              </div>
            </div>

            {/* DONE */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Done</span>
                <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{done.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {done.slice(0, 4).map(t => <KanbanCard key={t.id} task={t} />)}
                {done.length > 4 && (
                  <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-1 py-2 text-center">+ {done.length - 4} more completed tasks</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines + Weekly Report */}
        <div className="grid grid-cols-2 gap-5">
          {/* Upcoming Deadlines */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Upcoming Deadlines</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {[...todo, ...inprogress]
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .slice(0, 4)
                .map(t => (
                  <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] text-slate-500 leading-none">{t.dueDate.split(' ')[0]}</span>
                      <span className="text-xs font-bold text-slate-900 leading-none">{t.dueDate.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                      <p className="text-xs text-slate-500">{t.status === 'inprogress' ? 'In progress' : 'Not started'}</p>
                    </div>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Weekly Report card */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Weekly Report</h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Awaiting submission
              </span>
            </div>
            <div className="px-5 py-5 flex flex-col gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Current period</p>
                <p className="text-base font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Week 04</p>
                <p className="text-sm text-slate-500">Sep 08 – Sep 14, 2026</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700 flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 mt-0.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 4.5v3M7 9v.5"/></svg>
                Report is due today. Submit before end of day to notify your supervisor.
              </div>
              <Button fullWidth onClick={onSubmitReport}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><rect x="2" y="2" width="10" height="10" rx="1.5"/><path d="M5 7l2 2 4-4"/></svg>
                Submit Weekly Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 8: Weekly Report ──────────────────────────────────────────────────

export function WeeklyReportScreen({ onBack, onSubmitted }: { onBack: () => void; onSubmitted: () => void }) {
  const [accomplishments, setAccomplishments] = useState('');
  const [challenges, setChallenges] = useState('');
  const [nextWeek, setNextWeek] = useState('');
  const [savedDraft, setSavedDraft] = useState(false);

  const completedTasks = KANBAN_TASKS.filter(t => t.status === 'done');
  const inProgressTasks = KANBAN_TASKS.filter(t => t.status === 'inprogress');

  const handleSaveDraft = () => {
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 2500);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-4 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M10 12L6 8l4-4"/></svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Weekly Report — Week 04</h1>
            <p className="text-sm text-slate-500">AI Engineer Intern · Sep 08 – Sep 14, 2026</p>
          </div>
        </div>
        {savedDraft && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>
            Draft saved
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8 flex flex-col gap-6">
          {/* AI Summary info card */}
          <div className="flex items-start gap-4 px-5 py-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5L8 2Z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-0.5">AI Summary</p>
              <p className="text-xs text-blue-700 leading-relaxed">After submission, AI will automatically summarize your report and highlight key achievements, challenges and areas requiring attention — making it easy for your supervisor to review.</p>
            </div>
          </div>

          {/* Form sections */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">1</div>
              <h2 className="text-sm font-semibold text-slate-900">What did you accomplish?</h2>
            </div>
            <div className="px-6 py-5">
              <textarea
                value={accomplishments}
                onChange={e => setAccomplishments(e.target.value)}
                placeholder="Describe the tasks and achievements you completed this week..."
                rows={6}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                <span>{accomplishments.split(' ').filter(Boolean).length} words</span>
                <span>Be specific — mention task names and measurable outcomes</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">2</div>
              <h2 className="text-sm font-semibold text-slate-900">Challenges</h2>
            </div>
            <div className="px-6 py-5">
              <textarea
                value={challenges}
                onChange={e => setChallenges(e.target.value)}
                placeholder="Describe any problems or challenges you encountered..."
                rows={5}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">3</div>
              <h2 className="text-sm font-semibold text-slate-900">Next week's plan</h2>
            </div>
            <div className="px-6 py-5">
              <textarea
                value={nextWeek}
                onChange={e => setNextWeek(e.target.value)}
                placeholder="What do you plan to work on next week?"
                rows={5}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Task Progress */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 text-xs font-bold">4</div>
              <h2 className="text-sm font-semibold text-slate-900">Task Progress</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {[...completedTasks.slice(-3), ...inProgressTasks].map(t => (
                <div key={t.id} className="px-6 py-3.5 flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${t.status === 'done' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                    {t.status === 'done'
                      ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><path d="M2 5l2 2 4-4"/></svg>
                      : <div className="w-2 h-2 rounded-full bg-blue-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.status === 'done' ? `Completed ${t.completedDate}` : `In progress · Due ${t.dueDate}`}</p>
                  </div>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">5</div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Attachments</h2>
                <p className="text-xs text-slate-400">Optional</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer group">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3 text-slate-300 group-hover:text-blue-400 transition-colors" stroke="currentColor" strokeWidth="1.5"><path d="M16 4v18M10 10l6-6 6 6"/><rect x="4" y="22" width="24" height="6" rx="2"/></svg>
                <p className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Drop files here or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOCX, images — max 20MB each</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={handleSaveDraft}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M2 10V4a1 1 0 011-1h6l3 3v4a1 1 0 01-1 1H3a1 1 0 01-1-1z"/><path d="M8 3v3H5"/></svg>
              Save Draft
            </Button>
            <Button size="lg" onClick={onSubmitted}>
              Submit Report
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 9: Supervisor Review ──────────────────────────────────────────────

export function SupervisorReviewScreen({ onBack }: { onBack: () => void }) {
  const [feedback, setFeedback] = useState('');
  const [actionTaken, setActionTaken] = useState<'approved' | 'revision' | null>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-4 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M10 12L6 8l4-4"/></svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Report Review — Week 04</h1>
            <p className="text-sm text-slate-500">Nguyen Van B · AI Engineer Intern · FPT Software</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Under Review
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-3 gap-7">
          {/* Main content */}
          <div className="col-span-2 flex flex-col gap-6">
            {/* Report content */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">Submitted Report</h2>
                  <span className="text-xs text-slate-400">Sep 14, 2026 at 17:32</span>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { label: 'Accomplishments', num: '1', numColor: 'bg-emerald-50 text-emerald-600 border-emerald-100', content: 'This week I completed the image classification API using FastAPI. The endpoint accepts an image and returns top-3 class predictions with confidence scores. I also improved the model inference pipeline by switching to ONNX runtime, reducing latency from 340ms to 89ms per request. Additionally, I resolved several Docker configuration issues that had been blocking the staging deployment.' },
                  { label: 'Challenges', num: '2', numColor: 'bg-amber-50 text-amber-600 border-amber-100', content: 'The main challenges were Docker networking configuration issues when setting up the multi-container environment. There was also limited test coverage for the API endpoints — we did not have time to write comprehensive unit tests before the deadline. I plan to address these next week.' },
                  { label: 'Next Week\'s Plan', num: '3', numColor: 'bg-blue-50 text-blue-600 border-blue-100', content: 'I plan to add automated tests for all API endpoints, write the technical documentation for the classification module, and start on the dataset preparation task for the next model version. I also want to explore TorchScript as an alternative to ONNX.' },
                ].map(section => (
                  <div key={section.label} className="px-6 py-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-5 h-5 rounded border text-[10px] font-bold flex items-center justify-center ${section.numColor}`}>{section.num}</span>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{section.label}</h3>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Summary — prominent feature card */}
            <div className="rounded-xl overflow-hidden border border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50/60 to-blue-50">
              <div className="px-6 py-4 border-b border-blue-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5L8 2Z" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900">AI Summary</p>
                  <p className="text-xs text-blue-600">Auto-generated from student's report</p>
                </div>
              </div>
              <div className="px-6 py-5 grid grid-cols-3 gap-5">
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M1.5 4L3 5.5L6.5 2"/></svg>
                    </div>
                    <span className="text-xs font-semibold text-slate-800">Key achievements</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {['Completed image classification API', 'Improved model inference pipeline', 'Fixed deployment issues'].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-emerald-500 shrink-0 mt-0.5">•</span>{item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M4 2v3M4 6.5v.5"/></svg>
                    </div>
                    <span className="text-xs font-semibold text-slate-800">Challenges</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {['Docker configuration problems', 'Limited test coverage'].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-amber-500 shrink-0 mt-0.5">•</span>{item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M4 1v4M2.5 5.5L4 7l1.5-1.5"/></svg>
                    </div>
                    <span className="text-xs font-semibold text-slate-800">Recommended focus</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {['Add automated API tests', 'Improve deployment documentation'].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-blue-500 shrink-0 mt-0.5">•</span>{item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Supervisor feedback */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">Supervisor Feedback</h2>
              </div>
              <div className="px-6 py-5 flex flex-col gap-4">
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Provide feedback to the student..."
                  rows={5}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition resize-none leading-relaxed"
                />
                <div className="flex items-center gap-3">
                  <Button
                    variant={actionTaken === 'approved' ? 'success' : 'success'}
                    onClick={() => setActionTaken('approved')}
                    size="md"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 7l3.5 3.5L12 4"/></svg>
                    {actionTaken === 'approved' ? 'Approved' : 'Approve Report'}
                  </Button>
                  <Button
                    variant={actionTaken === 'revision' ? 'secondary' : 'secondary'}
                    onClick={() => setActionTaken('revision')}
                    size="md"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M2 7a5 5 0 1 0 5-5 5 5 0 0 0-3.5 1.5L2 5"/><path d="M2 2.5V5h2.5"/></svg>
                    Request Revision
                  </Button>
                </div>
                {actionTaken && (
                  <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${actionTaken === 'approved' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                    {actionTaken === 'approved'
                      ? <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M2 7l3.5 3.5L12 4"/></svg> Report approved and student notified.</>
                      : <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M7 2v6M7 10v1.5"/></svg> Revision requested — student has been notified.</>
                    }
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Student info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">NB</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Nguyen Van B</p>
                  <p className="text-xs text-slate-500">HUST · CS 2025</p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Student Progress</p>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-600">Overall</span>
                    <span className="text-sm font-bold text-blue-600">72%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: '72%' }} />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Task completion</p>
                  <p className="text-sm font-semibold text-slate-900">8 / 13 tasks</p>
                </div>
              </div>
            </div>

            {/* Report status */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Report Status</h3>
              </div>
              <div className="px-5 py-4 flex flex-col gap-0">
                {[
                  { date: 'Sep 14', label: 'Report submitted', status: 'done', note: 'Student submitted Week 04 report' },
                  { date: 'Sep 15', label: 'Under supervisor review', status: 'active', note: 'Awaiting supervisor feedback' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${item.status === 'done' ? 'border-blue-600 bg-blue-600' : 'border-blue-600 bg-white'}`}>
                        {item.status === 'done' && <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M1.5 4L3 5.5L6.5 2"/></svg>}
                      </div>
                      {i < 1 && <div className="w-0.5 h-8 bg-blue-100 mt-0.5" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-slate-500">{item.date}</p>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submitted tasks this week */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed This Week</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {KANBAN_TASKS.filter(t => t.status === 'done').slice(4).map(t => (
                  <div key={t.id} className="px-5 py-3 flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>
                    <p className="text-xs text-slate-700 truncate">{t.title}</p>
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

