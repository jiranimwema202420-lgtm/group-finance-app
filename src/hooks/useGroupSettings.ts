"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db, firebaseConfigReady } from "@/lib/firebase";
import {
  CURRENT_GROUP_ID,
  GROUP_SETTINGS_STORAGE_KEY,
  defaultGroupSettings,
  normalizeGroupSettings,
  type GroupSettings,
} from "@/lib/groupSettings";

export function useGroupSettings() {
  const [settings, setSettings] = useState<GroupSettings>(defaultGroupSettings);
  const [settingsSyncMode, setSettingsSyncMode] = useState("Local settings");
  const [settingsSyncError, setSettingsSyncError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(GROUP_SETTINGS_STORAGE_KEY);

    if (!saved) return;

    try {
      setSettings(normalizeGroupSettings(JSON.parse(saved) as Partial<GroupSettings>));
    } catch {
      setSettings(defaultGroupSettings);
    }
  }, []);

  useEffect(() => {
    if (!firebaseConfigReady || !auth || !db) {
      setSettingsSyncMode("Local settings");
      setSettingsSyncError("Firebase is not configured.");
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user || !db) {
        setSettingsSyncMode("Local settings — not signed in");
        return;
      }

      const firestore: Firestore = db;

      const unsubscribeSettings = onSnapshot(
        doc(firestore, "groups", CURRENT_GROUP_ID, "settings", "main"),
        (snapshot) => {
          if (snapshot.exists()) {
            const remoteSettings = normalizeGroupSettings(
              snapshot.data() as Partial<GroupSettings>
            );

            setSettings(remoteSettings);
            window.localStorage.setItem(
              GROUP_SETTINGS_STORAGE_KEY,
              JSON.stringify(remoteSettings)
            );
          }

          setSettingsSyncError("");
          setSettingsSyncMode(`Settings synced as ${user.email || user.uid}`);
        },
        (error) => {
          setSettingsSyncMode("Settings unavailable");
          setSettingsSyncError(error.message);
        }
      );

      return unsubscribeSettings;
    });

    return unsubscribeAuth;
  }, []);

  return {
    settings,
    settingsSyncMode,
    settingsSyncError,
  };
}
