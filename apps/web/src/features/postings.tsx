import { Pagination } from "./pagination";
import { endpoints, type Posting } from "@/lib/api";
import {
  Button,
  Card,
  EmptyState,
  Field,
  PageHeader,
  SelectInput,
  Status,
  TextArea,
  TextInput,
} from "@/shared/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSession } from "../app/session";
import { ErrorMessage, Loading, split, tone, useData } from "./view";
export function DiscoverPage() {
  const { activeRole } = useSession();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("match_score");
  const [page, setPage] = useState(1);
  const query = useData(
    ["postings", activeRole, search, sort, String(page)],
    () => endpoints.postings({ search, sort, page }),
  );
  const items = query.data ?? [];
  return (
    <>
      <PageHeader
        title="Discover opportunities"
        description="Search available internships. Match scores are advisory only."
      />
      <Card className="search-hub">
        <div className="filterbar">
          <TextInput
            aria-label="Search postings"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search role, company, skills"
          />
          <SelectInput
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="match_score">Match score</option>
            <option value="newest">Newest</option>
            <option value="relevance">Preference relevance</option>
          </SelectInput>
        </div>
      </Card>
      {query.isLoading && <Loading />}
      {query.error && <ErrorMessage error={query.error} />}
      <div className="grid three" style={{ marginTop: 20 }}>
        {items.map((posting) => (
          <PostingCard key={posting.id} posting={posting} />
        ))}
      </div>
      <div className="form-actions">
        <Button
          disabled={page === 1 || query.isFetching}
          onClick={() => setPage(page - 1)}
        >
          Previous page
        </Button>
        <span>Page {page}</span>
        <Button
          disabled={items.length < 20 || query.isFetching}
          onClick={() => setPage(page + 1)}
        >
          Next page
        </Button>
      </div>
      {!query.isLoading && !query.error && !items.length && (
        <EmptyState
          title="No opportunities found"
          text="Try a different search."
        />
      )}
    </>
  );
}
export function PostingCard({ posting }: { posting: Posting }) {
  return (
    <Card className="opportunity-card">
      <div className="record-head">
        <div>
          <h2 className="section-title">{posting.title}</h2>
          <p className="subtle">
            {posting.location ?? "Location not listed"} ·{" "}
            {posting.workArrangement}
          </p>
        </div>
        {posting.match && (
          <Status tone="blue">Match {posting.match.score}</Status>
        )}
      </div>
      <p className="subtle">
        {posting.durationWeeks} weeks · {posting.openings} openings · Deadline{" "}
        {posting.applicationDeadline}
      </p>
      <div className="tags">
        {posting.skills.map((skill) => (
          <span className="tag" key={skill.id}>
            {skill.name}
          </span>
        ))}
      </div>
      <div className="form-actions">
        <Link className="button primary" to={`/postings/${posting.id}`}>
          View posting
        </Link>
      </div>
    </Card>
  );
}
export function PostingDetail() {
  const { postingId = "" } = useParams();
  const { activeRole } = useSession();
  const query = useData(["posting", postingId, activeRole], () =>
    endpoints.posting(postingId),
  );
  const navigate = useNavigate();
  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorMessage error={query.error} />;
  const posting = query.data!;
  return (
    <>
      <PageHeader
        title={posting.title}
        description={`${posting.location ?? ""} · ${posting.workArrangement}`}
        action={
          activeRole === "STUDENT" && posting.status === "OPEN" ? (
            <Button onClick={() => navigate(`/postings/${posting.id}/apply`)}>
              Apply
            </Button>
          ) : undefined
        }
      />
      <PostingActions posting={posting} />
      <div className="grid two">
        <Card>
          <p>{posting.description}</p>
          <h2 className="section-title">Requirements</h2>
          <div className="tags">
            {posting.skills.map((skill) => (
              <span className="tag" key={skill.id}>
                {skill.importance}: {skill.name}
              </span>
            ))}
          </div>
        </Card>
        <div className="stack">
          {posting.match && (
            <Card>
              <h2 className="section-title">Match score</h2>
              <strong className="score-value">{posting.match.score}</strong>
              <p className="subtle">
                Matched: {posting.match.matchedSkills.join(", ") || "None"}
              </p>
              <p className="subtle">
                Missing: {posting.match.missingSkills.join(", ") || "None"}
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
export function PostingsPage() {
  const { activeRole } = useSession();
  const [page, setPage] = useState(1);
  const query = useData(["postings", activeRole, String(page)], () =>
    endpoints.postings({ page }),
  );
  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorMessage error={query.error} />;
  return (
    <>
      <PageHeader
        title="Postings"
        description="Create, publish and manage internships."
        action={
          <Link className="button primary" to="/postings/new">
            Create draft
          </Link>
        }
      />
      <PostingTable postings={query.data!} />
      <Pagination
        page={page}
        count={query.data!.length}
        busy={query.isFetching}
        onChange={setPage}
      />
    </>
  );
}
export function PostingTable({ postings }: { postings: Posting[] }) {
  return (
    <Card>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Posting</th>
              <th>Status</th>
              <th>Deadline</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {postings.map((posting) => (
              <tr key={posting.id}>
                <td>
                  <strong>{posting.title}</strong>
                  <br />
                  <small>{posting.location}</small>
                </td>
                <td>
                  <Status tone={tone(posting.status)}>{posting.status}</Status>
                </td>
                <td>{posting.applicationDeadline}</td>
                <td>
                  <Link to={`/postings/${posting.id}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
export function NewPosting() {
  const companies = useData(["my-companies"], endpoints.companies);
  const client = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const create = useMutation({
    mutationFn: endpoints.createPosting,
    onSuccess: (posting) => {
      void client.invalidateQueries({ queryKey: ["postings"] });
      navigate(`/postings/${posting.id}`);
    },
    onError: (reason) =>
      setError(
        reason instanceof Error ? reason.message : "Unable to create posting",
      ),
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const skills = split(String(data.get("skills"))).map((name) => ({
      name,
      importance: "REQUIRED",
    }));
    create.mutate({
      companyId: String(data.get("companyId")),
      title: String(data.get("title")),
      description: String(data.get("description")),
      category: String(data.get("category")) || undefined,
      location: String(data.get("location")) || undefined,
      workArrangement: String(data.get("workArrangement")),
      durationWeeks: Number(data.get("durationWeeks")),
      openings: Number(data.get("openings")),
      applicationDeadline: String(data.get("applicationDeadline")),
      deadlineTimezone: "Asia/Ho_Chi_Minh",
      skills,
    });
  };
  return (
    <>
      <PageHeader
        title="Create posting draft"
        description="Save a draft, then publish it when ready."
      />
      <Card>
        <form onSubmit={submit}>
          <Field label="Company" required>
            <SelectInput name="companyId" required>
              <option value="">Select company</option>
              {companies.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="form-grid">
            <Field label="Title" required>
              <TextInput name="title" required />
            </Field>
            <Field label="Category">
              <TextInput name="category" />
            </Field>
            <Field label="Location">
              <TextInput name="location" />
            </Field>
            <Field label="Work arrangement" required>
              <SelectInput name="workArrangement">
                <option>HYBRID</option>
                <option>REMOTE</option>
                <option>ONSITE</option>
              </SelectInput>
            </Field>
            <Field label="Duration weeks" required>
              <TextInput name="durationWeeks" type="number" min="1" required />
            </Field>
            <Field label="Openings" required>
              <TextInput name="openings" type="number" min="1" required />
            </Field>
            <Field label="Deadline" required>
              <TextInput name="applicationDeadline" type="date" required />
            </Field>
          </div>
          <Field label="Description" required>
            <TextArea name="description" required />
          </Field>
          <Field label="Required skills">
            <TextInput name="skills" placeholder="React, TypeScript" />
          </Field>
          {error && <p className="notice">{error}</p>}
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create draft"}
          </Button>
        </form>
      </Card>
    </>
  );
}
export function PostingActions({ posting }: { posting: Posting }) {
  const { activeRole } = useSession();
  const client = useQueryClient();
  const change = useMutation({
    mutationFn: (status: string) =>
      status === "OPEN"
        ? endpoints.publish(posting.id)
        : endpoints.postingLifecycle(posting.id, status),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["posting", posting.id] }),
  });
  const save = useMutation({
    mutationFn: () => endpoints.savePosting(posting.id),
  });
  if (activeRole === "STUDENT")
    return (
      <>
        <Button
          onClick={() => save.mutate()}
          disabled={save.isPending || save.isSuccess}
        >
          {save.isSuccess ? "Saved" : "Save opportunity"}
        </Button>
        {save.error && <ErrorMessage error={save.error} />}
      </>
    );
  if (!["ADMIN", "COMPANY_STAFF"].includes(activeRole)) return null;
  const next: Record<string, string> = {
    DRAFT: "OPEN",
    OPEN: "CLOSED",
    CLOSED: "ARCHIVED",
  };
  return (
    <>
      {next[posting.status] && (
        <Button
          onClick={() => change.mutate(next[posting.status])}
          disabled={change.isPending}
        >
          {posting.status === "DRAFT"
            ? "Publish"
            : posting.status === "OPEN"
              ? "Close"
              : "Archive"}
        </Button>
      )}
      {change.error && <ErrorMessage error={change.error} />}
    </>
  );
}
