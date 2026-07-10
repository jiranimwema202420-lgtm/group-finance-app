"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db, firebaseConfigReady } from "@/lib/firebase";
import { CURRENT_GROUP_ID } from "@/lib/groupSettings";
import {
  cacheMembers,
  isActiveMember,
  normalizeGroupMember,
  readCachedMembers,
  sortMembersByName,
  type GroupMember,
} from "@/lib/groupMembers";

export function useGroupMembers() {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersSyncMode, setMembersSyncMode] = useState("Members loading");
  const [membersSyncError, setMembersSyncError] = useState("");
  const [membersLoadedAt, setMembersLoadedAt] = useState("");

  useEffect(() => {
    const cachedMembers = readCachedMembers();

    if (cachedMembers.length > 0) {
      const sortedMembers = sortMembersByName(cachedMembers);
      setMembers(sortedMembers);
      setMembersSyncMode(`Members loaded from cache: ${sortedMembers.length}`);
      setMembersLoadedAt(new Date().toLocaleTimeString());
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
        setMembersSyncMode("Members unavailable — not signed in");
        setMembersSyncError("");
        return;
      }

      const firestore: Firestore = db;

      const unsubscribeMembers = onSnapshot(
        collection(firestore, "groups", CURRENT_GROUP_ID, "members"),
        (snapshot) => {
          const nextMembers = sortMembersByName(
            snapshot.docs
              .map((memberDoc) =>
                normalizeGroupMember(memberDoc.id, memberDoc.data())
              )
              .filter((member) => member.name.length > 0)
          );

          setMembers(nextMembers);
          cacheMembers(nextMembers);
          setMembersSyncError("");
          setMembersLoadedAt(new Date().toLocaleTimeString());
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
    return sortMembersByName(members.filter(isActiveMember));
  }, [members]);

  const memberById = useMemo(() => {
    return new Map(members.map((member) => [member.id, member]));
  }, [members]);

  const memberNameById = useMemo(() => {
    return new Map(members.map((member) => [member.id, member.name]));
  }, [members]);

  return {
    members,
    activeMembers,
    memberById,
    memberNameById,
    membersSyncMode,
    membersSyncError,
    membersLoadedAt,
  };
}
