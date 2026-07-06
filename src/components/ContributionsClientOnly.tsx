"use client";

import dynamic from "next/dynamic";

const ContributionsClient = dynamic(
  () => import("@/components/ContributionsClient"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-700">
          Loading contributions register...
        </p>
      </div>
    ),
  }
);

export default function ContributionsClientOnly() {
  return <ContributionsClient />;
}
