import { endpoints, type AdminUser, type ApiRole } from "@/lib/api";
import {
  Button,
  Card,
  Field,
  PageHeader,
  SelectInput,
  TextInput,
} from "@/shared/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

const roles: ApiRole[] = ["STUDENT", "COMPANY_STAFF", "SUPERVISOR", "ADMIN"];

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const users = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => endpoints.adminUsers(search),
  });
  const selected = useQuery({
    queryKey: ["admin-user", selectedId],
    queryFn: () => endpoints.adminUser(selectedId),
    enabled: Boolean(selectedId),
  });
  return (
    <>
      <PageHeader
        title="Administration"
        description="Manage existing accounts, roles, and company memberships."
      />
      <Field label="Search users">
        <TextInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name or email"
        />
      </Field>
      {users.error && <p role="alert">{users.error.message}</p>}
      <div className="grid two" style={{ marginTop: 16 }}>
        <Card>
          <h2 className="section-title">Users</h2>
          {users.data?.items.map((user) => (
            <button
              className="notification-item"
              key={user.id}
              onClick={() => setSelectedId(user.id)}
            >
              <strong>{user.fullName}</strong>
              <small>
                {user.email} · {user.isActive ? "Active" : "Disabled"}
              </small>
            </button>
          ))}
          {users.data?.items.length === 0 && (
            <p className="subtle">No matching users.</p>
          )}
        </Card>
        <Card>
          {selected.isLoading && <p>Loading…</p>}
          {selected.error && <p role="alert">{selected.error.message}</p>}
          {selected.data && (
            <AdminUserEditor
              key={`${selected.data.id}:${selected.data.updatedAt}`}
              user={selected.data}
            />
          )}
          {!selectedId && (
            <p className="subtle">Select a user to manage their account.</p>
          )}
        </Card>
      </div>
    </>
  );
}

function AdminUserEditor({ user }: { user: AdminUser }) {
  const client = useQueryClient();
  const companies = useQuery({
    queryKey: ["company-catalog"],
    queryFn: endpoints.companyCatalog,
  });
  const refresh = async () => {
    await client.invalidateQueries({ queryKey: ["admin-user", user.id] });
    await client.invalidateQueries({ queryKey: ["admin-users"] });
  };
  const account = useMutation({
    mutationFn: () =>
      endpoints.updateAdminAccount(user.id, {
        expectedUpdatedAt: user.updatedAt,
        isActive: !user.isActive,
      }),
    onSuccess: refresh,
  });
  const updateRoles = useMutation({
    mutationFn: (next: ApiRole[]) =>
      endpoints.updateAdminRoles(user.id, {
        expectedUpdatedAt: user.updatedAt,
        roles: next,
      }),
    onSuccess: refresh,
  });
  const updateMemberships = useMutation({
    mutationFn: (memberships: AdminUser["memberships"]) =>
      endpoints.updateAdminMemberships(user.id, {
        expectedUpdatedAt: user.updatedAt,
        memberships,
      }),
    onSuccess: refresh,
  });
  const [newCompany, setNewCompany] = useState("");
  const rolesSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    updateRoles.mutate(roles.filter((role) => data.get(role) === "on"));
  };
  return (
    <>
      <h2 className="section-title">{user.fullName}</h2>
      <p className="subtle">{user.email}</p>
      <Button
        variant={user.isActive ? "danger" : "primary"}
        disabled={account.isPending}
        onClick={() => account.mutate()}
      >
        {user.isActive ? "Disable account" : "Enable account"}
      </Button>
      <form onSubmit={rolesSubmit} style={{ marginTop: 20 }}>
        <h3>Roles</h3>
        {roles.map((role) => (
          <label key={role}>
            <input
              type="checkbox"
              name={role}
              defaultChecked={user.roles.includes(role)}
            />{" "}
            {role}
          </label>
        ))}
        <Button type="submit" disabled={updateRoles.isPending}>
          Save roles
        </Button>
      </form>
      <section style={{ marginTop: 20 }}>
        <h3>Company Staff memberships</h3>
        {user.memberships.map((membership) => (
          <p key={membership.companyId}>
            {membership.companyId} · {membership.title ?? "No title"} ·{" "}
            {membership.active ? "Active" : "Inactive"}{" "}
            <button
              onClick={() =>
                updateMemberships.mutate(
                  user.memberships.map((row) =>
                    row.companyId === membership.companyId
                      ? { ...row, active: !row.active }
                      : row,
                  ),
                )
              }
            >
              {membership.active ? "Deactivate" : "Activate"}
            </button>
          </p>
        ))}
        <SelectInput
          value={newCompany}
          onChange={(event) => setNewCompany(event.target.value)}
        >
          <option value="">Add company membership…</option>
          {companies.data
            ?.filter(
              (company) =>
                !user.memberships.some(
                  (membership) => membership.companyId === company.id,
                ),
            )
            .map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
        </SelectInput>
        <Button
          disabled={!newCompany || updateMemberships.isPending}
          onClick={() =>
            updateMemberships.mutate([
              ...user.memberships,
              { companyId: newCompany, active: true },
            ])
          }
        >
          Add membership
        </Button>
      </section>
      {[account.error, updateRoles.error, updateMemberships.error]
        .filter(Boolean)
        .map((error, index) => (
          <p key={index} role="alert">
            {error?.message}
          </p>
        ))}
    </>
  );
}
