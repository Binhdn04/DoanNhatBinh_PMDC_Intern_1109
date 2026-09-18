import { endpoints } from "@/lib/api";
import { Button, Card, Field, PageHeader, Status, TextArea } from "@/shared/ui";
import { useMutation } from "@tanstack/react-query";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useSession } from "../app/session";
import { ErrorMessage, formatDate, Loading, tone, useData } from "./view";
export function ReportsPage() {
  const { placementId = "" } = useParams();
  const { activeRole } = useSession();
  const periods = useData(["periods", placementId], () =>
    endpoints.periods(placementId),
  );
  const reports = useData(["reports", placementId], () =>
    endpoints.reports(placementId),
  );
  const navigate = useNavigate();
  if (periods.isLoading || reports.isLoading) return <Loading />;
  if (periods.error || reports.error)
    return <ErrorMessage error={periods.error ?? reports.error} />;
  const byPeriod = new Map(
    reports.data!.map((report) => [report.reportingPeriodId, report]),
  );
  return (
    <>
      <PageHeader
        title="Weekly reports"
        description="Available when opened with an authorized placement ID."
      />
      <Card>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Due</th>
                <th>State</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {periods.data!.map((period) => {
                const report = byPeriod.get(period.id);
                return (
                  <tr key={period.id}>
                    <td>
                      {period.weekStart} — {period.weekEnd}
                    </td>
                    <td>{formatDate(period.dueAt)}</td>
                    <td>
                      <Status tone={tone(report?.state ?? "DRAFT")}>
                        {report?.state ?? "NOT STARTED"}
                      </Status>
                    </td>
                    <td>
                      {report ? (
                        <Link to={`/reports/${report.id}`}>Open</Link>
                      ) : activeRole === "STUDENT" ? (
                        <Button
                          variant="ghost"
                          onClick={() =>
                            navigate(
                              `/placements/${placementId}/reports/new?period=${period.id}`,
                            )
                          }
                        >
                          Start
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Routes>
        <Route
          path="new"
          element={<ReportEditor placementId={placementId} />}
        />
      </Routes>
    </>
  );
}
export function ReportEditor({ placementId }: { placementId: string }) {
  const navigate = useNavigate();
  const period = new URLSearchParams(useLocation().search).get("period") ?? "";
  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      endpoints.createReport(placementId, body),
    onSuccess: (report) => navigate(`/reports/${report.id}`),
  });
  return (
    <Card style={{ marginTop: 20 }}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          create.mutate({
            reportingPeriodId: period,
            accomplishments: String(data.get("accomplishments")),
            challenges: String(data.get("challenges")),
            nextWeekPlan: String(data.get("nextWeekPlan")),
            attachmentDocumentIds: [],
          });
        }}
      >
        <h2 className="section-title">New weekly report</h2>
        <Field label="Accomplishments" required>
          <TextArea name="accomplishments" required />
        </Field>
        <Field label="Challenges" required>
          <TextArea name="challenges" required />
        </Field>
        <Field label="Next-week plan" required>
          <TextArea name="nextWeekPlan" required />
        </Field>
        {create.error && <ErrorMessage error={create.error} />}
        <Button type="submit" disabled={create.isPending}>
          Save draft
        </Button>
      </form>
    </Card>
  );
}
