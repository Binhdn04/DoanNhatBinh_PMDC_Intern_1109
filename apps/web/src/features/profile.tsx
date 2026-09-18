import { DocumentDownload } from "./document-download";
import { endpoints, uploadDocument, type Skill } from "@/lib/api";
import {
  Button,
  Card,
  Field,
  PageHeader,
  Status,
  TextArea,
  TextInput,
} from "@/shared/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ErrorMessage,
  Loading,
  numberValue,
  split,
  tone,
  useData,
  validateFile,
} from "./view";
export function ProfilePage() {
  const client = useQueryClient();
  const profile = useData(["profile"], endpoints.profile);
  const skills = useData(["skills"], endpoints.skills);
  const preferences = useData(["preferences"], endpoints.preferences);
  const documents = useData(["documents"], endpoints.documents);
  const [notice, setNotice] = useState("");
  const save = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const data = new FormData(form);
      await endpoints.updateProfile({
        university: String(data.get("university")),
        major: String(data.get("major")),
        graduationYear: Number(data.get("graduationYear")) || undefined,
        bio: String(data.get("bio")),
      });
      await endpoints.setPreferences({
        industries: split(String(data.get("industries"))),
        locations: split(String(data.get("locations"))),
        workArrangements: split(String(data.get("workArrangements"))),
        minDurationWeeks: numberValue(data.get("minDurationWeeks")),
        maxDurationWeeks: numberValue(data.get("maxDurationWeeks")),
      });
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["profile"] });
      void client.invalidateQueries({ queryKey: ["preferences"] });
      setNotice("Profile saved.");
    },
  });
  const upload = useMutation({
    mutationFn: async (file: File) => {
      validateFile(file);
      return uploadDocument(file);
    },
    onSuccess: () => void client.invalidateQueries({ queryKey: ["documents"] }),
  });
  const remove = useMutation({
    mutationFn: endpoints.deleteDocument,
    onSuccess: () => void client.invalidateQueries({ queryKey: ["documents"] }),
  });
  if (
    profile.isLoading ||
    skills.isLoading ||
    preferences.isLoading ||
    documents.isLoading
  )
    return <Loading />;
  if (profile.error || skills.error || preferences.error || documents.error)
    return (
      <ErrorMessage
        error={
          profile.error ?? skills.error ?? preferences.error ?? documents.error
        }
      />
    );
  const p = profile.data!,
    pref = preferences.data!,
    currentSkills = skills.data!;
  return (
    <>
      <PageHeader
        title="Student profile"
        description="Maintain profile, skills, preferences and reusable documents."
      />
      <Card>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(event.currentTarget);
          }}
        >
          <div className="form-grid">
            <Field label="University">
              <TextInput name="university" defaultValue={p.university} />
            </Field>
            <Field label="Major">
              <TextInput name="major" defaultValue={p.major} />
            </Field>
            <Field label="Graduation year">
              <TextInput
                name="graduationYear"
                type="number"
                defaultValue={p.graduationYear}
              />
            </Field>
            <Field label="Industries (comma separated)">
              <TextInput
                name="industries"
                defaultValue={pref.industries.join(", ")}
              />
            </Field>
            <Field label="Locations (comma separated)">
              <TextInput
                name="locations"
                defaultValue={pref.locations.join(", ")}
              />
            </Field>
            <Field label="Work arrangements (comma separated)">
              <TextInput
                name="workArrangements"
                defaultValue={pref.workArrangements.join(", ")}
              />
            </Field>
            <Field label="Minimum duration (weeks)">
              <TextInput
                name="minDurationWeeks"
                type="number"
                defaultValue={pref.minDurationWeeks}
              />
            </Field>
            <Field label="Maximum duration (weeks)">
              <TextInput
                name="maxDurationWeeks"
                type="number"
                defaultValue={pref.maxDurationWeeks}
              />
            </Field>
          </div>
          <Field label="Bio">
            <TextArea name="bio" defaultValue={p.bio} />
          </Field>
          {save.error && <ErrorMessage error={save.error} />}
          {notice && <p className="subtle">{notice}</p>}
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </Card>
      <Card style={{ marginTop: 20 }}>
        <h2 className="section-title">Skills</h2>
        <SkillEditor
          skills={currentSkills}
          onSave={async (next) => {
            await endpoints.setSkills(next);
            await client.invalidateQueries({ queryKey: ["skills"] });
          }}
        />
      </Card>
      <Card style={{ marginTop: 20 }}>
        <h2 className="section-title">Documents</h2>
        <Field
          label="Upload document"
          hint="PDF, JPEG, PNG or DOCX; maximum 10 MiB."
        >
          <TextInput
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) upload.mutate(file);
            }}
          />
        </Field>
        {remove.error && <ErrorMessage error={remove.error} />}
        {upload.error && <ErrorMessage error={upload.error} />}
        {documents.data!.items.map((doc) => (
          <div className="file-row" key={doc.id}>
            <strong>{doc.originalName}</strong>
            <Status tone={tone(doc.state)}>{doc.state}</Status>
            {doc.state === "AVAILABLE" && (
              <DocumentDownload id={doc.id} name={doc.originalName} />
            )}
            <Button
              variant="ghost"
              disabled={remove.isPending}
              onClick={() => remove.mutate(doc.id)}
            >
              Delete
            </Button>
          </div>
        ))}
        {!documents.data!.items.length && (
          <p className="subtle">No documents uploaded.</p>
        )}
      </Card>
    </>
  );
}
export function SkillEditor({
  skills,
  onSave,
}: {
  skills: Skill[];
  onSave: (skills: Skill[]) => Promise<void>;
}) {
  const [value, setValue] = useState(
    skills
      .map((skill) => `${skill.name}|${skill.proficiency ?? "BEGINNER"}`)
      .join("\n"),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [saved, setSaved] = useState(false);
  const submit = async () => {
    setBusy(true);
    setError(undefined);
    setSaved(false);
    try {
      await onSave(
        value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [name, proficiency = "BEGINNER"] = line.split("|");
            return {
              name: name.trim(),
              proficiency: proficiency.trim().toUpperCase(),
            };
          }),
      );
      setSaved(true);
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <TextArea
        aria-label="Skills"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="React | INTERMEDIATE"
      />
      <p className="subtle">One skill per line: name | proficiency.</p>
      {Boolean(error) && <ErrorMessage error={error} />}
      {saved && <p role="status">Skills saved.</p>}
      <Button onClick={() => void submit()} disabled={busy}>
        {busy ? "Saving…" : "Save skills"}
      </Button>
    </>
  );
}
