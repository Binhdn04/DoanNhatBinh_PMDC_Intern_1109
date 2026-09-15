import { useState } from 'react';
import { AdminDashboardScreen } from '@/features/admin/screens';
import { ApplicationsScreen, ApplyScreen, InterviewResultScreen, InterviewScreen } from '@/features/applications/screens';
import { DiscoverScreen, DetailScreen } from '@/features/discovery/screens';
import { EvaluationScreen } from '@/features/evaluation/screens';
import { ProfileOrgScreen } from '@/features/profile/screens';
import { InternshipScreen, SupervisorReviewScreen, WeeklyReportScreen } from '@/features/progress/screens';
import { Sidebar } from './sidebar';
import type { Screen } from './types';

export default function AppShell() {
  const [screen, setScreen] = useState<Screen>('discover');
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>('1');

  const handleViewDetail = (id: string) => { setSelectedInternshipId(id); setScreen('detail'); };
  const handleApply = () => setScreen('apply');

  return (
    <div className="flex h-full overflow-hidden bg-[#f8f9fb]">
      <Sidebar activeScreen={screen} onNavigate={setScreen} />
      <main className="flex-1 overflow-hidden flex flex-col">
        {screen === 'discover' && <DiscoverScreen onViewDetail={handleViewDetail} />}
        {screen === 'detail' && <DetailScreen internshipId={selectedInternshipId} onApply={handleApply} onBack={() => setScreen('discover')} />}
        {screen === 'apply' && <ApplyScreen internshipId={selectedInternshipId} onBack={() => setScreen('detail')} />}
        {screen === 'interview' && <InterviewScreen onComplete={() => setScreen('interview-result')} onBack={() => setScreen('applications')} />}
        {screen === 'interview-result' && <InterviewResultScreen onRetake={() => setScreen('interview')} onApplications={() => setScreen('applications')} />}
        {screen === 'applications' && <ApplicationsScreen onGoInterview={() => setScreen('interview')} />}
        {screen === 'internship' && <InternshipScreen onSubmitReport={() => setScreen('weekly-report')} />}
        {screen === 'weekly-report' && <WeeklyReportScreen onBack={() => setScreen('internship')} onSubmitted={() => setScreen('supervisor-review')} />}
        {screen === 'supervisor-review' && <SupervisorReviewScreen onBack={() => setScreen('internship')} />}
        {screen === 'evaluation' && <EvaluationScreen />}
        {screen === 'profile-org' && <ProfileOrgScreen />}
        {screen === 'admin-dashboard' && <AdminDashboardScreen />}
        {screen === 'profile' && <ProfilePlaceholder />}
        {screen === 'reports' && <ReportsPlaceholder onNavigateToInternship={() => setScreen('internship')} />}
      </main>
    </div>
  );
}

function ProfilePlaceholder() {
  return <div className="flex flex-col items-center justify-center h-full text-center px-12"><div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.418 3.582-7 8-7s8 2.582 8 7"/></svg></div><h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>Profile</h2><p className="text-sm text-slate-500">Manage your skills, experience, and preferences.</p></div>;
}

function ReportsPlaceholder({ onNavigateToInternship }: { onNavigateToInternship: () => void }) {
  return <div className="flex flex-col items-center justify-center h-full text-center px-12"><div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 14V8l9-7 9 7v6M7 24v-7h10v7"/></svg></div><h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>Weekly Reports</h2><p className="text-sm text-slate-500">Navigate to My Internship to submit your weekly report.</p><button onClick={onNavigateToInternship} className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">Go to My Internship →</button></div>;
}
