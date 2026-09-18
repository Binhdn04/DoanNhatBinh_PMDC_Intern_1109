import { endpoints } from "@/lib/api";
import { Card, PageHeader, Timeline } from "@/shared/ui";
import { useLocation } from "react-router-dom";
import { ErrorMessage, formatDate, Loading, sum, useData } from "./view";
export function MonitoringPage() {
  const location = useLocation();
  const query = useData(["monitoring", location.search], () =>
    endpoints.monitoring(location.search.slice(1)),
  );
  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorMessage error={query.error} />;
  const data = query.data!;
  return (
    <>
      <PageHeader
        title="Monitoring"
        description="Read-only program and term overview."
      />
      <div className="grid three">
        <Metric label="Applications" value={sum(data.applications)} />
        <Metric label="Placements" value={sum(data.placements)} />
        <Metric label="Reports" value={sum(data.reports)} />
      </div>
      <Card style={{ marginTop: 20 }}>
        <h2 className="section-title">Upcoming deadlines</h2>
        <Timeline
          items={
            Array.isArray(data.deadlines)
              ? (data.deadlines as Array<{ kind: string; dueAt: string }>).map(
                  (item) => ({
                    title: item.kind,
                    meta: formatDate(item.dueAt),
                  }),
                )
              : []
          }
        />
      </Card>
      <Card style={{ marginTop: 20 }}>
        <h2 className="section-title">Recent activity</h2>
        <Timeline
          items={
            Array.isArray(data.recentActivity)
              ? (
                  data.recentActivity as Array<{
                    type: string;
                    occurredAt: string;
                  }>
                ).map((item) => ({
                  title: item.type,
                  meta: formatDate(item.occurredAt),
                }))
              : []
          }
        />
      </Card>
    </>
  );
}
export function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </Card>
  );
}
