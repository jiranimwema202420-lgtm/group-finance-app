"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href?: string;
  badge?: string;
  disabled?: boolean;
};

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Meeting Notifications", href: "/meeting-notifications" },
  { label: "Members", disabled: true, badge: "Next" },
  { label: "Contributions", disabled: true, badge: "Next" },
  { label: "Monthly Splits", disabled: true, badge: "Next" },
  { label: "Reports", disabled: true, badge: "Next" },
  { label: "Settings", disabled: true, badge: "Next" },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SidebarNav({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="Main navigation">
      {mainNavItems.map((item) => {
        const isActive = item.href ? isActiveRoute(pathname, item.href) : false;

        if (!item.href || item.disabled) {
          return (
            <div
              key={item.label}
              className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400"
              aria-disabled="true"
            >
              <span>{item.label}</span>

              {item.badge ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  {item.badge}
                </span>
              ) : null}
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
            ].join(" ")}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
