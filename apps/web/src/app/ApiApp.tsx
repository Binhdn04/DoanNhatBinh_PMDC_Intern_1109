import { type ApiRole } from "@/lib/api";
import {
  Button,
  Card,
  EmptyState,
  Field,
  PageHeader,
  TextInput,
} from "@/shared/ui";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ApplicationPage,
  ApplicationsPage,
  ApplyPage,
} from "../features/applications";
import { AssessmentPage } from "../features/assessment";
import { MonitoringPage } from "../features/monitoring";
import {
  NotificationsPage,
  PlacementPage,
  PlacementsPage,
} from "../features/placements";
import {
  DiscoverPage,
  NewPosting,
  PostingDetail,
  PostingsPage,
} from "../features/postings";
import { ProfilePage } from "../features/profile";
import { ReportsPage } from "../features/report-list";
import { ReportDetailPage } from "../features/reports";
import { Loading } from "../features/view";
import { useSession } from "./session";

const labels: Record<ApiRole, string> = {
  STUDENT: "Student",
  COMPANY_STAFF: "Company Staff",
  SUPERVISOR: "Supervisor",
  ADMIN: "Admin",
};
const rolePath: Record<ApiRole, string> = {
  STUDENT: "/discover",
  COMPANY_STAFF: "/postings",
  SUPERVISOR: "/placements",
  ADMIN: "/monitoring",
};
const enabled = {
  profile: true,
  documents: true,
  discover: true,
  postings: true,
  applications: true,
  reports: true,
  assessments: true,
  monitoring: true,
  ai: false,
} as const;
function RequireRole({
  roles,
  children,
}: {
  roles?: ApiRole[];
  children?: ReactNode;
}) {
  const session = useSession();
  const location = useLocation();
  if (!session.ready) return <Loading />;
  if (!session.accessToken)
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  if (roles && !roles.includes(session.activeRole))
    return <Navigate to="/unavailable" replace />;
  return <>{children ?? <Outlet />}</>;
}

function Login() {
  const { accessToken, signIn } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (accessToken) return <Navigate to="/" replace />;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await signIn(String(data.get("email")), String(data.get("password")));
      navigate(new URLSearchParams(location.search).get("returnTo") || "/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Đăng nhập thất bại");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="content" style={{ maxWidth: 520 }}>
      <PageHeader
        title="Welcome to InternHub"
        description="Sign in to access your authorized internship workspace."
      />
      <Card>
        <form onSubmit={submit}>
          <Field label="Email" required>
            <TextInput
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </Field>
          <Field label="Password" required>
            <TextInput
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </Field>
          {error && (
            <p className="notice" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </main>
  );
}

function Shell() {
  const { activeRole, user, changeRole, signOut } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const roleLinks =
    activeRole === "STUDENT"
      ? [
          ["/discover", "Discover"],
          ["/applications", "Applications"],
          ["/profile", "Profile"],
        ]
      : activeRole === "COMPANY_STAFF"
        ? [
            ["/postings", "Postings"],
            ["/applications", "Applications"],
          ]
        : activeRole === "ADMIN"
          ? [
              ["/monitoring", "Monitoring"],
              ["/postings", "Postings"],
              ["/applications", "Applications"],
            ]
          : [];
  const links = [
    ...roleLinks,
    ["/placements", "Placements"],
    ["/notifications", "Notifications"],
  ];
  return (
    <div className="app">
      <header className="topbar">
        <div className="header-inner">
          <Link className="brand" to="/">
            <span>✦</span>InternHub
          </Link>
          <nav className="header-nav" aria-label="Primary navigation">
            {links.map(([to, label]) => (
              <Link
                key={to}
                className={`nav-link ${
                  location.pathname.startsWith(to) ? "active" : ""
                }`}
                to={to}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <label className="role-switch">
              <span className="sr-only">Active role</span>
              <select
                value={activeRole}
                onChange={async (event) => {
                  await changeRole(event.target.value as ApiRole);
                  navigate(rolePath[event.target.value as ApiRole]);
                }}
              >
                {user.roles.map((role) => (
                  <option key={role} value={role}>
                    {labels[role]}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="account-button"
              aria-label="Sign out"
              onClick={() => void signOut()}
            >
              {user.fullName.slice(0, 2).toUpperCase()} ⌄
            </button>
          </div>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

function Unavailable() {
  return (
    <EmptyState
      title="Feature not available"
      text="This workflow is deferred because the running API does not currently expose the required endpoint."
      action={
        <Link className="button primary" to="/">
          Return home
        </Link>
      }
    />
  );
}
function Home() {
  const { activeRole } = useSession();
  return <Navigate to={rolePath[activeRole]} replace />;
}

export default function ApiApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireRole />}>
        <Route element={<Shell />}>
          <Route index element={<Home />} />
          <Route
            path="discover"
            element={
              <RequireRole roles={["STUDENT"]}>
                <DiscoverPage />
              </RequireRole>
            }
          />
          <Route
            path="profile"
            element={
              <RequireRole roles={["STUDENT"]}>
                <ProfilePage />
              </RequireRole>
            }
          />
          <Route
            path="postings"
            element={
              <RequireRole roles={["COMPANY_STAFF", "ADMIN"]}>
                <PostingsPage />
              </RequireRole>
            }
          />
          <Route
            path="postings/new"
            element={
              <RequireRole roles={["COMPANY_STAFF", "ADMIN"]}>
                <NewPosting />
              </RequireRole>
            }
          />
          <Route path="postings/:postingId" element={<PostingDetail />} />
          <Route
            path="postings/:postingId/apply"
            element={
              <RequireRole roles={["STUDENT"]}>
                <ApplyPage />
              </RequireRole>
            }
          />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route
            path="applications/:applicationId"
            element={<ApplicationPage />}
          />
          <Route
            path="placements/:placementId/reports/*"
            element={<ReportsPage />}
          />
          <Route path="reports/:reportId" element={<ReportDetailPage />} />
          <Route path="placements" element={<PlacementsPage />} />
          <Route path="placements/:placementId" element={<PlacementPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route
            path="placements/:placementId/self-assessment"
            element={
              <RequireRole roles={["STUDENT"]}>
                <AssessmentPage kind="self" />
              </RequireRole>
            }
          />
          <Route
            path="placements/:placementId/performance-evaluation"
            element={
              <RequireRole roles={["SUPERVISOR", "ADMIN"]}>
                <AssessmentPage kind="performance" />
              </RequireRole>
            }
          />
          <Route
            path="monitoring"
            element={
              <RequireRole roles={["ADMIN"]}>
                <MonitoringPage />
              </RequireRole>
            }
          />
          <Route path="unavailable" element={<Unavailable />} />
          <Route path="*" element={<Unavailable />} />
        </Route>
      </Route>
    </Routes>
  );
}

export { numberValue, split, sum, tone, validateFile } from "../features/view";
