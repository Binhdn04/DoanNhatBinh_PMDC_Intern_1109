import { Pagination } from "./pagination";
import { endpoints } from "@/lib/api";
import {
  Button,
  Card,
  Field,
  PageHeader,
  SelectInput,
  TextArea,
  TextInput,
} from "@/shared/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useSession } from "../app/session";
export function PlacementsPage() {
  const [page, setPage] = useState(1);
  const rows = useQuery({
    queryKey: ["placements", page],
    queryFn: () => endpoints.placements(page),
  });
  return (
    <>
      <PageHeader
        title="Placements"
        description="Your authorized internship placements"
      />
      {rows.isLoading && <p>Loading…</p>}
      {rows.error && <p role="alert">{rows.error.message}</p>}
      {rows.data?.map((row) => (
        <Card key={row.id}>
          <Link to={`/placements/${row.id}`}>
            Placement {row.startDate} – {row.endDate}
          </Link>
          <p>{row.status}</p>
        </Card>
      ))}
      {rows.data?.length === 0 && <p>No placements yet.</p>}
      <Pagination
        page={page}
        count={rows.data?.length ?? 0}
        busy={rows.isFetching}
        onChange={setPage}
      />
    </>
  );
}
export function PlacementPage() {
  const { placementId = "" } = useParams();
  const { activeRole } = useSession();
  const client = useQueryClient();
  const row = useQuery({
    queryKey: ["placement", placementId],
    queryFn: () => endpoints.placement(placementId),
  });
  const [taskPage, setTaskPage] = useState(1);
  const tasks = useQuery({
    queryKey: ["tasks", placementId, taskPage],
    queryFn: () => endpoints.tasks(placementId, taskPage),
  });
  const refresh = () =>
    client.invalidateQueries({ queryKey: ["tasks", placementId] });
  const add = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      endpoints.createTask(placementId, body),
    onSuccess: refresh,
  });
  const change = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      endpoints.taskStatus(placementId, id, status),
    onSuccess: refresh,
  });
  const end = useMutation({
    mutationFn: (status: string) =>
      endpoints.placementLifecycle(placementId, status),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["placement", placementId] }),
  });
  const [showTask, setShowTask] = useState(false);
  const supervisor = ["SUPERVISOR", "ADMIN"].includes(activeRole);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    add.mutate({
      title: data.get("title"),
      description: data.get("description"),
      priority: data.get("priority"),
      dueDate: data.get("dueDate") || undefined,
    });
  };
  if (row.isLoading) return <p>Loading…</p>;
  if (row.error) return <p role="alert">{row.error.message}</p>;
  return (
    <>
      <PageHeader
        title="Placement"
        description={`${row.data?.startDate} – ${row.data?.endDate} · ${row.data?.status}`}
      />
      <nav className="form-actions">
        <Link to={`/placements/${placementId}/reports`}>Weekly reports</Link>
        {activeRole === "STUDENT" && (
          <Link to={`/placements/${placementId}/self-assessment`}>
            Self-assessment
          </Link>
        )}
        {(supervisor || activeRole === "STUDENT") && (
          <Link to={`/placements/${placementId}/performance-evaluation`}>
            Performance evaluation
          </Link>
        )}
      </nav>
      <Card>
        <h2>Tasks</h2>
        {tasks.error && <p role="alert">{tasks.error.message}</p>}
        {tasks.data?.map((task) => (
          <article key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>
              {task.priority} · {task.dueDate ?? "No due date"}
            </p>
            {activeRole === "STUDENT" && row.data?.status === "ACTIVE" ? (
              <SelectInput
                aria-label={`Status for ${task.title}`}
                value={task.status}
                disabled={change.isPending}
                onChange={(event) =>
                  change.mutate({ id: task.id, status: event.target.value })
                }
              >
                <option>TODO</option>
                <option>IN_PROGRESS</option>
                <option>DONE</option>
              </SelectInput>
            ) : (
              <p>{task.status}</p>
            )}
          </article>
        ))}
        <Pagination
          page={taskPage}
          count={tasks.data?.length ?? 0}
          busy={tasks.isFetching}
          onChange={setTaskPage}
        />
        {supervisor && row.data?.status === "ACTIVE" && (
          <>
            <Button onClick={() => setShowTask(!showTask)}>Assign task</Button>
            {showTask && (
              <form onSubmit={submit}>
                <Field label="Title">
                  <TextInput name="title" required />
                </Field>
                <Field label="Description">
                  <TextArea name="description" required />
                </Field>
                <Field label="Priority">
                  <SelectInput name="priority">
                    <option>MEDIUM</option>
                    <option>LOW</option>
                    <option>HIGH</option>
                  </SelectInput>
                </Field>
                <Field label="Due date">
                  <TextInput name="dueDate" type="date" />
                </Field>
                <Button type="submit" disabled={add.isPending}>
                  Create task
                </Button>
                {add.isSuccess && <p>Task created.</p>}
              </form>
            )}
            <div className="form-actions">
              <Button
                onClick={() => end.mutate("COMPLETED")}
                disabled={end.isPending}
              >
                Complete placement
              </Button>
              <Button
                variant="danger"
                onClick={() => end.mutate("TERMINATED")}
                disabled={end.isPending}
              >
                Terminate placement
              </Button>
            </div>
          </>
        )}
        {[add.error, change.error, end.error]
          .filter(Boolean)
          .map((error, i) => (
            <p key={i} role="alert">
              {error?.message}
            </p>
          ))}
      </Card>
    </>
  );
}
export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const client = useQueryClient();
  const rows = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => endpoints.notifications(page),
  });
  const read = useMutation({
    mutationFn: endpoints.markRead,
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const prefix: Record<string, string> = {
    PLACEMENT: "placements",
    POSTING: "postings",
    APPLICATION: "applications",
    REPORT: "reports",
  };
  return (
    <>
      <PageHeader title="Notifications" />
      {rows.error && <p role="alert">{rows.error.message}</p>}
      {rows.data?.map((row) => (
        <Card key={row.id}>
          <p>{row.title}</p>
          {prefix[row.targetType] && (
            <Link to={`/${prefix[row.targetType]}/${row.targetId}`}>
              Open record
            </Link>
          )}
          {!row.readAt && (
            <Button
              disabled={read.isPending}
              onClick={() => read.mutate(row.id)}
            >
              Mark read
            </Button>
          )}
        </Card>
      ))}
      {read.error && <p role="alert">{read.error.message}</p>}
      {rows.data?.length === 0 && <p>No notifications.</p>}
      <Pagination
        page={page}
        count={rows.data?.length ?? 0}
        busy={rows.isFetching}
        onChange={setPage}
      />
    </>
  );
}
