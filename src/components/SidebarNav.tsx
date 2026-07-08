"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: "⌂",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Members",
        href: "/members",
        icon: "👥",
      },
      {
        label: "Contributions",
        href: "/contributions",
        icon: "💳",
      },
      {
        label: "Monthly Splits",
        href: "/monthly-splits",
        icon: "↔",
      },
    ],
  },
  {
    title: "Control",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: "📊",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: "⚙",
      },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-3">
      {navSections.map((section) => (
        <div key={section.title} className="space-y-1">
          <p className="px-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            {section.title}
          </p>

          <div className="space-y-1">
            {section.items.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition",
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs",
                      active
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-800",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>

                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
