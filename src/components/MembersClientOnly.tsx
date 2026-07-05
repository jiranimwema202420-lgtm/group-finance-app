"use client";

import dynamic from "next/dynamic";

const MembersClient = dynamic(() => import("@/components/MembersClient"), {
  ssr: false,
  loading: () => (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-700">
        Loading members register...
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Preparing local and Firestore member records.
      </p>
    </div>
  ),
});

export default function MembersClientOnly() {
  return <MembersClient />;
}
