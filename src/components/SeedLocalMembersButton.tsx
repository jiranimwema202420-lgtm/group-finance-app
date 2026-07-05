"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
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

function cleanMember(member: LocalMember, index: number) {
  const safeId =
    member.id ||
    `member_${String(index + 1).padStart(3, "0")}_${Date.now()}`;

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

export default function SeedLocalMembersButton() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!firebaseConfigReady || !auth) {
      setMessage("Firebase is not configured.");
      return;
    }

    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
  }, []);

  async function seedMembers() {
    setMessage("");

    if (!firebaseConfigReady || !db) {
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
      setMessage("No local members found to seed.");
      return;
    }

    let parsedMembers: LocalMember[];

    try {
      parsedMembers = JSON.parse(rawMembers);
    } catch {
      setMessage("Could not read local members. The stored data is invalid.");
      return;
    }

    if (!Array.isArray(parsedMembers) || parsedMembers.length === 0) {
      setMessage("No local members found to seed.");
      return;
    }

    setIsSeeding(true);

    try {
      const writes = parsedMembers.map((member, index) => {
        const cleaned = cleanMember(member, index);

        return setDoc(
          doc(firestore, "groups", CURRENT_GROUP_ID, "members", cleaned.id),
          {
            ...cleaned,
            seededBy: currentUser.email || currentUser.uid,
            seededAt: serverTimestamp(),
          },
          { merge: true }
        );
      });

      await Promise.all(writes);

      setMessage(`Seeded ${parsedMembers.length} members to Firestore.`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown Firestore error.";

      setMessage(`Seed failed: ${errorMessage}`);
    } finally {
      setIsSeeding(false);
    }
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-amber-900">
            Firestore seed tool
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Use once to copy the current local members register into Firestore.
          </p>
          {message ? (
            <p className="mt-2 text-sm font-semibold text-amber-950">
              {message}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={seedMembers}
          disabled={isSeeding || !currentUser}
          className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
        >
          {isSeeding ? "Seeding..." : "Seed local members"}
        </button>
      </div>
    </div>
  );
}
