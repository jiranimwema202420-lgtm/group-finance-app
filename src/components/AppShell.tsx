"use client";

import { ReactNode, useState } from "react";
import SidebarNav from "@/components/SidebarNav";

export default function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Jirani Finance
          </p>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
            Jirani Mwema SHG
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Group finance dashboard
          </p>
        </div>

        <SidebarNav />

        <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">
            Safe layout phase
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Sidebar shell added without changing business logic.
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Jirani Finance
            </p>
            <p className="text-sm font-bold text-slate-950">
              Jirani Mwema SHG
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"
            aria-label="Open navigation menu"
          >
            Menu
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white p-4 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Jirani Finance
                </p>
                <p className="mt-1 text-lg font-bold text-slate-950">
                  Navigation
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Close
              </button>
            </div>

            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <main className="min-h-dvh lg:pl-72">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
