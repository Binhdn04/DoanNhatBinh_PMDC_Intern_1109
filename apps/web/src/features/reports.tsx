import { DocumentDownload } from "./document-download";
import { endpoints } from "@/lib/api";
import {
  Button,
  Card,
  Field,
  PageHeader,
  SelectInput,
  TextArea,
} from "@/shared/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "../app/session";
export function ReportDetailPage() {
  const { reportId = "" } = useParams();
  const { activeRole } = useSession();
  const client = useQueryClient();
  const row = useQuery({
    queryKey: ["report", reportId, activeRole],
    queryFn: () => endpoints.report(reportId),
  });
  const [feedback, setFeedback] = useState("");
  const [selected, setSelected] = useState("");
  const refresh = () =>
    client.invalidateQueries({ queryKey: ["report", reportId] });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      endpoints.patchReport(reportId, body),
    onSuccess: refresh,
  });
  const submit = useMutation({
    mutationFn: () => endpoints.submitReport(reportId),
    onSuccess: refresh,
  });
  const review = useMutation({
    mutationFn: (outcome: string) =>
      endpoints.reviewReport(reportId, {
        reportVersionId: row.data?.versions?.at(-1)?.id,
        outcome,
        feedback,
      }),
    onSuccess: () => {
      setFeedback("");
      return refresh();
    },
    onError: () => {
      void refresh();
    },
  });
  if (row.isLoading) return <p>Loading…</p>;
  if (row.error) return <p role="alert">{row.error.message}</p>;
  const report = row.data!;
  const version =
    report.versions?.find((v) => v.id === selected) ?? report.versions?.at(-1);
  const editable =
    activeRole === "STUDENT" &&
    ["DRAFT", "REVISION_REQUESTED"].includes(report.state);
  const draft = report.draft ?? report.versions?.at(-1);
  const onSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    save.mutate({
      accomplishments: form.get("accomplishments"),
      challenges: form.get("challenges"),
      nextWeekPlan: form.get("nextWeekPlan"),
      attachmentDocumentIds: draft?.attachmentDocumentIds ?? [],
    });
  };
  return (
    <>
      <PageHeader title="Weekly report" description={report.state} />
      {editable && (
        <Card>
          <form
            key={`${report.id}:${report.currentVersionNo}`}
            onSubmit={onSave}
          >
            <Field label="Accomplishments">
              <TextArea
                name="accomplishments"
                defaultValue={draft?.accomplishments ?? ""}
                required
              />
            </Field>
            <Field label="Challenges">
              <TextArea
                name="challenges"
                defaultValue={draft?.challenges ?? ""}
                required
              />
            </Field>
            <Field label="Next-week plan">
              <TextArea
                name="nextWeekPlan"
                defaultValue={draft?.nextWeekPlan ?? ""}
                required
              />
            </Field>
            <Button type="submit" disabled={save.isPending}>
              Save draft
            </Button>
            <Button
              onClick={() => submit.mutate()}
              disabled={submit.isPending || save.isPending || !report.draft}
            >
              Submit saved draft
            </Button>
            {save.isSuccess && <p>Draft saved.</p>}
          </form>
        </Card>
      )}
      <Card>
        <h2>Submitted history</h2>
        {report.versions?.length ? (
          <>
            <SelectInput
              aria-label="Report version"
              value={version?.id}
              onChange={(event) => setSelected(event.target.value)}
            >
              {report.versions.map((v) => (
                <option key={v.id} value={v.id}>
                  Version {v.versionNo}
                </option>
              ))}
            </SelectInput>
            <h3>Accomplishments</h3>
            <p>{version?.accomplishments}</p>
            <h3>Challenges</h3>
            <p>{version?.challenges}</p>
            <h3>Next-week plan</h3>
            <p>{version?.nextWeekPlan}</p>
          </>
        ) : (
          <p>No submitted version.</p>
        )}
        {version?.attachmentDocumentIds?.map((id, index) => (
          <DocumentDownload
            key={id}
            id={id}
            name={`report-attachment-${index + 1}`}
            label={`Download attachment ${index + 1}`}
          />
        ))}
        {report.reviews?.map((r, i) => (
          <p key={i}>
            {r.outcome}: {r.feedback}
          </p>
        ))}
      </Card>
      {["SUPERVISOR", "ADMIN"].includes(activeRole) &&
        report.state === "SUBMITTED" && (
          <Card>
            <Field label="Review feedback">
              <TextArea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
              />
            </Field>
            <Button
              disabled={review.isPending}
              onClick={() => review.mutate("APPROVED")}
            >
              Approve current version
            </Button>
            <Button
              disabled={review.isPending || !feedback.trim()}
              onClick={() => review.mutate("REVISION_REQUESTED")}
            >
              Request revision
            </Button>
          </Card>
        )}
      {[save.error, submit.error, review.error]
        .filter(Boolean)
        .map((error, i) => (
          <p role="alert" key={i}>
            {error?.message}
          </p>
        ))}
    </>
  );
}
