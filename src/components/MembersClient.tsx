"use client";

import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { auth, db, firebaseConfigReady } from "@/lib/firebase";
import { formatMoney } from "@/lib/groupSettings";
import { useGroupSettings } from "@/hooks/useGroupSettings";

const CURRENT_GROUP_ID = "demo_group_01";
const STORAGE_KEY = "jirani_members_register_v1";

const roles = ["Admin", "Treasurer", "Chairperson", "Member"] as const;
const statuses = ["Active", "Inactive", "Exited"] as const;

type MemberRole = (typeof roles)[number];
type MemberStatus = (typeof statuses)[number];

type SyncMode = "Local only" | "Connecting" | "Firestore synced" | "Firestore unavailable";

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

function isRole(value: unknown): value is MemberRole {
  return roles.includes(value as MemberRole);
}

function isStatus(value: unknown): value is MemberStatus {
  return statuses.includes(value as MemberStatus);
}

function today() {
  return new Date().toISOString().slice(0, 10);
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

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function cleanMember(raw: Partial<Member>, fallbackId: string): Member {
  return {
    id: String(raw.id ?? fallbackId),
    name: String(raw.name ?? "").trim() || "Unnamed Member",
    phone: String(raw.phone ?? ""),
    role: isRole(raw.role) ? raw.role : "Member",
    status: isStatus(raw.status) ? raw.status : "Active",
    monthlyContribution: Number(raw.monthlyContribution ?? 200),
    insurancePremium: Number(raw.insurancePremium ?? 750),
    joinDate: String(raw.joinDate ?? today()),
    notes: String(raw.notes ?? ""),
  };
}

function membersCollectionRef() {
  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return collection(db, "groups", CURRENT_GROUP_ID, "members");
}

function memberDocRef(memberId: string) {
  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return doc(db, "groups", CURRENT_GROUP_ID, "members", memberId);
}

function toFirestoreData(member: Member) {
  return {
    name: member.name.trim(),
    phone: member.phone.trim(),
    role: member.role,
    status: member.status,
    monthlyContribution: Number(member.monthlyContribution || 0),
    insurancePremium: Number(member.insurancePremium || 0),
    joinDate: member.joinDate,
    notes: member.notes.trim(),
    groupId: CURRENT_GROUP_ID,
    updatedAt: serverTimestamp(),
  };
}

export default function MembersClient() {
  const { settings, settingsSyncMode, settingsSyncError } = useGroupSettings();

  function money(value: number) {
    return formatMoney(settings.currency, value);
  }
  const [members, setMembers] = useState<Member[]>(starterMembers);
  const [loaded, setLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncMode, setSyncMode] = useState<SyncMode>("Connecting");
  const [syncError, setSyncError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | MemberRole>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | MemberStatus>("All");

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Member>[];

        if (Array.isArray(parsed)) {
          setMembers(parsed.map((member, index) => cleanMember(member, `local-${index}`)));
        }
      }
    } catch {
      setMembers(starterMembers);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!firebaseConfigReady || !auth || !db) {
      setSyncMode("Local only");
      setSyncError("Firebase environment variables are not configured.");
      return;
    }

    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setSyncMode(user ? "Connecting" : "Local only");
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [loaded, members]);

  useEffect(() => {
    if (!currentUser) return;

    const membersQuery = query(membersCollectionRef(), orderBy("name", "asc"));

    const unsubscribe = onSnapshot(
      membersQuery,
      (snapshot) => {
        const firestoreMembers = snapshot.docs.map((documentSnapshot) =>
          cleanMember(
            {
              id: documentSnapshot.id,
              ...(documentSnapshot.data() as Partial<Member>),
            },
            documentSnapshot.id
          )
        );

        if (firestoreMembers.length > 0) {
          setMembers(sortMembers(firestoreMembers));
        }

        setSyncMode("Firestore synced");
        setSyncError("");
      },
      (error) => {
        console.error("Members Firestore sync failed:", error);
        setSyncMode("Firestore unavailable");
        setSyncError(error.message);
      }
    );

    return unsubscribe;
  }, [currentUser]);

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

  async function saveMember(member: Member) {
    setMembers((current) =>
      sortMembers(
        current.map((existingMember) =>
          existingMember.id === member.id ? member : existingMember
        )
      )
    );

    if (!currentUser || syncMode === "Firestore unavailable") return;

    await setDoc(
      memberDocRef(member.id),
      {
        ...toFirestoreData(member),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async function updateMember(id: string, patch: Partial<Member>) {
    const existingMember = members.find((member) => member.id === id);
    if (!existingMember) return;

    await saveMember({ ...existingMember, ...patch });
  }

  async function addMember() {
    const name = newName.trim();

    if (!name) return;

    const memberData: Omit<Member, "id"> = {
      name,
      phone: newPhone.trim(),
      role: "Member",
      status: "Active",
      monthlyContribution: settings.monthlyContribution,
      insurancePremium: settings.insurancePremium,
      joinDate: today(),
      notes: "",
    };

    if (currentUser && syncMode !== "Firestore unavailable") {
      const docRef = await addDoc(membersCollectionRef(), {
        ...memberData,
        groupId: CURRENT_GROUP_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setMembers((current) =>
        sortMembers([...current, { id: docRef.id, ...memberData }])
      );
    } else {
      setMembers((current) =>
        sortMembers([
          ...current,
          { id: `local-${Date.now()}`, ...memberData },
        ])
      );
    }

    setNewName("");
    setNewPhone("");
  }

  function clearFilters() {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
  }

  function resetLocalData() {
    const confirmed = window.confirm("Reset local members to starter data?");
    if (!confirmed) return;

    setMembers(starterMembers);
    clearFilters();
  }

  async function signInWithGoogle() {
    if (!auth) {
      setSyncError("Firebase Auth is not configured.");
      return;
    }

    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function signOutUser() {
    if (!auth) return;

    await signOut(auth);
    setCurrentUser(null);
    setSyncMode("Local only");
  }

  function exportCsv() {
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

  async function deleteMember(id: string) {
    const confirmed = window.confirm("Delete this member?");
    if (!confirmed) return;

    setMembers((current) => current.filter((member) => member.id !== id));

    if (!currentUser || syncMode === "Firestore unavailable") return;

    await deleteDoc(memberDocRef(id));
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
              Manage members, roles, status, contribution settings, insurance premiums, and Firestore-backed records.
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

            {currentUser ? (
              <button
                type="button"
                onClick={signOutUser}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                Sign in with Google
              </button>
            )}

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

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          <strong>Sync mode:</strong> {syncMode}
          {currentUser?.email ? ` as ${currentUser.email}` : " — not signed in"}
          {syncError ? (
            <span className="mt-1 block text-red-700">Firestore error: {syncError}</span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total members</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{members.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active members</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{activeMembers.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Officials</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{officials.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Expected monthly total</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {formatKes(expectedMonthlyTotal)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Active contributions + insurance</p>
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
              <option key={role} value={role}>{role}</option>
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
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Add member</h2>
            <p className="mt-1 text-sm text-slate-500">
              If signed in with permission, this saves to Firestore. Otherwise it remains local.
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
                        <option key={role} value={role}>{role}</option>
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
                        <option key={status} value={status}>{status}</option>
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
                        updateMember(member.id, { joinDate: event.target.value })
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
                          onClick={() => updateMember(member.id, { status: "Active" })}
                          disabled={!editMode}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateMember(member.id, { status: "Exited" })}
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







