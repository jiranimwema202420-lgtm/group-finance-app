"use client";

import dynamic from "next/dynamic";

const SettingsClient = dynamic(() => import("@/components/SettingsClient"), {
  ssr: false,
  loading: () => (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-700">
        Loading settings...
      </p>
    </div>
  ),
});

export default function SettingsClientOnly() {
  return <SettingsClient />;
}
