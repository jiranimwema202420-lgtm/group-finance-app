"use client";

import { useEffect, useMemo, useState } from "react";

const roles = ["Admin", "Treasurer", "Chairperson", "Member"] as const;
const statuses = ["Active", "Inactive", "Exited"] as const;

type MemberRole = (typeof roles)[number];
type MemberStatus = (typeof statuses)[number];

type Member = {
  id: string;
  name: string;
  phone: string;
  role: MemberRole;
  status: MemberStatus;
  monthlyContribution: number;
  insurancePremium: number;
  joinDate: string;
  notes: string;
};

const STORAGE_KEY = "jirani_members_register_v1";

const starterMembers: Member[] = [
  {
    id: "member-001",
    name: "Nduati Njoroge",
    phone: "",
    role: "Admin",
    status: "Active",
    monthlyContribution: 200,
    insurancePremium: 750,
    joinDate: "2026-01-01",
    notes: "System owner",
  },
  {
    id: "member-002",
    name: "Alice Nyamoita",
    phone: "",
    role: "Treasurer",
    status: "Active",
    monthlyContribution: 200,
    insurancePremium: 750,
    joinDate: "2026-01-01",
    notes: "",
  },
  {
    id: "member-003",
    name: "Simon Kimani",
    phone: "",
    role: "Chairperson",
    status: "Active",
    monthlyContribution: 200,
    insurancePremium: 750,
    joinDate: "2026-01-01",
    notes: "",
  },
  {
    id: "member-004",
    name: "Ann Gachoki",
    phone: "",
    role: "Member",
    status: "Active",
    monthlyContribution: 200,
    insurancePremium: 750,
    joinDate: "2026-01-01",
    notes: "",
  },
  {
    id: "member-005",
    name: "Felix Obayo",
    phone: "",
    role: "Member",
    status: "Active",
    monthlyContribution: 200,
    insurancePremium: 750,
    joinDate: "2026-01-01",
    notes: "",
  },
  {
    id: "member-006",
    name: "Francis Kivila",
    phone: "",
    role: "Member",
    status: "Active",
    monthlyContribution: 200,
    insurancePremium: 750,
    joinDate: "2026-01-01",
    notes: "",
  },
];

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function sortMembers(members: Member[]) {
  return [...members].sort((a, b) => a.name.localeCompare(b.name));
}

function formatKes(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function createId() {
  return `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function MembersClient() {
  const [members, setMembers] = useState<Member[]>(starterMembers);
  const [loaded, setLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | MemberRole>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | MemberStatus>("All");

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as Member[];

        if (Array.isArray(parsed)) {
          setMembers(parsed);
        }
      }
    } catch {
      setMembers(starterMembers);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [loaded, members]);

  const filteredMembers = useMemo(() => {
    const q = normalize(search);
    const role = normalize(roleFilter);
    const status = normalize(statusFilter);

    return sortMembers(members).filter((member) => {
      const matchesSearch =
        !q ||
        normalize(member.name).includes(q) ||
        normalize(member.phone).includes(q) ||
        normalize(member.role).includes(q) ||
        normalize(member.status).includes(q) ||
        normalize(member.notes).includes(q);

      const matchesRole = role === "all" || normalize(member.role) === role;
      const matchesStatus =
        status === "all" || normalize(member.status) === status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, roleFilter, search, statusFilter]);

  const activeMembers = members.filter((member) => member.status === "Active");
  const officials = members.filter((member) =>
    ["Admin", "Treasurer", "Chairperson"].includes(member.role)
  );

  const expectedMonthlyTotal = activeMembers.reduce(
    (total, member) =>
      total +
      Number(member.monthlyContribution || 0) +
      Number(member.insurancePremium || 0),
    0
  );

  function updateMember(id: string, patch: Partial<Member>) {
    setMembers((current) =>
      current.map((member) =>
        member.id === id ? { ...member, ...patch } : member
      )
    );
  }

  function addMember() {
    const name = newName.trim();

    if (!name) return;

    const member: Member = {
      id: createId(),
      name,
      phone: newPhone.trim(),
      role: "Member",
      status: "Active",
      monthlyContribution: 200,
      insurancePremium: 750,
      joinDate: today(),
      notes: "",
    };

    setMembers((current) => sortMembers([...current, member]));
    setNewName("");
    setNewPhone("");
  }

  function clearFilters() {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
  }

  function resetLocalData() {
    const confirmed = window.confirm("Reset members to starter local data?");
    if (!confirmed) return;

    setMembers(starterMembers);
    clearFilters();
  }

  function exportCsv() {
    const rows = sortMembers(members).map((member, index) => [
      index + 1,
      member.name,
      member.phone,
      member.role,
      member.status,
      member.monthlyContribution,
      member.insurancePremium,
      member.joinDate,
      member.notes,
    ]);

    const headers = [
      "No.",
      "Name",
      "Phone",
      "Role",
      "Status",
      "Monthly Contribution",
      "Insurance Premium",
      "Join Date",
      "Notes",
    ];

    const csv = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `jirani-members-${today()}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  function markExited(id: string) {
    updateMember(id, { status: "Exited" });
  }

  function reactivate(id: string) {
    updateMember(id, { status: "Active" });
  }

  function deleteMember(id: string) {
    const confirmed = window.confirm(
      "Delete this member from local browser storage?"
    );

    if (!confirmed) return;

    setMembers((current) => current.filter((member) => member.id !== id));
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              Group operations
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Members Register
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Manage members, roles, status, join dates, monthly contributions,
              and insurance premium settings.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditMode((current) => !current)}
              className={[
                "rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition",
                editMode
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
              ].join(" ")}
            >
              {editMode ? "Editing enabled" : "Enable editing"}
            </button>

            <button
              type="button"
              onClick={exportCsv}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={resetLocalData}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Reset local data
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          This page currently uses local browser storage only. Firestore
          persistence will be added in the next database phase.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total members</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {members.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active members</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {activeMembers.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Officials</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {officials.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Expected monthly total
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {formatKes(expectedMonthlyTotal)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Active contributions + insurance
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-700">
            Showing {filteredMembers.length} of {members.length} members
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="w-fit rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Clear filters
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, phone, role, status, or notes"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
          />

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as "All" | MemberRole)
            }
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
          >
            <option value="All">All roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "All" | MemberStatus)
            }
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
          >
            <option value="All">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Add member</h2>
            <p className="mt-1 text-sm text-slate-500">
              New members are saved locally in this browser.
            </p>
          </div>

          {!editMode ? (
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              Enable editing to add members
            </span>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            disabled={!editMode}
            placeholder="Member full name"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4 disabled:bg-slate-50 disabled:text-slate-400"
          />

          <input
            value={newPhone}
            onChange={(event) => setNewPhone(event.target.value)}
            disabled={!editMode}
            placeholder="Phone number"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4 disabled:bg-slate-50 disabled:text-slate-400"
          />

          <button
            type="button"
            onClick={addMember}
            disabled={!editMode || !newName.trim()}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Add member
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-950">Member list</h2>
          <p className="mt-1 text-sm text-slate-500">
            Numbered alphabetically. Use editing mode for changes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1350px] divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Monthly</th>
                <th className="px-4 py-3">Insurance</th>
                <th className="px-4 py-3">Join date</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member, index) => (
                <tr key={member.id} className="align-top">
                  <td className="px-4 py-3 font-semibold text-slate-500">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3">
                    <input
                      value={member.name}
                      onChange={(event) =>
                        updateMember(member.id, { name: event.target.value })
                      }
                      disabled={!editMode}
                      className="w-56 rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-950 outline-none focus:ring-4 focus:ring-slate-900/10 disabled:border-transparent disabled:bg-transparent disabled:px-0"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      value={member.phone}
                      onChange={(event) =>
                        updateMember(member.id, { phone: event.target.value })
                      }
                      disabled={!editMode}
                      placeholder="Not set"
                      className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:ring-4 focus:ring-slate-900/10 disabled:border-transparent disabled:bg-transparent disabled:px-0 disabled:text-slate-500"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={member.role}
                      onChange={(event) =>
                        updateMember(member.id, {
                          role: event.target.value as MemberRole,
                        })
                      }
                      disabled={!editMode}
                      className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:ring-4 focus:ring-slate-900/10 disabled:appearance-none disabled:border-transparent disabled:bg-transparent disabled:px-0"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={member.status}
                      onChange={(event) =>
                        updateMember(member.id, {
                          status: event.target.value as MemberStatus,
                        })
                      }
                      disabled={!editMode}
                      className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:ring-4 focus:ring-slate-900/10 disabled:appearance-none disabled:border-transparent disabled:bg-transparent disabled:px-0"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={member.monthlyContribution}
                      onChange={(event) =>
                        updateMember(member.id, {
                          monthlyContribution: Number(event.target.value),
                        })
                      }
                      disabled={!editMode}
                      className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:ring-4 focus:ring-slate-900/10 disabled:border-transparent disabled:bg-transparent disabled:px-0"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={member.insurancePremium}
                      onChange={(event) =>
                        updateMember(member.id, {
                          insurancePremium: Number(event.target.value),
                        })
                      }
                      disabled={!editMode}
                      className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:ring-4 focus:ring-slate-900/10 disabled:border-transparent disabled:bg-transparent disabled:px-0"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={member.joinDate}
                      onChange={(event) =>
                        updateMember(member.id, {
                          joinDate: event.target.value,
                        })
                      }
                      disabled={!editMode}
                      className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:ring-4 focus:ring-slate-900/10 disabled:border-transparent disabled:bg-transparent disabled:px-0"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      value={member.notes}
                      onChange={(event) =>
                        updateMember(member.id, { notes: event.target.value })
                      }
                      disabled={!editMode}
                      placeholder="None"
                      className="w-56 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:ring-4 focus:ring-slate-900/10 disabled:border-transparent disabled:bg-transparent disabled:px-0 disabled:text-slate-500"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {member.status === "Exited" ? (
                        <button
                          type="button"
                          onClick={() => reactivate(member.id)}
                          disabled={!editMode}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markExited(member.id)}
                          disabled={!editMode}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Mark exited
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteMember(member.id)}
                        disabled={!editMode}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No members match your current filters.
          </div>
        ) : null}
      </div>
    </section>
  );
}
