"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db, firebaseConfigReady } from "@/lib/firebase";

const CURRENT_GROUP_ID = "demo_group_01";
const STORAGE_KEY = "jirani_contributions_register_v1";

type ContributionStatus = "Paid" | "Partial" | "Pending" | "Waived";

type MemberOption = {
  id: string;
  name: string;
  status: string;
};

type Contribution = {
  id: string;
  memberName: string;
  month: string;
  monthlyContribution: number;
  insurancePremium: number;
  merryGoRound: number;
  amountPaid: number;
  status: ContributionStatus;
  paymentMethod: string;
  reference: string;
  notes: string;
};

const emptyContribution: Contribution = {
  id: "",
  memberName: "",
  month: new Date().toISOString().slice(0, 7),
  monthlyContribution: 200,
  insurancePremium: 750,
  merryGoRound: 1000,
  amountPaid: 0,
  status: "Pending",
  paymentMethod: "M-Pesa",
  reference: "",
  notes: "",
};

function makeId() {
  return `contribution_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function money(value: number) {
  return `KES ${Number(value || 0).toLocaleString("en-KE")}`;
}

function contributionTotal(record: Contribution) {
  return (
    Number(record.monthlyContribution || 0) +
    Number(record.insurancePremium || 0) +
    Number(record.merryGoRound || 0)
  );
}

function normalizeContribution(data: Partial<Contribution>, fallbackId: string): Contribution {
  const monthlyContribution = Number(data.monthlyContribution || 0);
  const insurancePremium = Number(data.insurancePremium || 0);
  const merryGoRound = Number(data.merryGoRound || 0);
  const amountPaid = Number(data.amountPaid || 0);
  const expected = monthlyContribution + insurancePremium + merryGoRound;

  let status: ContributionStatus = data.status || "Pending";

  if (amountPaid >= expected && expected > 0) {
    status = "Paid";
  } else if (amountPaid > 0 && amountPaid < expected) {
    status = "Partial";
  } else if (amountPaid <= 0 && status !== "Waived") {
    status = "Pending";
  }

  return {
    id: data.id || fallbackId,
    memberName: data.memberName || "",
    month: data.month || new Date().toISOString().slice(0, 7),
    monthlyContribution,
    insurancePremium,
    merryGoRound,
    amountPaid,
    status,
    paymentMethod: data.paymentMethod || "M-Pesa",
    reference: data.reference || "",
    notes: data.notes || "",
  };
}

export default function ContributionsClient() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncMode, setSyncMode] = useState("Local only");
  const [syncError, setSyncError] = useState("");
  const [records, setRecords] = useState<Contribution[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [form, setForm] = useState<Contribution>(emptyContribution);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<Contribution>[];
        if (Array.isArray(parsed)) {
          setRecords(parsed.map((item, index) => normalizeContribution(item, item.id || `local_${index + 1}`)));
        }
      } catch {
        setRecords([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (!firebaseConfigReady || !auth || !db) {
      setSyncMode("Local only");
      setSyncError("Firebase is not configured.");
      return;
    }

    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setSyncMode(user ? `Connecting as ${user.email || user.uid}` : "Local only — not signed in");
    });
  }, []);

  useEffect(() => {
    if (!firebaseConfigReady || !db || !currentUser) return;

    const firestore: Firestore = db;

    const contributionsQuery = query(
      collection(firestore, "groups", CURRENT_GROUP_ID, "contributions"),
      orderBy("month", "desc")
    );

    const unsubscribe = onSnapshot(
      contributionsQuery,
      (snapshot) => {
        const firestoreRecords = snapshot.docs.map((item) =>
          normalizeContribution(
            {
              ...(item.data() as Partial<Contribution>),
              id: item.id,
            },
            item.id
          )
        );

        setRecords(firestoreRecords);
        setSyncError("");
        setSyncMode(`Firestore synced as ${currentUser.email || currentUser.uid}`);
      },
      (error) => {
        setSyncMode("Firestore unavailable");
        setSyncError(error.message);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (!firebaseConfigReady || !db || !currentUser) return;

    const firestore: Firestore = db;

    const membersQuery = query(
      collection(firestore, "groups", CURRENT_GROUP_ID, "members"),
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(
      membersQuery,
      (snapshot) => {
        const firestoreMembers = snapshot.docs
          .map((item) => {
            const data = item.data() as Partial<MemberOption>;

            return {
              id: item.id,
              name: data.name || "",
              status: data.status || "Active",
            };
          })
          .filter((member) => member.name.trim().length > 0)
          .sort((a, b) => a.name.localeCompare(b.name));

        setMembers(firestoreMembers);
      },
      (error) => {
        setSyncError(error.message);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const activeMembers = useMemo(() => {
    return members.filter((member) => member.status !== "Exited");
  }, [members]);

  const memberNames = useMemo(() => {
    return activeMembers.map((member) => member.name);
  }, [activeMembers]);

  const monthOptions = useMemo(() => {
    const months = Array.from(new Set(records.map((record) => record.month))).filter(Boolean);
    return ["All", ...months.sort().reverse()];
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        const matchesSearch = record.memberName.toLowerCase().includes(search.toLowerCase());
        const matchesMonth = monthFilter === "All" || record.month === monthFilter;
        const matchesStatus = statusFilter === "All" || record.status === statusFilter;

        return matchesSearch && matchesMonth && matchesStatus;
      })
      .sort((a, b) => a.memberName.localeCompare(b.memberName));
  }, [records, search, monthFilter, statusFilter]);

  const summary = useMemo(() => {
    return filteredRecords.reduce(
      (totals, record) => {
        totals.expected += contributionTotal(record);
        totals.paid += Number(record.amountPaid || 0);
        totals.balance += Math.max(contributionTotal(record) - Number(record.amountPaid || 0), 0);
        return totals;
      },
      { expected: 0, paid: 0, balance: 0 }
    );
  }, [filteredRecords]);

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
    setSyncMode("Local only — not signed in");
  }

  async function saveContribution() {
    const cleanRecord = normalizeContribution(
      {
        ...form,
        id: form.id || makeId(),
      },
      form.id || makeId()
    );

    if (!cleanRecord.memberName.trim()) {
      setSyncError("Member name is required.");
      return;
    }

    setSyncError("");

    if (firebaseConfigReady && db && currentUser) {
      const firestore: Firestore = db;

      await setDoc(
        doc(firestore, "groups", CURRENT_GROUP_ID, "contributions", cleanRecord.id),
        {
          ...cleanRecord,
          groupId: CURRENT_GROUP_ID,
          updatedBy: currentUser.email || currentUser.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      setRecords((current) => {
        const exists = current.some((record) => record.id === cleanRecord.id);

        if (exists) {
          return current.map((record) => (record.id === cleanRecord.id ? cleanRecord : record));
        }

        return [cleanRecord, ...current];
      });
    }

    setForm(emptyContribution);
  }

  function editContribution(record: Contribution) {
    setForm(record);
  }

  async function removeContribution(id: string) {
    if (!confirm("Delete this contribution record?")) return;

    if (firebaseConfigReady && db && currentUser) {
      const firestore: Firestore = db;
      await deleteDoc(doc(firestore, "groups", CURRENT_GROUP_ID, "contributions", id));
    } else {
      setRecords((current) => current.filter((record) => record.id !== id));
    }
  }

  function updateForm<K extends keyof Contribution>(key: K, value: Contribution[K]) {
    setForm((current) => normalizeContribution({ ...current, [key]: value }, current.id || ""));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              Group operations
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Contributions
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Track monthly member contributions, insurance premiums, merry-go-round payments,
              arrears, and payment references.
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
              Sync mode: {syncMode}
              {syncError ? (
                <span className="mt-1 block text-red-600">Firestore error: {syncError}</span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Expected</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{money(summary.expected)}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Paid</p>
          <p className="mt-2 text-2xl font-black text-emerald-700">{money(summary.paid)}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Balance</p>
          <p className="mt-2 text-2xl font-black text-red-700">{money(summary.balance)}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">
          {form.id ? "Edit contribution" : "Add contribution"}
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm font-bold text-slate-700">
            Member
            <select
              value={form.memberName}
              onChange={(event) => updateForm("memberName", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              <option value="">
                {memberNames.length > 0 ? "Select member" : "No members loaded"}
              </option>
              {memberNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700">
            Month
            <input
              type="month"
              value={form.month}
              onChange={(event) => updateForm("month", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700">
            Amount paid
            <input
              type="number"
              value={form.amountPaid}
              onChange={(event) => updateForm("amountPaid", Number(event.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700">
            Monthly contribution
            <input
              type="number"
              value={form.monthlyContribution}
              onChange={(event) => updateForm("monthlyContribution", Number(event.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700">
            Insurance premium
            <input
              type="number"
              value={form.insurancePremium}
              onChange={(event) => updateForm("insurancePremium", Number(event.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700">
            Merry-go-round
            <input
              type="number"
              value={form.merryGoRound}
              onChange={(event) => updateForm("merryGoRound", Number(event.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700">
            Payment method
            <input
              value={form.paymentMethod}
              onChange={(event) => updateForm("paymentMethod", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700">
            Reference
            <input
              value={form.reference}
              onChange={(event) => updateForm("reference", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="M-Pesa code"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700">
            Notes
            <input
              value={form.notes}
              onChange={(event) => updateForm("notes", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveContribution}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            {form.id ? "Save changes" : "Add contribution"}
          </button>

          {form.id ? (
            <button
              type="button"
              onClick={() => setForm(emptyContribution)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-black text-slate-950">
            Contribution records
          </h2>

          <div className="flex flex-col gap-2 md:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search member..."
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />

            <select
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              {["All", "Paid", "Partial", "Pending", "Waived"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[1000px] w-full border-separate border-spacing-y-2 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Member</th>
                <th className="px-3 py-2">Month</th>
                <th className="px-3 py-2">Expected</th>
                <th className="px-3 py-2">Paid</th>
                <th className="px-3 py-2">Balance</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Reference</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="rounded-2xl bg-slate-50 px-3 py-6 text-center text-slate-500">
                    No contribution records yet.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const expected = contributionTotal(record);
                  const balance = Math.max(expected - record.amountPaid, 0);

                  return (
                    <tr key={record.id} className="bg-slate-50">
                      <td className="rounded-l-2xl px-3 py-3 font-bold text-slate-900">
                        {record.memberName}
                      </td>
                      <td className="px-3 py-3">{record.month}</td>
                      <td className="px-3 py-3">{money(expected)}</td>
                      <td className="px-3 py-3 font-bold text-emerald-700">{money(record.amountPaid)}</td>
                      <td className="px-3 py-3 font-bold text-red-700">{money(balance)}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">
                          {record.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">{record.reference || "—"}</td>
                      <td className="rounded-r-2xl px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editContribution(record)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeContribution(record.id)}
                            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

