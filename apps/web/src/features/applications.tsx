import { DocumentDownload } from "./document-download";
import { Pagination } from "./pagination";
import { endpoints, type Application } from "@/lib/api";
import {
  Button,
  Card,
  Field,
  Modal,
  PageHeader,
  SelectInput,
  Status,
  TextArea,
  TextInput,
  Timeline,
} from "@/shared/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSession } from "../app/session";
import { ErrorMessage, formatDate, Loading, tone, useData } from "./view";
export function ApplyPage() {
  const { postingId = "" } = useParams();
  const navigate = useNavigate();
  const documents = useData(["documents"], endpoints.documents);
  const [error, setError] = useState("");
  const submit = useMutation({
    mutationFn: endpoints.apply,
    onSuccess: (application) => navigate(`/applications/${application.id}`),
    onError: (reason) =>
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to submit application",
      ),
  });
  if (documents.isLoading) return <Loading />;
  if (documents.error) return <ErrorMessage error={documents.error} />;
  const available = documents.data!.items.filter(
    (document) => document.state === "AVAILABLE",
  );
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    submit.mutate({
      postingId,
      contactName: String(data.get("contactName")),
      contactEmail: String(data.get("contactEmail")),
      university: String(data.get("university")),
      major: String(data.get("major")),
      availability: String(data.get("availability")),
      coverNote: String(data.get("coverNote")),
      cvDocumentId: String(data.get("cvDocumentId")),
      supportingDocumentIds: data.getAll("supportingDocumentIds"),
    });
  };
  return (
    <>
      <PageHeader
        title="Apply to opportunity"
        description="A CV and complete profile snapshot are required."
      />
      <Card>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <Field label="Contact name" required>
              <TextInput name="contactName" required />
            </Field>
            <Field label="Contact email" required>
              <TextInput name="contactEmail" type="email" required />
            </Field>
            <Field label="University" required>
              <TextInput name="university" required />
            </Field>
            <Field label="Major" required>
              <TextInput name="major" required />
            </Field>
            <Field label="Availability" required>
              <TextInput name="availability" required />
            </Field>
            <Field label="CV" required>
              <SelectInput name="cvDocumentId" required defaultValue="">
                <option value="" disabled>
                  Select an uploaded document
                </option>
                {available.map((document) => (
                  <option value={document.id} key={document.id}>
                    {document.originalName}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
          <Field label="Cover note" required>
            <TextArea name="coverNote" required />
          </Field>
          {error && <p className="notice">{error}</p>}
          <Button
            type="submit"
            disabled={submit.isPending || !available.length}
          >
            {submit.isPending ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      </Card>
    </>
  );
}
export function ApplicationsPage() {
  const { activeRole } = useSession();
  const [page, setPage] = useState(1);
  const query = useData(["applications", activeRole, String(page)], () =>
    endpoints.applications(page),
  );
  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorMessage error={query.error} />;
  return (
    <>
      <PageHeader
        title={activeRole === "STUDENT" ? "My applications" : "Applications"}
        description="Track applications and their review history."
      />
      <Card>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Submitted</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {query.data!.map((application) => (
                <tr key={application.id}>
                  <td>
                    <strong>{application.id.slice(0, 8)}</strong>
                  </td>
                  <td>
                    <Status tone={tone(application.status)}>
                      {application.status}
                    </Status>
                  </td>
                  <td>{formatDate(application.submittedAt)}</td>
                  <td>
                    <Link to={`/applications/${application.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          count={query.data!.length}
          busy={query.isFetching}
          onChange={setPage}
        />
        {!query.data!.length && (
          <p className="subtle">No applications found.</p>
        )}
      </Card>
    </>
  );
}
export function ApplicationPage() {
  const { applicationId = "" } = useParams();
  const { activeRole } = useSession();
  const query = useData(["application", applicationId, activeRole], () =>
    endpoints.application(applicationId),
  );
  const [accepting, setAccepting] = useState(false);
  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorMessage error={query.error} />;
  const application = query.data!;
  return (
    <>
      <PageHeader
        title="Application detail"
        description={`Status: ${application.status}`}
      />
      <div className="grid two">
        <Card>
          <h2 className="section-title">Submitted application</h2>
          {application.cvDocumentId && (
            <DocumentDownload
              id={application.cvDocumentId}
              name="application-cv"
              label="Download CV"
            />
          )}
          <p>
            <strong>{application.contactName}</strong>
            <br />
            {application.contactEmail}
            <br />
            {application.university} · {application.major}
          </p>
          <p>{application.coverNote}</p>
          <h2 className="section-title">Status history</h2>
          <Timeline
            items={(application.history ?? []).map((item) => ({
              title: item.toStatus,
              meta: `${item.actorUserId} · ${formatDate(item.changedAt)}`,
              note: item.note,
            }))}
          />
        </Card>
        <Card>
          <Status tone={tone(application.status)}>{application.status}</Status>
          {["COMPANY_STAFF", "ADMIN"].includes(activeRole) &&
            application.status === "INTERVIEW" && (
              <div style={{ marginTop: 16 }}>
                <Button onClick={() => setAccepting(true)}>
                  Accept and create placement
                </Button>
              </div>
            )}
          <ApplicationActions application={application} />
        </Card>
      </div>
      {accepting && (
        <AcceptModal
          application={application}
          onClose={() => setAccepting(false)}
        />
      )}
    </>
  );
}
export function AcceptModal({
  application,
  onClose,
}: {
  application: Application;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const supervisors = useData(["supervisors", application.id], () =>
    endpoints.supervisors(application.id),
  );
  const accept = useMutation({
    mutationFn: (body: {
      supervisorUserId: string;
      startDate: string;
      endDate: string;
      note?: string;
    }) =>
      endpoints.accept(application.id, { targetStatus: "ACCEPTED", ...body }),
    onSuccess: (result) =>
      navigate(`/placements/${result.placement.id}/reports`),
  });
  if (supervisors.isLoading)
    return (
      <Modal title="Accept application" onClose={onClose}>
        <p>Loading supervisors…</p>
      </Modal>
    );
  const list = Array.isArray(supervisors.data)
    ? supervisors.data
    : (supervisors.data?.items ?? []);
  return (
    <Modal title="Accept application" onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          accept.mutate({
            supervisorUserId: String(data.get("supervisorUserId")),
            startDate: String(data.get("startDate")),
            endDate: String(data.get("endDate")),
            note: String(data.get("note")) || undefined,
          });
        }}
      >
        {supervisors.error && <ErrorMessage error={supervisors.error} />}
        <Field label="Supervisor" required>
          <SelectInput name="supervisorUserId" required>
            {list.map((supervisor) => (
              <option key={supervisor.id} value={supervisor.id}>
                {supervisor.fullName ?? supervisor.email ?? supervisor.id}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Start date" required>
          <TextInput name="startDate" type="date" required />
        </Field>
        <Field label="End date" required>
          <TextInput name="endDate" type="date" required />
        </Field>
        <Field label="Note">
          <TextArea name="note" />
        </Field>
        {accept.error && <ErrorMessage error={accept.error} />}
        <Button type="submit" disabled={accept.isPending || !list.length}>
          Accept
        </Button>
      </form>
    </Modal>
  );
}
export function ApplicationActions({
  application,
}: {
  application: Application;
}) {
  const { activeRole } = useSession();
  const client = useQueryClient();
  const change = useMutation({
    mutationFn: (status: string) =>
      status === "WITHDRAWN"
        ? endpoints.withdraw(application.id)
        : endpoints.transition(application.id, status),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["application", application.id] }),
  });
  const next: Record<string, string> = {
    SUBMITTED: "UNDER_REVIEW",
    UNDER_REVIEW: "INTERVIEW",
  };
  const active = ["SUBMITTED", "UNDER_REVIEW", "INTERVIEW"].includes(
    application.status,
  );
  return (
    <>
      {active && activeRole === "STUDENT" && (
        <Button
          onClick={() => change.mutate("WITHDRAWN")}
          disabled={change.isPending}
        >
          Withdraw
        </Button>
      )}
      {active && ["COMPANY_STAFF", "ADMIN"].includes(activeRole) && (
        <>
          {next[application.status] && (
            <Button
              onClick={() => change.mutate(next[application.status])}
              disabled={change.isPending}
            >
              {next[application.status] === "INTERVIEW"
                ? "Move to interview"
                : "Start review"}
            </Button>
          )}
          <Button
            variant="danger"
            onClick={() => change.mutate("REJECTED")}
            disabled={change.isPending}
          >
            Reject
          </Button>
        </>
      )}
      {change.error && <ErrorMessage error={change.error} />}
    </>
  );
}
