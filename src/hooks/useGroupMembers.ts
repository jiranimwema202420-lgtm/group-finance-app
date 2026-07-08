"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
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

const MEMBERS_CACHE_KEY = "jirani_group_members_v1";

function normalizeMember(id: string, data: Partial<GroupMember>): GroupMember {
  return {
    id,
    memberNumber: Number(data.memberNumber || 0),
    name: String(data.name || "").trim(),
    phone: String(data.phone || "").trim(),
    email: String(data.email || "").trim(),
    role: String(data.role || "Member").trim(),
    status: String(data.status || "Active").trim(),
    monthlyContribution: Number(data.monthlyContribution || 0),
    insurancePremium: Number(data.insurancePremium || 0),
    merryGoRound: Number(data.merryGoRound || 0),
    joinDate: String(data.joinDate || "").trim(),
    exitDate: String(data.exitDate || "").trim(),
    notes: String(data.notes || "").trim(),
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
    // Ignore localStorage failures.
  }
}

export function useGroupMembers() {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersSyncMode, setMembersSyncMode] = useState("Local members");
  const [membersSyncError, setMembersSyncError] = useState("");

  useEffect(() => {
    const cachedMembers = readCachedMembers();

    if (cachedMembers.length > 0) {
      setMembers(cachedMembers);
    }
  }, []);

  useEffect(() => {
    if (!firebaseConfigReady || !auth || !db) {
      setMembersSyncMode("Local members — Firebase not configured");
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user || !db) {
        setMembersSyncMode("Local members — not signed in");
        return;
      }

      const firestore: Firestore = db;

      const membersQuery = query(
        collection(firestore, "groups", CURRENT_GROUP_ID, "members"),
        orderBy("name", "asc")
      );

      const unsubscribeMembers = onSnapshot(
        membersQuery,
        (snapshot) => {
          const nextMembers = snapshot.docs
            .map((memberDoc) =>
              normalizeMember(memberDoc.id, memberDoc.data() as Partial<GroupMember>)
            )
            .filter((member) => member.name.length > 0)
            .sort((a, b) => a.name.localeCompare(b.name));

          setMembers(nextMembers);
          writeCachedMembers(nextMembers);
          setMembersSyncError("");
          setMembersSyncMode(`Members synced as ${user.email || user.uid}`);
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

  const activeMembers = useMemo(
    () =>
      members
        .filter((member) => member.status !== "Inactive" && member.status !== "Exited")
        .sort((a, b) => a.name.localeCompare(b.name)),
    [members]
  );

  return {
    members,
    activeMembers,
    membersSyncMode,
    membersSyncError,
  };
}
