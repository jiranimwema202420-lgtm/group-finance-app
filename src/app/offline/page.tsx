"use client";

import React from "react";

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.24),_transparent_34%),linear-gradient(135deg,#020617,#0f172a_48%,#111827)] px-4 text-slate-100">
      <section className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 text-center shadow-2xl shadow-black/30 ring-1 ring-white/10 backdrop-blur-2xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-400/15 text-sm font-black text-cyan-100">JM</div>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-white">You are offline</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Jirani Mwema SHG Finance Portal could not connect to the internet. Reconnect and refresh to continue using live Firebase data.
        </p>
        <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-2xl border border-cyan-300/25 bg-cyan-400/20 px-5 py-3 text-sm font-black text-cyan-50 transition hover:bg-cyan-400/30">
          Retry Connection
        </button>
      </section>
    </main>
  );
}
