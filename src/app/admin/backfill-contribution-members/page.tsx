"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db, firebaseConfigReady } from "@/lib/firebase";
import { CURRENT_GROUP_ID } from "@/lib/groupSettings";

type MemberRecord = {
  id: string;
  name: string;
};

type ContributionRecord = {
  id: string;
  memberId?: string;
  memberName?: string;
};

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function BackfillContributionMembersPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [status, setStatus] = useState("Waiting for sign in...");
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [updatedCount, setUpdatedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);

  useEffect(() => {
    if (!firebaseConfigReady || !auth || !db) {
      setStatus("Firebase is not configured.");
      return;
    }

    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setStatus(user ? `Signed in as ${user.email || user.uid}` : "Not signed in.");
    });
  }, []);

  const memberByName = useMemo(() => {
    return new Map(members.map((member) => [normalizeName(member.name), member]));
  }, [members]);

  async function loadData() {
    if (!db || !currentUser) {
      setStatus("Sign in first.");
      return;
    }

    const firestore: Firestore = db;
    setStatus("Loading members and contributions...");

    const membersSnapshot = await getDocs(
      collection(firestore, "groups", CURRENT_GROUP_ID, "members")
    );

    const nextMembers = membersSnapshot.docs
      .map((memberDoc) => {
        const data = memberDoc.data();

        return {
          id: memberDoc.id,
          name: String(data.name || "").trim(),
        };
      })
      .filter((member) => member.name.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    const contributionsSnapshot = await getDocs(
      collection(firestore, "groups", CURRENT_GROUP_ID, "contributions")
    );

    const nextContributions = contributionsSnapshot.docs.map((contributionDoc) => {
      const data = contributionDoc.data();

      return {
        id: contributionDoc.id,
        memberId: String(data.memberId || "").trim(),
        memberName: String(data.memberName || "").trim(),
      };
    });

    setMembers(nextMembers);
    setContributions(nextContributions);
    setStatus(
      `Loaded ${nextMembers.length} members and ${nextContributions.length} contributions.`
    );
  }

  async function backfillMemberIds() {
    if (!db || !currentUser) {
      setStatus("Sign in first.");
      return;
    }

    const firestore: Firestore = db;
    let updated = 0;
    let skipped = 0;

    setStatus("Backfilling contribution member IDs...");

    for (const contribution of contributions) {
      if (contribution.memberId) {
        skipped += 1;
        continue;
      }

      const memberName = contribution.memberName || "";
      const matchedMember = memberByName.get(normalizeName(memberName));

      if (!matchedMember) {
        skipped += 1;
        continue;
      }

      await updateDoc(
        doc(firestore, "groups", CURRENT_GROUP_ID, "contributions", contribution.id),
        {
          memberId: matchedMember.id,
          memberName: matchedMember.name,
          updatedBy: currentUser.email || currentUser.uid,
          updatedAt: serverTimestamp(),
        }
      );

      updated += 1;
    }

    setUpdatedCount(updated);
    setSkippedCount(skipped);
    setStatus(`Backfill complete. Updated ${updated}. Skipped ${skipped}.`);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
          Admin migration
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Backfill Contribution Member IDs
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          This one-time tool links old contribution records to Firestore members by matching
          member names.
        </p>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          {status}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadData}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
          >
            Load data
          </button>

          <button
            type="button"
            onClick={backfillMemberIds}
            disabled={members.length === 0 || contributions.length === 0}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300"
          >
            Backfill member IDs
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-500">Members</p>
          <p className="mt-2 text-2xl font-black">{members.length}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-500">Contributions</p>
          <p className="mt-2 text-2xl font-black">{contributions.length}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-500">Updated</p>
          <p className="mt-2 text-2xl font-black text-emerald-700">{updatedCount}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-500">Skipped</p>
          <p className="mt-2 text-2xl font-black text-red-700">{skippedCount}</p>
        </div>
      </section>
    </main>
  );
}
