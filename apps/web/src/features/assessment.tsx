import { ApiError, endpoints } from "@/lib/api";
import {
  Button,
  Card,
  Field,
  PageHeader,
  SelectInput,
  TextArea,
} from "@/shared/ui";
import { useMutation } from "@tanstack/react-query";
import { type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "../app/session";
import { ErrorMessage, Loading, useData } from "./view";
export function AssessmentPage({ kind }: { kind: "self" | "performance" }) {
  const { placementId = "" } = useParams();
  const { activeRole } = useSession();
  const query = useData(["assessment", kind, placementId, activeRole], () =>
    kind === "self"
      ? endpoints.selfAssessment(placementId)
      : endpoints.performanceEvaluation(placementId),
  );
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      kind === "self"
        ? endpoints.putSelfAssessment(placementId, body)
        : endpoints.putPerformanceEvaluation(placementId, body),
  });
  const data = query.data ?? {};
  const submit = (
    event: FormEvent<HTMLFormElement>,
    status: "DRAFT" | "SUBMITTED",
  ) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ratings = {
      technicalPractice: Number(form.get("technicalPractice")),
      communication: Number(form.get("communication")),
    };
    save.mutate(
      kind === "self"
        ? {
            status,
            ratings,
            reflection: String(form.get("reflection")),
            learningOutcomes: String(form.get("learningOutcomes")),
          }
        : {
            status,
            ratings,
            comments: String(form.get("comments")),
            completionDecision: String(form.get("completionDecision")),
          },
    );
  };
  if (query.isLoading) return <Loading />;
  if (
    query.error &&
    !(query.error instanceof ApiError && query.error.status === 404)
  )
    return <ErrorMessage error={query.error} />;
  return (
    <>
      <PageHeader
        title={kind === "self" ? "Self-assessment" : "Performance evaluation"}
        description="Assessments are separate authored records."
      />
      <Card>
        <form onSubmit={(event) => submit(event, "SUBMITTED")}>
          <div className="form-grid">
            <Field label="Technical practice" required>
              <SelectInput
                name="technicalPractice"
                defaultValue={String(
                  (data.ratings as Record<string, number> | undefined)
                    ?.technicalPractice ?? 3,
                )}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </SelectInput>
            </Field>
            <Field label="Communication" required>
              <SelectInput
                name="communication"
                defaultValue={String(
                  (data.ratings as Record<string, number> | undefined)
                    ?.communication ?? 3,
                )}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </SelectInput>
            </Field>
          </div>
          {kind === "self" ? (
            <>
              <Field label="Reflection" required>
                <TextArea
                  name="reflection"
                  defaultValue={String(data.reflection ?? "")}
                  required
                />
              </Field>
              <Field label="Learning outcomes" required>
                <TextArea
                  name="learningOutcomes"
                  defaultValue={String(data.learningOutcomes ?? "")}
                  required
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Completion decision" required>
                <SelectInput
                  name="completionDecision"
                  defaultValue={String(data.completionDecision ?? "PENDING")}
                >
                  <option>PENDING</option>
                  <option>PASSED</option>
                  <option>FAILED</option>
                  <option>INCOMPLETE</option>
                </SelectInput>
              </Field>
              <Field label="Evaluator feedback">
                <TextArea
                  name="comments"
                  defaultValue={String(data.comments ?? "")}
                />
              </Field>
            </>
          )}{" "}
          {save.error && <ErrorMessage error={save.error} />}
          <div className="form-actions">
            <Button
              variant="secondary"
              onClick={(event) => {
                const form = event.currentTarget.closest("form");
                if (form)
                  submit(
                    {
                      preventDefault: () => undefined,
                      currentTarget: form,
                    } as unknown as FormEvent<HTMLFormElement>,
                    "DRAFT",
                  );
              }}
            >
              Save draft
            </Button>
            <Button type="submit" disabled={save.isPending}>
              Submit
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
