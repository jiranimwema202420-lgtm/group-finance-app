"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, firebaseConfigReady } from "@/lib/firebase";

const CURRENT_GROUP_ID = "demo_group_01";
const STORAGE_KEY = "jirani_members_register_v1";

type LocalMember = {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
  status?: string;
  joinDate?: string;
  exitDate?: string;
  notes?: string;
  monthlyContribution?: number;
  insurancePremium?: number;
  merryGoRound?: number;
};

function makeSafeMember(member: LocalMember, index: number) {
  const safeId = member.id || `member_${String(index + 1).padStart(3, "0")}`;

  return {
    id: safeId,
    name: member.name || `Member ${String(index + 1).padStart(2, "0")}`,
    phone: member.phone || "",
    email: member.email || "",
    role: member.role || "MEMBER",
    status: member.status || "Active",
    joinDate: member.joinDate || "",
    exitDate: member.exitDate || "",
    notes: member.notes || "",
    monthlyContribution: Number(member.monthlyContribution || 200),
    insurancePremium: Number(member.insurancePremium || 750),
    merryGoRound: Number(member.merryGoRound || 1000),
    groupId: CURRENT_GROUP_ID,
    updatedAt: serverTimestamp(),
  };
}

export default function MembersSeedPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [message, setMessage] = useState("Checking Firebase Auth...");
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!firebaseConfigReady || !auth || !db) {
      setMessage("Firebase is not configured.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setMessage(
        user
          ? `Signed in as ${user.email || user.uid}. Ready.`
          : "Not signed in. Click Sign in with Google."
      );
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    if (!auth) {
      setMessage("Firebase Auth is not configured.");
      return;
    }

    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown sign-in error.";

      setMessage(`Sign-in failed: ${errorMessage}`);
    }
  }

  async function signOutUser() {
    if (!auth) return;
    await signOut(auth);
  }

  async function seedFromLocalStorage() {
    if (!db) {
      setMessage("Firestore is not configured.");
      return;
    }

    const firestore: Firestore = db;

    if (!currentUser) {
      setMessage("Sign in first before seeding members.");
      return;
    }

    const rawMembers = window.localStorage.getItem(STORAGE_KEY);

    if (!rawMembers) {
      setMessage("No local members found in this browser. Open /members first, then return here.");
      return;
    }

    let parsedMembers: LocalMember[];

    try {
      parsedMembers = JSON.parse(rawMembers);
    } catch {
      setMessage("Local members data is invalid JSON.");
      return;
    }

    if (!Array.isArray(parsedMembers) || parsedMembers.length === 0) {
      setMessage("No local members found to seed.");
      return;
    }

    setIsSeeding(true);
    setMessage(`Seeding ${parsedMembers.length} members...`);

    try {
      await Promise.all(
        parsedMembers.map((member, index) => {
          const cleaned = makeSafeMember(member, index);

          return setDoc(
            doc(firestore, "groups", CURRENT_GROUP_ID, "members", cleaned.id),
            {
              ...cleaned,
              seededBy: currentUser.email || currentUser.uid,
              seededAt: serverTimestamp(),
            },
            { merge: true }
          );
        })
      );

      setMessage(`Done. Seeded ${parsedMembers.length} members to Firestore.`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown Firestore error.";

      setMessage(`Seed failed: ${errorMessage}`);
    } finally {
      setIsSeeding(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
          Temporary admin tool
        </p>

        <h1 className="mt-3 text-2xl font-black text-slate-950">
          Seed Local Members to Firestore
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          This page copies members from this browser&apos;s localStorage into
          Firestore under groups/demo_group_01/members.
        </p>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          {message}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {currentUser ? (
            <>
              <button
                type="button"
                onClick={seedFromLocalStorage}
                disabled={isSeeding}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSeeding ? "Seeding..." : "Seed members now"}
              </button>

              <button
                type="button"
                onClick={signOutUser}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Sign out
              </button>
            </>
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
    </main>
  );
}
