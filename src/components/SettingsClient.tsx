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
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, firebaseConfigReady } from "@/lib/firebase";

const CURRENT_GROUP_ID = "demo_group_01";
const STORAGE_KEY = "jirani_group_settings_v1";

type GroupSettings = {
  groupName: string;
  groupId: string;
  currency: string;
  monthlyContribution: number;
  insurancePremium: number;
  merryGoRound: number;
  adminNotes: string;
  roles: string;
};

const defaultSettings: GroupSettings = {
  groupName: "Jirani Mwema",
  groupId: CURRENT_GROUP_ID,
  currency: "KES",
  monthlyContribution: 200,
  insurancePremium: 750,
  merryGoRound: 1000,
  adminNotes:
    "Only Admins should update group settings. Treasurers handle contributions, payouts, and finance records.",
  roles: "ADMIN, TREASURER, CHAIRPERSON, MEMBER",
};

function money(currency: string, value: number) {
  return `${currency} ${Number(value || 0).toLocaleString("en-KE")}`;
}

function normalizeSettings(data: Partial<GroupSettings>): GroupSettings {
  return {
    groupName: data.groupName || defaultSettings.groupName,
    groupId: data.groupId || CURRENT_GROUP_ID,
    currency: data.currency || "KES",
    monthlyContribution: Number(
      data.monthlyContribution || defaultSettings.monthlyContribution
    ),
    insurancePremium: Number(
      data.insurancePremium || defaultSettings.insurancePremium
    ),
    merryGoRound: Number(data.merryGoRound || defaultSettings.merryGoRound),
    adminNotes: data.adminNotes || defaultSettings.adminNotes,
    roles: data.roles || defaultSettings.roles,
  };
}

export default function SettingsClient() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<GroupSettings>(defaultSettings);
  const [syncMode, setSyncMode] = useState("Local only");
  const [syncError, setSyncError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setSettings(normalizeSettings(JSON.parse(saved) as Partial<GroupSettings>));
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

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
    const settingsRef = doc(
      firestore,
      "groups",
      CURRENT_GROUP_ID,
      "settings",
      "main"
    );

    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings(
            normalizeSettings(snapshot.data() as Partial<GroupSettings>)
          );
        }

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

  function updateSetting<K extends keyof GroupSettings>(
    key: K,
    value: GroupSettings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveSettings() {
    setSyncError("");

    if (!firebaseConfigReady || !db || !currentUser) {
      setSyncError("Sign in as an admin before saving settings.");
      return;
    }

    const firestore: Firestore = db;

    setIsSaving(true);

    try {
      await setDoc(
        doc(firestore, "groups", CURRENT_GROUP_ID, "settings", "main"),
        {
          ...settings,
          groupId: CURRENT_GROUP_ID,
          updatedBy: currentUser.email || currentUser.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSyncMode(`Firestore synced as ${currentUser.email || currentUser.uid}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown Firestore error.";

      setSyncError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  const expectedMonthlyTotal =
    Number(settings.monthlyContribution || 0) +
    Number(settings.insurancePremium || 0) +
    Number(settings.merryGoRound || 0);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              App configuration
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Settings
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Manage default group amounts and governance settings used by the
              members, contributions, monthly splits, and reports modules.
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

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Monthly contribution</p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {money(settings.currency, settings.monthlyContribution)}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Insurance premium</p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {money(settings.currency, settings.insurancePremium)}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Merry-go-round</p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {money(settings.currency, settings.merryGoRound)}
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-bold text-emerald-800">Expected total</p>
          <p className="mt-2 text-2xl font-black text-emerald-900">
            {money(settings.currency, expectedMonthlyTotal)}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">
          Group defaults
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm font-bold text-slate-700">
            Group name
            <input
              value={settings.groupName}
              onChange={(event) => updateSetting("groupName", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700">
            Group ID
            <input
              value={settings.groupId}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700">
            Currency
            <input
              value={settings.currency}
              onChange={(event) => updateSetting("currency", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700">
            Default monthly contribution
            <input
              type="number"
              value={settings.monthlyContribution}
              onChange={(event) =>
                updateSetting("monthlyContribution", Number(event.target.value))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700">
            Default insurance premium
            <input
              type="number"
              value={settings.insurancePremium}
              onChange={(event) =>
                updateSetting("insurancePremium", Number(event.target.value))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700">
            Default merry-go-round
            <input
              type="number"
              value={settings.merryGoRound}
              onChange={(event) =>
                updateSetting("merryGoRound", Number(event.target.value))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700 md:col-span-2">
            Allowed roles
            <input
              value={settings.roles}
              onChange={(event) => updateSetting("roles", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-1 text-sm font-bold text-slate-700 md:col-span-2">
            Admin / Treasurer notes
            <textarea
              value={settings.adminNotes}
              onChange={(event) => updateSetting("adminNotes", event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveSettings}
            disabled={isSaving}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSaving ? "Saving..." : "Save settings"}
          </button>

          <button
            type="button"
            onClick={() => setSettings(defaultSettings)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Reset local defaults
          </button>
        </div>
      </section>
    </div>
  );
}
