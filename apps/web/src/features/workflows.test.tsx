import {ReportsPage} from "./report-list";
import {MonitoringPage} from "./monitoring";
import { endpoints, ApiError, type Report } from "@/lib/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ProfilePage, SkillEditor } from "./profile";
import { PlacementPage, PlacementsPage, NotificationsPage } from "./placements";
import { ReportDetailPage } from "./reports";
import { ApplyPage, ApplicationsPage, ApplicationPage, ApplicationActions } from "./applications";
import { AssessmentPage } from "./assessment";
import { NewPosting, PostingActions, PostingDetail, PostingsPage } from "./postings";
const session = vi.hoisted(() => ({ activeRole: "STUDENT" }));
vi.mock("../app/session", () => ({ useSession: () => session }));
const placement = {
  id: "p1",
  applicationId: "a1",
  studentId: "s1",
  companyId: "c1",
  status: "ACTIVE",
  startDate: "2026-09-14",
  endDate: "2026-12-31",
};
function mount(
  node: ReactNode,
  path = "/placements/p1",
  route = "/placements/:placementId",
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={route} element={node} />
          <Route path="*" element={<p>Destination</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  session.activeRole = "STUDENT";
  vi.spyOn(endpoints, "placement").mockResolvedValue(placement);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it("shows and recovers from skill validation errors using supported proficiency values", async () => {
  const save = vi
    .fn()
    .mockRejectedValueOnce(new ApiError(400, "Invalid proficiency"))
    .mockResolvedValue(undefined);
  mount(<SkillEditor skills={[]} onSave={save} />);
  fireEvent.change(screen.getByLabelText("Skills"), {
    target: { value: "TypeScript | invalid" },
  });
  fireEvent.click(screen.getByText("Save skills"));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Invalid proficiency",
  );
  fireEvent.change(screen.getByLabelText("Skills"), {
    target: { value: "TypeScript" },
  });
  fireEvent.click(screen.getByText("Save skills"));
  expect(await screen.findByRole("status")).toHaveTextContent("Skills saved.");
  expect(save).toHaveBeenLastCalledWith([
    { name: "TypeScript", proficiency: "BEGINNER" },
  ]);
});
it("lists authorized placements and handles a failed list", async () => {
  vi.spyOn(endpoints, "placements").mockResolvedValue([placement]);
  mount(<PlacementsPage />);
  expect(
    await screen.findByRole("link", { name: /Placement 2026/ }),
  ).toHaveAttribute("href", "/placements/p1");
  cleanup();
  vi.mocked(endpoints.placements).mockRejectedValue(new Error("Unavailable"));
  mount(<PlacementsPage />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Unavailable");
});
it("lets students update their task and surfaces rejected updates", async () => {
  vi.spyOn(endpoints, "tasks").mockResolvedValue([
    {
      id: "t1",
      title: "Tests",
      description: "Cover failure",
      priority: "HIGH",
      status: "TODO",
    },
  ]);
  const update = vi
    .spyOn(endpoints, "taskStatus")
    .mockRejectedValue(new Error("Placement ended"));
  mount(<PlacementPage />);
  fireEvent.change(await screen.findByLabelText("Status for Tests"), {
    target: { value: "DONE" },
  });
  await waitFor(() => expect(update).toHaveBeenCalledWith("p1", "t1", "DONE"));
  expect(await screen.findByRole("alert")).toHaveTextContent("Placement ended");
});
it("lets supervisors create tasks and complete the placement", async () => {
  session.activeRole = "SUPERVISOR";
  vi.spyOn(endpoints, "tasks").mockResolvedValue([]);
  const add = vi
    .spyOn(endpoints, "createTask")
    .mockResolvedValue({
      id: "t",
      title: "Test",
      description: "Description",
      priority: "HIGH",
      status: "TODO",
    });
  const end = vi
    .spyOn(endpoints, "placementLifecycle")
    .mockResolvedValue({ ...placement, status: "COMPLETED" });
  mount(<PlacementPage />);
  fireEvent.click(await screen.findByText("Assign task"));
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Test" },
  });
  fireEvent.change(screen.getByLabelText("Description"), {
    target: { value: "Description" },
  });
  fireEvent.change(screen.getByLabelText("Priority"), {
    target: { value: "HIGH" },
  });
  fireEvent.click(screen.getByText("Create task"));
  expect(await screen.findByText("Task created.")).toBeVisible();
  expect(add).toHaveBeenCalledWith(
    "p1",
    expect.objectContaining({ title: "Test", priority: "HIGH" }),
  );
  fireEvent.click(screen.getByText("Complete placement"));
  await waitFor(() => expect(end).toHaveBeenCalledWith("p1", "COMPLETED"));
});
it("marks notifications read and hides unsupported target links", async () => {
  vi.spyOn(endpoints, "notifications").mockResolvedValue([
    { id: "n1", title: "Report due", targetType: "PLACEMENT", targetId: "p1" },
    {
      id: "n2",
      title: "Old",
      targetType: "UNKNOWN",
      targetId: "x",
      readAt: "2026-01-01",
    },
  ]);
  const read = vi
    .spyOn(endpoints, "markRead")
    .mockResolvedValue({ updated: 1 });
  mount(<NotificationsPage />);
  fireEvent.click(await screen.findByText("Mark read"));
  await waitFor(() =>
    expect(read).toHaveBeenCalledWith("n1", expect.anything()),
  );
  expect(screen.getByRole("link", { name: "Open record" })).toHaveAttribute(
    "href",
    "/placements/p1",
  );
});
const report: Report = {
  id: "r1",
  placementId: "p1",
  reportingPeriodId: "period",
  state: "REVISION_REQUESTED",
  currentVersionNo: 1,
  versions: [
    {
      id: "v1",
      versionNo: 1,
      accomplishments: "Old",
      challenges: "Challenge",
      nextWeekPlan: "Plan",
      submittedAt: "2026-09-18",
      attachmentDocumentIds: ["d1"],
    },
  ],
  reviews: [
    {
      outcome: "REVISION_REQUESTED",
      feedback: "Add numbers",
      reviewedAt: "2026-09-18",
    },
  ],
};
it("preserves attachments when a student revises a submitted report", async () => {
  vi.spyOn(endpoints, "report").mockResolvedValue(report);
  const save = vi.spyOn(endpoints, "patchReport").mockResolvedValue(report);
  vi.spyOn(endpoints, "submitReport").mockResolvedValue({
    ...report,
    state: "SUBMITTED",
  });
  mount(<ReportDetailPage />, "/reports/r1", "/reports/:reportId");
  fireEvent.change(await screen.findByLabelText("Accomplishments"), {
    target: { value: "12 tests" },
  });
  fireEvent.click(screen.getByText("Save draft"));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith("r1", {
      accomplishments: "12 tests",
      challenges: "Challenge",
      nextWeekPlan: "Plan",
      attachmentDocumentIds: ["d1"],
    }),
  );
  expect(await screen.findByText("Draft saved.")).toBeVisible();
});
it("submits actual reviewer feedback and shows stale-review conflicts", async () => {
  session.activeRole = "SUPERVISOR";
  vi.spyOn(endpoints, "report").mockResolvedValue({
    ...report,
    state: "SUBMITTED",
  });
  const review = vi
    .spyOn(endpoints, "reviewReport")
    .mockRejectedValue(new Error("Already reviewed"));
  mount(<ReportDetailPage />, "/reports/r1", "/reports/:reportId");
  fireEvent.change(await screen.findByLabelText("Review feedback"), {
    target: { value: "More detail" },
  });
  fireEvent.click(screen.getByText("Request revision"));
  await waitFor(() =>
    expect(review).toHaveBeenCalledWith("r1", {
      reportVersionId: "v1",
      outcome: "REVISION_REQUESTED",
      feedback: "More detail",
    }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Already reviewed",
  );
  expect(screen.queryByText("Save draft")).not.toBeInTheDocument();
});
it("blocks application submission without an available CV", async () => {
  vi.spyOn(endpoints, "documents").mockResolvedValue({ items: [] });
  mount(<ApplyPage />, "/postings/p1/apply", "/postings/:postingId/apply");
  expect(await screen.findByText("Submit application")).toBeDisabled();
});
it("sends the application snapshot and displays a rejected submission", async () => {
  vi.spyOn(endpoints, "documents").mockResolvedValue({
    items: [{ id: "d1", originalName: "cv.pdf", state: "AVAILABLE" }] as any,
  });
  const apply = vi
    .spyOn(endpoints, "apply")
    .mockRejectedValue(new Error("Deadline passed"));
  mount(<ApplyPage />, "/postings/p1/apply", "/postings/:postingId/apply");
  await screen.findByText("Submit application");
  for (const [label, value] of Object.entries({
    "Contact name": "Student",
    "Contact email": "s@example.test",
    University: "University",
    Major: "CS",
    Availability: "Now",
    "Cover note": "Ready",
  }))
    fireEvent.change(screen.getByLabelText(new RegExp(label)), {
      target: { value },
    });
  fireEvent.change(screen.getByLabelText(/^CV/), { target: { value: "d1" } });
  fireEvent.click(screen.getByText("Submit application"));
  expect(await screen.findByText("Deadline passed")).toBeVisible();
  expect(apply).toHaveBeenCalledWith(
    expect.objectContaining({ postingId: "p1", cvDocumentId: "d1" }),
    expect.anything(),
  );
});
it("shows empty and populated application lists", async () => {
  vi.spyOn(endpoints, "applications").mockResolvedValue([]);
  mount(<ApplicationsPage />);
  expect(await screen.findByText("No applications found.")).toBeVisible();
  cleanup();
  vi.mocked(endpoints.applications).mockResolvedValue([
    { id: "a1", status: "SUBMITTED", submittedAt: "2026-09-18" },
  ] as any);
  mount(<ApplicationsPage />);
  expect(await screen.findByRole("link", { name: "Open" })).toHaveAttribute(
    "href",
    "/applications/a1",
  );
});
it("saves a self-assessment and renders evaluation read-only for the student", async () => {
  vi.spyOn(endpoints, "selfAssessment").mockRejectedValue(
    new ApiError(404, "Absent"),
  );
  const save = vi.spyOn(endpoints, "putSelfAssessment").mockResolvedValue({});
  mount(<AssessmentPage kind="self" />);
  fireEvent.change(await screen.findByLabelText(/Reflection/), {
    target: { value: "Learned" },
  });
  fireEvent.change(screen.getByLabelText(/Learning outcomes/), {
    target: { value: "Tests" },
  });
  fireEvent.click(screen.getByText("Submit"));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ status: "SUBMITTED", reflection: "Learned" }),
    ),
  );
  expect(await screen.findByText("Assessment saved.")).toBeVisible();
  cleanup();
  vi.spyOn(endpoints, "performanceEvaluation").mockResolvedValue({
    status: "SUBMITTED",
    completionDecision: "PASSED",
  });
  mount(<AssessmentPage kind="performance" />);
  expect(await screen.findByLabelText(/Completion decision/)).toBeDisabled();
  expect(screen.queryByText("Submit")).not.toBeInTheDocument();
});
it("creates drafts with a company selection and reports API validation errors", async () => {
  session.activeRole = "COMPANY_STAFF";
  vi.spyOn(endpoints, "companies").mockResolvedValue([
    { id: "c1", name: "Company" },
  ]);
  const create = vi
    .spyOn(endpoints, "createPosting")
    .mockRejectedValue(new Error("Invalid deadline"));
  mount(<NewPosting />);
  await screen.findByRole("option", { name: "Company" });
  for (const [label, value] of Object.entries({
    Title: "Intern",
    "Duration weeks": "12",
    Openings: "1",
    Deadline: "2099-12-31",
    Description: "Role",
    "Required skills": "TypeScript",
  }))
    fireEvent.change(screen.getByLabelText(new RegExp(label)), {
      target: { value },
    });
  fireEvent.change(screen.getByLabelText(/^Company/), {
    target: { value: "c1" },
  });
  fireEvent.click(screen.getByText("Create draft"));
  expect(await screen.findByText("Invalid deadline")).toBeVisible();
  expect(create).toHaveBeenCalledWith(
    expect.objectContaining({
      companyId: "c1",
      skills: [{ name: "TypeScript", importance: "REQUIRED" }],
    }),
    expect.anything(),
  );
});
it("publishes drafts and saves open opportunities with visible failures", async () => {
  const posting = { id: "p1", status: "DRAFT" } as any;
  session.activeRole = "COMPANY_STAFF";
  const publish = vi
    .spyOn(endpoints, "publish")
    .mockRejectedValue(new ApiError(400, "Missing fields"));
  mount(<PostingActions posting={posting} />);
  fireEvent.click(screen.getByText("Publish"));
  expect(await screen.findByRole("alert")).toHaveTextContent("Missing fields");
  expect(publish).toHaveBeenCalledWith("p1");
  cleanup();
  session.activeRole = "STUDENT";
  vi.spyOn(endpoints, "savePosting").mockResolvedValue({ saved: true });
  mount(<PostingActions posting={{ ...posting, status: "OPEN" }} />);
  fireEvent.click(screen.getByText("Save opportunity"));
  expect(await screen.findByText("Saved")).toBeDisabled();
});
it("renders posting details with matching evidence and handles missing records", async () => {
  vi.spyOn(endpoints, "posting").mockResolvedValue({
    id: "p1",
    title: "Intern",
    description: "Role",
    workArrangement: "REMOTE",
    skills: [],
    status: "OPEN",
    match: { score: 0, matchedSkills: [], missingSkills: ["TypeScript"] },
  } as any);
  mount(<PostingDetail />, "/postings/p1", "/postings/:postingId");
  expect(await screen.findByText("Missing: TypeScript")).toBeVisible();
  fireEvent.click(screen.getByText("Apply"));
  expect(await screen.findByText("Destination")).toBeVisible();
  cleanup();
  vi.mocked(endpoints.posting).mockRejectedValue(
    new ApiError(404, "Not found"),
  );
  mount(<PostingDetail />, "/postings/p1", "/postings/:postingId");
  expect(await screen.findByRole("alert")).toHaveTextContent("Not found");
});
it('loads and saves profile preferences and surfaces a retained-document deletion error',async()=>{
 vi.spyOn(endpoints,'profile').mockResolvedValue({university:'University',major:'CS'} as any);
 vi.spyOn(endpoints,'skills').mockResolvedValue([{name:'TypeScript',proficiency:'ADVANCED'}]);
 vi.spyOn(endpoints,'preferences').mockResolvedValue({industries:[],locations:[],workArrangements:[]});
 vi.spyOn(endpoints,'documents').mockResolvedValue({items:[{id:'d1',originalName:'cv.pdf',state:'AVAILABLE'}] as any});
 const update=vi.spyOn(endpoints,'updateProfile').mockResolvedValue({} as any);const prefs=vi.spyOn(endpoints,'setPreferences').mockResolvedValue({industries:['Tech'],locations:[],workArrangements:[]});vi.spyOn(endpoints,'deleteDocument').mockRejectedValue(new ApiError(409,'Document is retained'));
 mount(<ProfilePage/>);fireEvent.change(await screen.findByLabelText('Industries (comma separated)'),{target:{value:'Tech'}});fireEvent.change(screen.getByLabelText('Graduation year'),{target:{value:'2027'}});fireEvent.click(screen.getByText('Save profile'));expect(await screen.findByText('Profile saved.')).toBeVisible();expect(update).toHaveBeenCalledWith(expect.objectContaining({graduationYear:2027}));expect(prefs).toHaveBeenCalledWith(expect.objectContaining({industries:['Tech']}));fireEvent.click(screen.getByText('Delete'));expect(await screen.findByRole('alert')).toHaveTextContent('Document is retained');
 fireEvent.change(screen.getByLabelText('Upload document'),{target:{files:[new File(['bad'],'bad.exe',{type:'application/octet-stream'})]}});await waitFor(()=>expect(screen.getAllByRole('alert')).toHaveLength(2));
});
it('shows a profile fetch failure before exposing editable fields',async()=>{
 vi.spyOn(endpoints,'profile').mockRejectedValue(new ApiError(403,'Denied'));vi.spyOn(endpoints,'skills').mockResolvedValue([]);vi.spyOn(endpoints,'preferences').mockResolvedValue({industries:[],locations:[],workArrangements:[]});vi.spyOn(endpoints,'documents').mockResolvedValue({items:[]});mount(<ProfilePage/>);expect(await screen.findByRole('alert')).toHaveTextContent('Denied');expect(screen.queryByText('Save profile')).not.toBeInTheDocument();
});
it('opens the acceptance form and surfaces conflicting acceptance without navigating',async()=>{
 session.activeRole='COMPANY_STAFF';vi.spyOn(endpoints,'application').mockResolvedValue({id:'a1',status:'INTERVIEW',history:[{toStatus:'INTERVIEW',changedAt:'2026-09-18'}],contactName:'Student',contactEmail:'s@example.test',coverNote:'Ready'} as any);vi.spyOn(endpoints,'supervisors').mockResolvedValue({items:[{id:'u1',fullName:'Supervisor'}]});const accept=vi.spyOn(endpoints,'accept').mockRejectedValue(new ApiError(409,'Already accepted with different dates'));mount(<ApplicationPage/>,'/applications/a1','/applications/:applicationId');fireEvent.click(await screen.findByText('Accept and create placement'));await screen.findByRole('option',{name:'Supervisor'});fireEvent.change(screen.getByLabelText(/Start date/),{target:{value:'2026-09-14'}});fireEvent.change(screen.getByLabelText(/End date/),{target:{value:'2026-12-31'}});fireEvent.change(screen.getByLabelText('Note'),{target:{value:'Approved'}});fireEvent.click(screen.getByRole('button',{name:'Accept'}));expect(await screen.findByRole('alert')).toHaveTextContent('Already accepted');expect(accept).toHaveBeenCalledWith('a1',{targetStatus:'ACCEPTED',supervisorUserId:'u1',startDate:'2026-09-14',endDate:'2026-12-31',note:'Approved'});
});
it('offers role-specific review transitions and withdrawal while retaining terminal history',async()=>{
 session.activeRole='COMPANY_STAFF';const transition=vi.spyOn(endpoints,'transition').mockResolvedValue({} as any);mount(<ApplicationActions application={{id:'a1',status:'UNDER_REVIEW'} as any}/>);fireEvent.click(screen.getByText('Move to interview'));await waitFor(()=>expect(transition).toHaveBeenCalledWith('a1','INTERVIEW'));fireEvent.click(screen.getByText('Reject'));await waitFor(()=>expect(transition).toHaveBeenCalledWith('a1','REJECTED'));cleanup();session.activeRole='STUDENT';const withdraw=vi.spyOn(endpoints,'withdraw').mockRejectedValue(new ApiError(409,'Application changed'));mount(<ApplicationActions application={{id:'a1',status:'SUBMITTED'} as any}/>);fireEvent.click(screen.getByText('Withdraw'));expect(await screen.findByRole('alert')).toHaveTextContent('Application changed');expect(withdraw).toHaveBeenCalledWith('a1');cleanup();mount(<ApplicationActions application={{id:'a1',status:'ACCEPTED'} as any}/>);expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
it('shows report periods with existing history and creates a draft for an unstarted period',async()=>{
 vi.spyOn(endpoints,'periods').mockResolvedValue([{id:'period',weekStart:'2026-09-14',weekEnd:'2026-09-20',dueAt:'2026-09-21'},{id:'next',weekStart:'2026-09-21',weekEnd:'2026-09-27',dueAt:'2026-09-28'}]);vi.spyOn(endpoints,'reports').mockResolvedValue([report]);mount(<ReportsPage/>,'/placements/p1/reports','/placements/:placementId/reports/*');expect(await screen.findByRole('link',{name:'Open'})).toHaveAttribute('href','/reports/r1');fireEvent.click(screen.getByText('Start'));await screen.findByText('New weekly report');const create=vi.spyOn(endpoints,'createReport').mockResolvedValue({...report,id:'r2'});for(const label of ['Accomplishments','Challenges','Next-week plan'])fireEvent.change(screen.getByLabelText(new RegExp(label)),{target:{value:label}});fireEvent.click(screen.getByText('Save draft'));await waitFor(()=>expect(create).toHaveBeenCalledWith('p1',expect.objectContaining({reportingPeriodId:'next',attachmentDocumentIds:[]})));expect(await screen.findByText('Destination')).toBeVisible();
});
it('renders monitoring deadlines and events from the requested scope',async()=>{
 const monitor=vi.spyOn(endpoints,'monitoring').mockResolvedValue({applications:{SUBMITTED:2},placements:{ACTIVE:1},reports:{SUBMITTED:3},deadlines:[{kind:'REPORT',dueAt:'2026-09-21'}],recentActivity:[{type:'TASK_CREATED',occurredAt:'2026-09-18'}]});mount(<MonitoringPage/>,'/monitoring?programId=program','/monitoring');expect(await screen.findByText('TASK_CREATED')).toBeVisible();expect(screen.getByText('REPORT')).toBeVisible();expect(monitor).toHaveBeenCalledWith('programId=program');
});
it('advances and returns through server-backed posting pages',async()=>{
 session.activeRole='COMPANY_STAFF';const postings=Array.from({length:20},(_,i)=>({id:`p${i}`,title:`Role ${i}`,status:'DRAFT',applicationDeadline:'2099-12-31'}));const list=vi.spyOn(endpoints,'postings').mockResolvedValue(postings as any);mount(<PostingsPage/>);fireEvent.click(await screen.findByRole('button',{name:'Next page'}));await waitFor(()=>expect(list).toHaveBeenCalledWith({page:2}));fireEvent.click(await screen.findByText('Previous page'));await waitFor(()=>expect(screen.getByText('Page 1')).toBeVisible());
});
