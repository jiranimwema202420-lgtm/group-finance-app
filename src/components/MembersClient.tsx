"use client";

import { useEffect, useMemo, useState } from "react";

type MemberRole = "Admin" | "Treasurer" | "Chairperson" | "Member";
type MemberStatus = "Active" | "Inactive" | "Exited";

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

const roleOptions: MemberRole[] = ["Admin", "Treasurer", "Chairperson", "Member"];
const statusOptions: MemberStatus[] = ["Active", "Inactive", "Exited"];

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function sortMembersByName(members: Member[]) {
  return [...members].sort((a, b) => a.name.localeCompare(b.name));
}

function createMemberId() {
  return `member-${Date.now()}`;
}

function formatKes(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MembersClient() {
  const [members, setMembers] = useState<Member[]>(starterMembers);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | MemberRole>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | MemberStatus>("All");

  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as Member[];
        setMembers(parsed);
      }
    } catch {
      setMembers(starterMembers);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [hasLoaded, members]);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = normalize(search);
    const normalizedRoleFilter = normalize(roleFilter);
    const normalizedStatusFilter = normalize(statusFilter);

    return sortMembersByName(members).filter((member) => {
      const memberName = normalize(member.name);
      const memberPhone = normalize(member.phone);
      const memberRole = normalize(member.role);
      const memberStatus = normalize(member.status);
      const memberNotes = normalize(member.notes);

      const matchesSearch =
        !normalizedSearch ||
        memberName.includes(normalizedSearch) ||
        memberPhone.includes(normalizedSearch) ||
        memberRole.includes(normalizedSearch) ||
        memberStatus.includes(normalizedSearch) ||
        memberNotes.includes(normalizedSearch);

      const matchesRole =
        normalizedRoleFilter === "all" || memberRole === normalizedRoleFilter;

      const matchesStatus =
        normalizedStatusFilter === "all" ||
        memberStatus === normalizedStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, roleFilter, search, statusFilter]);

  const activeMembers = members.filter((member) => member.status === "Active");

  const officials = members.filter((member) =>
    ["Admin", "Treasurer", "Chairperson"].includes(member.role)
  );

  const expectedMonthlyContribution = activeMembers.reduce(
    (total, member) => total + Number(member.monthlyContribution || 0),
    0
  );

  const expectedInsurancePremium = activeMembers.reduce(
    (total, member) => total + Number(member.insurancePremium || 0),
    0
  );

  function updateMember(memberId: string, patch: Partial<Member>) {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === memberId ? { ...member, ...patch } : member
      )
    );
  }

  function addMember() {
    const cleanName = newMemberName.trim();

    if (!cleanName) return;

    const today = new Date().toISOString().slice(0, 10);

    const member: Member = {
      id: createMemberId(),
      name: cleanName,
      phone: newMemberPhone.trim(),
      role: "Member",
      status: "Active",
      monthlyContribution: 200,
      insurancePremium: 750,
      joinDate: today,
      notes: "",
    };

    setMembers((currentMembers) => sortMembersByName([...currentMembers, member]));
    setNewMemberName("");
    setNewMemberPhone("");
  }

  function clearFilters() {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
  }

  function resetDemoData() {
    const confirmed = window.confirm(
      "Reset the local members register to the starter data?"
    );

    if (!confirmed) return;

    setMembers(starterMembers);
    clearFilters();
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
              Manage member records, roles, status, join dates, contributions,
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
              onClick={resetDemoData}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Reset local data
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          Phase 5 uses local browser storage only. Firestore persistence will be
          added later.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total members</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{members.length}</p>
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
            {formatKes(expectedMonthlyContribution + expectedInsurancePremium)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Contributions + insurance
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
            {roleOptions.map((role) => (
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
            {statusOptions.map((status) => (
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
              New members are saved locally in this browser during Phase 5.
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
            value={newMemberName}
            onChange={(event) => setNewMemberName(event.target.value)}
            disabled={!editMode}
            placeholder="Member full name"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4 disabled:bg-slate-50 disabled:text-slate-400"
          />

          <input
            value={newMemberPhone}
            onChange={(event) => setNewMemberPhone(event.target.value)}
            disabled={!editMode}
            placeholder="Phone number"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4 disabled:bg-slate-50 disabled:text-slate-400"
          />

          <button
            type="button"
            onClick={addMember}
            disabled={!editMode || !newMemberName.trim()}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
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
          <table className="w-full min-w-[1150px] divide-y divide-slate-200 text-left text-sm">
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
                      {roleOptions.map((role) => (
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
                      {statusOptions.map((status) => (
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
