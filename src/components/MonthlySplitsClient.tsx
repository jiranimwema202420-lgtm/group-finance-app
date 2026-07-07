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
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { auth, db, firebaseConfigReady } from "@/lib/firebase";

const CURRENT_GROUP_ID = "demo_group_01";
const MEMBERS_STORAGE_KEY = "jirani_members_register_v1";
const CONTRIBUTIONS_STORAGE_KEY = "jirani_contributions_register_v1";

type PaymentStatus = "All" | "Paid" | "Partial" | "Pending" | "Overpaid";

type Member = {
  id: string;
  name: string;
  status: string;
  monthlyContribution: number;
  insurancePremium: number;
  merryGoRound: number;
};

type Contribution = {
  id: string;
  memberName: string;
  month: string;
  monthlyContribution: number;
  insurancePremium: number;
  merryGoRound: number;
  amountPaid: number;
  status: string;
  reference?: string;
  paymentMethod?: string;
};

type SplitRow = Member & {
  expected: number;
  paid: number;
  balance: number;
  overpaid: number;
  progress: number;
  paymentStatus: Exclude<PaymentStatus, "All">;
  contributionCount: number;
};

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function money(value: number) {
  return `KES ${Number(value || 0).toLocaleString("en-KE")}`;
}

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function csvEscape(value: string | number) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function normalizeMember(data: Partial<Member>, fallbackId: string): Member {
  return {
    id: data.id || fallbackId,
    name: data.name || "",
    status: data.status || "Active",
    monthlyContribution: Number(data.monthlyContribution || 200),
    insurancePremium: Number(data.insurancePremium || 750),
    merryGoRound: Number(data.merryGoRound || 1000),
  };
}

function normalizeContribution(
  data: Partial<Contribution>,
  fallbackId: string
): Contribution {
  return {
    id: data.id || fallbackId,
    memberName: data.memberName || "",
    month: data.month || currentMonth(),
    monthlyContribution: Number(data.monthlyContribution || 200),
    insurancePremium: Number(data.insurancePremium || 750),
    merryGoRound: Number(data.merryGoRound || 1000),
    amountPaid: Number(data.amountPaid || 0),
    status: data.status || "Pending",
    reference: data.reference || "",
    paymentMethod: data.paymentMethod || "",
  };
}

function getPaymentStatus(
  expected: number,
  paid: number
): Exclude<PaymentStatus, "All"> {
  if (paid > expected && expected > 0) return "Overpaid";
  if (paid >= expected && expected > 0) return "Paid";
  if (paid > 0 && paid < expected) return "Partial";
  return "Pending";
}

export default function MonthlySplitsClient() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncMode, setSyncMode] = useState("Local only");
  const [syncError, setSyncError] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [month, setMonth] = useState(currentMonth());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>("All");

  useEffect(() => {
    const savedMembers = window.localStorage.getItem(MEMBERS_STORAGE_KEY);

    if (savedMembers) {
      try {
        const parsedMembers = JSON.parse(savedMembers) as Partial<Member>[];

        if (Array.isArray(parsedMembers)) {
          setMembers(
            parsedMembers
              .map((item, index) =>
                normalizeMember(item, item.id || `local_member_${index + 1}`)
              )
              .filter((member) => member.name.trim().length > 0)
              .sort((a, b) => a.name.localeCompare(b.name))
          );
        }
      } catch {
        setMembers([]);
      }
    }

    const savedContributions = window.localStorage.getItem(
      CONTRIBUTIONS_STORAGE_KEY
    );

    if (savedContributions) {
      try {
        const parsedContributions = JSON.parse(
          savedContributions
        ) as Partial<Contribution>[];

        if (Array.isArray(parsedContributions)) {
          setContributions(
            parsedContributions.map((item, index) =>
              normalizeContribution(
                item,
                item.id || `local_contribution_${index + 1}`
              )
            )
          );
        }
      } catch {
        setContributions([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!firebaseConfigReady || !auth || !db) {
      setSyncMode("Local only");
      setSyncError("Firebase is not configured.");
      return;
    }

    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setSyncMode(
        user
          ? `Connecting as ${user.email || user.uid}`
          : "Local only — not signed in"
      );
    });
  }, []);

  useEffect(() => {
    if (!firebaseConfigReady || !db || !currentUser) return;

    const firestore: Firestore = db;

    const membersQuery = query(
      collection(firestore, "groups", CURRENT_GROUP_ID, "members"),
      orderBy("name", "asc")
    );

    const unsubscribeMembers = onSnapshot(
      membersQuery,
      (snapshot) => {
        const firestoreMembers = snapshot.docs
          .map((item) =>
            normalizeMember(
              {
                ...(item.data() as Partial<Member>),
                id: item.id,
              },
              item.id
            )
          )
          .filter((member) => member.name.trim().length > 0)
          .sort((a, b) => a.name.localeCompare(b.name));

        setMembers(firestoreMembers);
        setSyncError("");
        setSyncMode(`Firestore synced as ${currentUser.email || currentUser.uid}`);
      },
      (error) => {
        setSyncMode("Firestore unavailable");
        setSyncError(error.message);
      }
    );

    const contributionsQuery = query(
      collection(firestore, "groups", CURRENT_GROUP_ID, "contributions"),
      orderBy("month", "desc")
    );

    const unsubscribeContributions = onSnapshot(
      contributionsQuery,
      (snapshot) => {
        setContributions(
          snapshot.docs.map((item) =>
            normalizeContribution(
              {
                ...(item.data() as Partial<Contribution>),
                id: item.id,
              },
              item.id
            )
          )
        );
      },
      (error) => {
        setSyncError(error.message);
      }
    );

    return () => {
      unsubscribeMembers();
      unsubscribeContributions();
    };
  }, [currentUser]);

  const activeMembers = useMemo(() => {
    return members.filter((member) => member.status.toLowerCase() !== "exited");
  }, [members]);

  const rows = useMemo<SplitRow[]>(() => {
    return activeMembers
      .map((member) => {
        const expected =
          Number(member.monthlyContribution || 0) +
          Number(member.insurancePremium || 0) +
          Number(member.merryGoRound || 0);

        const memberContributions = contributions.filter(
          (contribution) =>
            contribution.month === month &&
            normalizeName(contribution.memberName) === normalizeName(member.name)
        );

        const paid = memberContributions.reduce(
          (total, contribution) => total + Number(contribution.amountPaid || 0),
          0
        );

        const balance = Math.max(expected - paid, 0);
        const overpaid = Math.max(paid - expected, 0);
        const progress = expected > 0 ? Math.min((paid / expected) * 100, 100) : 0;
        const paymentStatus = getPaymentStatus(expected, paid);

        return {
          ...member,
          expected,
          paid,
          balance,
          overpaid,
          progress,
          paymentStatus,
          contributionCount: memberContributions.length,
        };
      })
      .filter((row) => {
        const matchesSearch = row.name
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "All" || row.paymentStatus === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeMembers, contributions, month, search, statusFilter]);

  const summary = useMemo(() => {
    return rows.reduce(
      (totals, row) => {
        totals.members += 1;
        totals.expected += row.expected;
        totals.paid += row.paid;
        totals.balance += row.balance;
        totals.overpaid += row.overpaid;

        if (row.paymentStatus === "Paid") totals.paidMembers += 1;
        if (row.paymentStatus === "Partial") totals.partialMembers += 1;
        if (row.paymentStatus === "Pending") totals.pendingMembers += 1;
        if (row.paymentStatus === "Overpaid") totals.overpaidMembers += 1;

        return totals;
      },
      {
        members: 0,
        expected: 0,
        paid: 0,
        balance: 0,
        overpaid: 0,
        paidMembers: 0,
        partialMembers: 0,
        pendingMembers: 0,
        overpaidMembers: 0,
      }
    );
  }, [rows]);

  const collectionRate =
    summary.expected > 0
      ? Math.min((summary.paid / summary.expected) * 100, 100)
      : 0;

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

  function exportCsv() {
    const header = [
      "#",
      "Member",
      "Month",
      "Monthly Contribution",
      "Insurance Premium",
      "Merry-go-round",
      "Expected",
      "Paid",
      "Balance",
      "Overpaid",
      "Status",
      "Contribution Records",
    ];

    const body = rows.map((row, index) => [
      index + 1,
      row.name,
      month,
      row.monthlyContribution,
      row.insurancePremium,
      row.merryGoRound,
      row.expected,
      row.paid,
      row.balance,
      row.overpaid,
      row.paymentStatus,
      row.contributionCount,
    ]);

    const csv = [header, ...body]
      .map((line) => line.map(csvEscape).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `jirani-monthly-splits-${month}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
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
              Monthly Splits
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              View each active member&apos;s expected monthly obligation, paid
              amount, arrears, overpayments, and collection status.
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
              Sync mode: {syncMode}
              {syncError ? (
                <span className="mt-1 block text-red-600">
                  Firestore error: {syncError}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Export CSV
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
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Members</p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {summary.members}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Expected</p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {money(summary.expected)}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Paid</p>
          <p className="mt-2 text-2xl font-black text-emerald-700">
            {money(summary.paid)}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Balance</p>
          <p className="mt-2 text-2xl font-black text-red-700">
            {money(summary.balance)}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Collection rate</p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {collectionRate.toFixed(1)}%
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm font-bold text-emerald-800">Paid members</p>
          <p className="mt-1 text-xl font-black text-emerald-900">
            {summary.paidMembers}
          </p>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-800">Partial members</p>
          <p className="mt-1 text-xl font-black text-amber-900">
            {summary.partialMembers}
          </p>
        </div>

        <div className="rounded-3xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-800">Pending members</p>
          <p className="mt-1 text-xl font-black text-red-900">
            {summary.pendingMembers}
          </p>
        </div>

        <div className="rounded-3xl border border-sky-100 bg-sky-50 p-4">
          <p className="text-sm font-bold text-sky-800">Overpaid members</p>
          <p className="mt-1 text-xl font-black text-sky-900">
            {summary.overpaidMembers}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-black text-slate-950">
            Monthly member breakdown
          </h2>

          <div className="flex flex-col gap-2 md:flex-row">
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search member..."
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as PaymentStatus)
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              {["All", "Paid", "Partial", "Pending", "Overpaid"].map(
                (status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[1100px] w-full border-separate border-spacing-y-2 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Member</th>
                <th className="px-3 py-2">Contribution</th>
                <th className="px-3 py-2">Insurance</th>
                <th className="px-3 py-2">Merry-go-round</th>
                <th className="px-3 py-2">Expected</th>
                <th className="px-3 py-2">Paid</th>
                <th className="px-3 py-2">Balance</th>
                <th className="px-3 py-2">Overpaid</th>
                <th className="px-3 py-2">Records</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="rounded-2xl bg-slate-50 px-3 py-6 text-center text-slate-500"
                  >
                    No members found for this view.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.id} className="bg-slate-50">
                    <td className="rounded-l-2xl px-3 py-3 font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-900">
                      {row.name}
                      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200">
                        <div
                          className="h-1.5 rounded-full bg-emerald-600"
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3">{money(row.monthlyContribution)}</td>
                    <td className="px-3 py-3">{money(row.insurancePremium)}</td>
                    <td className="px-3 py-3">{money(row.merryGoRound)}</td>
                    <td className="px-3 py-3 font-bold text-slate-900">
                      {money(row.expected)}
                    </td>
                    <td className="px-3 py-3 font-bold text-emerald-700">
                      {money(row.paid)}
                    </td>
                    <td className="px-3 py-3 font-bold text-red-700">
                      {money(row.balance)}
                    </td>
                    <td className="px-3 py-3 font-bold text-sky-700">
                      {money(row.overpaid)}
                    </td>
                    <td className="px-3 py-3">{row.contributionCount}</td>
                    <td className="rounded-r-2xl px-3 py-3">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">
                        {row.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
