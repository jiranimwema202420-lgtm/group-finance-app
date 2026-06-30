"use client";

import React, { useMemo, useState } from "react";

type RoleKey = "Guest" | "Member" | "Treasurer" | "Chairperson" | "Admin";

type RoleGuide = {
  role: RoleKey;
  title: string;
  summary: string;
  start: string[];
  canUse: string[];
  restricted: string[];
  actions: string[];
};

const guides: RoleGuide[] = [
  {
    role: "Guest",
    title: "Guest / New Member",
    summary: "For new users who have not yet been approved by Admin.",
    start: [
      "Open the app landing page.",
      "Click Member Sign In.",
      "Sign in using your Google account.",
      "Submit an access request if you are not approved yet.",
      "Wait for Admin approval, then sign in again.",
    ],
    canUse: ["Landing page", "Member Sign In", "Access request form", "Pending approval status"],
    restricted: ["Member dashboard before approval", "Admin tools", "Role Management", "Defaulter Notifications", "Private member search"],
    actions: ["Request access with your real name.", "Contact Admin if your request stays pending.", "Use the same Google account after approval."],
  },
  {
    role: "Member",
    title: "Approved Member",
    summary: "For approved members viewing their allowed group finance information.",
    start: [
      "Open the app.",
      "Click Member Sign In.",
      "Use the Google account approved by Admin.",
      "Wait for your dashboard to load.",
      "Use only the tools visible to your role.",
    ],
    canUse: ["Member dashboard", "Allowed contribution records", "Member statement where enabled", "Group information", "Theme/settings options"],
    restricted: ["Approving users", "Changing roles", "Verifying payments", "Private member search", "Admin audit tools"],
    actions: ["Check your contribution status.", "Review statement records where available.", "Report wrong payment entries to Treasurer/Admin.", "Sign out before switching Google accounts."],
  },
  {
    role: "Treasurer",
    title: "Treasurer",
    summary: "For finance tracking, payment review, reports, and member follow-up.",
    start: [
      "Open the app.",
      "Sign in using your approved Treasurer Google account.",
      "Open finance modules from the dashboard.",
      "Review Data Health warnings before reports.",
      "Use exports and reminders only after checking records.",
    ],
    canUse: ["Contribution management", "Payment verification where enabled", "Member statements", "Defaulter notifications", "Finance charts", "CSV exports"],
    restricted: ["Admin-only bootstrap access", "Role elevation unless also Admin", "Unsafe direct database changes"],
    actions: ["Generate monthly contribution splits.", "Verify payments and arrears.", "Export CSV reports.", "Copy/send defaulter follow-up messages."],
  },
  {
    role: "Chairperson",
    title: "Chairperson",
    summary: "For leadership oversight and group status review.",
    start: [
      "Open the app.",
      "Click Member Sign In.",
      "Use your approved Chairperson Google account.",
      "Review visible summaries and reports.",
      "Coordinate restricted updates with Admin/Treasurer.",
    ],
    canUse: ["Leadership dashboard areas where enabled", "Group summaries", "Allowed reports", "Member-visible records"],
    restricted: ["Approving users unless also Admin", "Changing roles unless permitted", "Verifying finance records unless also Treasurer/Admin"],
    actions: ["Review overall group status.", "Prepare meeting updates.", "Escalate corrections to Admin/Treasurer."],
  },
  {
    role: "Admin",
    title: "Admin",
    summary: "For approvals, role management, protected data, and system control.",
    start: [
      "Open the app landing page.",
      "Click Admin Login.",
      "Sign in using the approved Admin Google account.",
      "If the account is not Admin, the app signs it out automatically.",
      "Open Admin tools from the dashboard.",
    ],
    canUse: ["Admin Login", "Access Requests", "Role Management", "Member Management", "Audit Logs", "Protected Member Search", "Defaulter Notifications", "Data Health tools"],
    restricted: ["Using non-approved Google accounts for Admin Login", "Bypassing Firestore security rules", "Approving users without checking details"],
    actions: ["Approve/reject access requests.", "Assign correct roles.", "Confirm approved users appear in Members and Memberships.", "Review audit logs after sensitive actions."],
  },
];

const roleOrder: RoleKey[] = ["Guest", "Member", "Treasurer", "Chairperson", "Admin"];

export default function GlobalRoleHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<RoleKey>("Guest");

  const guide = useMemo(
    () => guides.find((item) => item.role === activeRole) ?? guides[0],
    [activeRole]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-3 z-[80] inline-flex items-center gap-2 rounded-2xl border border-cyan-300/30 bg-slate-950/90 px-4 py-3 text-sm font-black text-cyan-50 shadow-2xl shadow-black/40 ring-1 ring-white/10 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-slate-900 sm:left-5"
        aria-label="Open app help guide"
      >
        <span className="grid h-7 w-7 place-items-center rounded-xl border border-cyan-300/30 bg-cyan-400/15 text-xs">
          ?
        </span>
        Help / App Guide
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/75 px-3 py-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Jirani Mwema help guide"
        >
          <div className="max-h-[92dvh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-slate-100 shadow-2xl shadow-black/60 ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
                  Jirani Mwema Help
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                  App Navigation Guide
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Choose your role to see where to start, what you can access, and what is restricted.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-2 text-sm font-black text-slate-200 transition hover:bg-white/[0.14]"
              >
                Close
              </button>
            </div>

            <div className="max-h-[calc(92dvh-7.5rem)] overflow-y-auto p-4 sm:p-5">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {roleOrder.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setActiveRole(role)}
                    className={`whitespace-nowrap rounded-2xl border px-4 py-2 text-sm font-black transition ${
                      activeRole === role
                        ? "border-cyan-300/40 bg-cyan-400/20 text-cyan-50"
                        : "border-white/10 bg-white/[0.06] text-slate-300 hover:bg-white/[0.10]"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <section className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-4 sm:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white">{guide.title}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                      {guide.summary}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-400/15 px-3 py-1 text-xs font-black text-cyan-100">
                    {guide.role}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <GuideCard title="Where to start" items={guide.start} ordered />
                  <GuideCard title="Common actions" items={guide.actions} ordered />
                  <GuideCard title="This role can access" items={guide.canUse} />
                  <GuideCard title="Restricted for this role" items={guide.restricted} muted />
                </div>

                <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                  <strong>Security note:</strong> If a tool is not visible, your current role probably does not have permission.
                  Sign out and sign in with the correct Google account, or contact an Admin.
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function GuideCard({
  title,
  items,
  ordered = false,
  muted = false,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
  muted?: boolean;
}) {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-200">
        {title}
      </h4>
      <ListTag
        className={`mt-3 space-y-2 text-sm leading-6 ${
          ordered ? "list-decimal pl-5" : "list-disc pl-5"
        } ${muted ? "text-slate-400" : "text-slate-300"}`}
      >
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    </div>
  );
}
