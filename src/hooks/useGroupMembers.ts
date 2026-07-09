"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db, firebaseConfigReady } from "@/lib/firebase";
import { CURRENT_GROUP_ID } from "@/lib/groupSettings";

export type GroupMember = {
  id: string;
  memberNumber?: number;
  name: string;
  phone?: string;
  email?: string;
  role?: string;
  status?: string;
  monthlyContribution?: number;
  insurancePremium?: number;
  merryGoRound?: number;
  joinDate?: string;
  exitDate?: string;
  notes?: string;
};

const MEMBERS_CACHE_KEY = "jirani_group_members_v3";

function readText(value: unknown) {
  return String(value || "").trim();
}

function readNumber(value: unknown) {
  return Number(value || 0);
}

function normalizeMember(id: string, data: Record<string, unknown>): GroupMember {
  const name =
    readText(data.name) ||
    readText(data.memberName) ||
    readText(data.fullName) ||
    readText(data.displayName);

  return {
    id,
    memberNumber: readNumber(data.memberNumber),
    name,
    phone: readText(data.phone),
    email: readText(data.email),
    role: readText(data.role) || "Member",
    status: readText(data.status) || "Active",
    monthlyContribution: readNumber(data.monthlyContribution),
    insurancePremium: readNumber(data.insurancePremium),
    merryGoRound: readNumber(data.merryGoRound),
    joinDate: readText(data.joinDate),
    exitDate: readText(data.exitDate),
    notes: readText(data.notes),
  };
}

function readCachedMembers(): GroupMember[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(MEMBERS_CACHE_KEY);
    return saved ? (JSON.parse(saved) as GroupMember[]) : [];
  } catch {
    return [];
  }
}

function writeCachedMembers(members: GroupMember[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(MEMBERS_CACHE_KEY, JSON.stringify(members));
  } catch {
    // Ignore cache write failures.
  }
}

export function useGroupMembers() {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersSyncMode, setMembersSyncMode] = useState("Members loading");
  const [membersSyncError, setMembersSyncError] = useState("");

  useEffect(() => {
    const cachedMembers = readCachedMembers();

    if (cachedMembers.length > 0) {
      setMembers(cachedMembers);
      setMembersSyncMode(`Members loaded from cache: ${cachedMembers.length}`);
    }
  }, []);

  useEffect(() => {
    if (!firebaseConfigReady || !auth || !db) {
      setMembersSyncMode("Members unavailable — Firebase not configured");
      setMembersSyncError("Firebase is not configured.");
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user || !db) {
        setMembers([]);
        setMembersSyncMode("Members unavailable — not signed in");
        setMembersSyncError("");
        return;
      }

      const firestore: Firestore = db;

      const unsubscribeMembers = onSnapshot(
        collection(firestore, "groups", CURRENT_GROUP_ID, "members"),
        (snapshot) => {
          const nextMembers = snapshot.docs
            .map((memberDoc) =>
              normalizeMember(memberDoc.id, memberDoc.data())
            )
            .filter((member) => member.name.length > 0)
            .sort((a, b) => a.name.localeCompare(b.name));

          setMembers(nextMembers);
          writeCachedMembers(nextMembers);
          setMembersSyncError("");
          setMembersSyncMode(
            `Members synced as ${user.email || user.uid}: ${nextMembers.length}`
          );
        },
        (error) => {
          setMembersSyncError(error.message);
          setMembersSyncMode("Members sync error");
        }
      );

      return unsubscribeMembers;
    });

    return unsubscribeAuth;
  }, []);

  const activeMembers = useMemo(() => {
    return members
      .filter((member) => {
        const status = String(member.status || "Active").toLowerCase();
        return status !== "inactive" && status !== "exited";
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  return {
    members,
    activeMembers,
    membersSyncMode,
    membersSyncError,
  };
}
