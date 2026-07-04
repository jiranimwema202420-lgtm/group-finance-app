"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href?: string;
  description?: string;
  badge?: string;
  disabled?: boolean;
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
        description: "Overview, balances, and activity",
      },
      {
        label: "Meeting Notifications",
        href: "/meeting-notifications",
        description: "Meeting reminders and WhatsApp messages",
      },
    ],
  },
  {
    title: "Group Operations",
    items: [
      {
        label: "Members",
        disabled: true,
        badge: "Next",
        description: "Member records, roles, and status",
      },
      {
        label: "Contributions",
        disabled: true,
        badge: "Next",
        description: "Monthly payments and arrears",
      },
      {
        label: "Monthly Splits",
        disabled: true,
        badge: "Next",
        description: "Insurance, welfare, and merry-go-round",
      },
      {
        label: "Payments",
        disabled: true,
        badge: "Paused",
        description: "M-Pesa and payment reconciliation",
      },
    ],
  },
  {
    title: "Governance",
    items: [
      {
        label: "Reports",
        disabled: true,
        badge: "Next",
        description: "Statements and summaries",
      },
      {
        label: "Settings",
        disabled: true,
        badge: "Next",
        description: "Group rules and app configuration",
      },
      {
        label: "Public Landing",
        href: "/landing",
        description: "Open the public landing page",
      },
    ],
  },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavContent({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  return (
    <>
      <span className="min-w-0">
        <span className="block truncate">{item.label}</span>

        {item.description ? (
          <span
            className={[
              "mt-0.5 block truncate text-xs font-normal",
              isActive ? "text-slate-200" : "text-slate-500",
            ].join(" ")}
          >
            {item.description}
          </span>
        ) : null}
      </span>

      {item.badge ? (
        <span
          className={[
            "ml-3 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            isActive
              ? "bg-white/15 text-white"
              : item.badge === "Paused"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          {item.badge}
        </span>
      ) : null}
    </>
  );
}

export default function SidebarNav({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6" aria-label="Main navigation">
      {navSections.map((section) => (
        <section key={section.title}>
          <h2 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {section.title}
          </h2>

          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = item.href
                ? isActiveRoute(pathname, item.href)
                : false;

              if (!item.href || item.disabled) {
                return (
                  <div
                    key={`${section.title}-${item.label}`}
                    className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400"
                    aria-disabled="true"
                    title={item.description}
                  >
                    <NavContent item={item} isActive={false} />
                  </div>
                );
              }

              return (
                <Link
                  key={`${section.title}-${item.label}`}
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
                  <NavContent item={item} isActive={isActive} />
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}
