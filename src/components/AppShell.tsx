"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarNav from "@/components/SidebarNav";

type AppShellProps = {
  children: React.ReactNode;
};

const hiddenShellRoutes = ["/landing", "/offline"];

function shouldHideShell(pathname: string) {
  return hiddenShellRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (shouldHideShell(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white/95 lg:flex lg:flex-col">
          <div className="border-b border-slate-100 px-4 py-4">
            <Link href="/" className="block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black text-white shadow-sm">
                  JM
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">
                    Jirani Mwema
                  </p>
                  <p className="truncate text-xs font-semibold text-slate-500">
                    Finance dashboard
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            <SidebarNav />
          </div>

          <div className="border-t border-slate-100 px-4 py-3">
            <p className="text-[11px] font-semibold text-slate-400">
              Group ID
            </p>
            <p className="truncate text-xs font-black text-slate-600">
              demo_group_01
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-xs font-black text-white">
                  JM
                </div>
                <div>
                  <p className="text-sm font-black text-slate-950">
                    Jirani Mwema
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    Finance dashboard
                  </p>
                </div>
              </Link>
            </div>

            <div className="mt-3 overflow-x-auto">
              <div className="flex min-w-max gap-2 pb-1">
                <Link
                  href="/members"
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                >
                  Members
                </Link>
                <Link
                  href="/contributions"
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                >
                  Contributions
                </Link>
                <Link
                  href="/monthly-splits"
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                >
                  Splits
                </Link>
                <Link
                  href="/reports"
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                >
                  Reports
                </Link>
                <Link
                  href="/settings"
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                >
                  Settings
                </Link>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
