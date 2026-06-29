"use client";

import React, { useMemo, useState } from "react";

type RoleKey = "Guest" | "Member" | "Treasurer" | "Chairperson" | "Admin";

type RoleGuide = {
  role: RoleKey;
  title: string;
  summary: string;
  start: string[];
  canUse: string[];
  cannotUse: string[];
  commonActions: string[];
};

const roleGuides: RoleGuide[] = [
  {
    role: "Guest",
    title: "Guest / New Member",
    summary: "Use this path if you are new, not approved yet, or waiting for Admin approval.",
    start: [
      "Open the landing page.",
      "Click Member Sign In.",
      "Sign in with your Google account.",
      "If you are not approved yet, submit an access request.",
      "Wait for an Admin to approve your request.",
    ],
    canUse: ["Public landing page", "Member Sign In", "Access request form", "Pending approval status"],
    cannotUse: ["Member dashboard before approval", "Admin approval tools", "Role Management", "Defaulter Notifications", "Private member search"],
    commonActions: [
      "Request access using your real name and Google account.",
      "Contact the Admin if your request stays pending.",
      "After approval, sign out and sign in again if your dashboard does not refresh.",
    ],
  },
  {
    role: "Member",
    title: "Approved Member",
    summary: "Use this path to view your group access and finance records allowed to your role.",
    start: [
      "Open the app.",
      "Click Member Sign In.",
      "Sign in with the Google account approved by Admin.",
      "Wait for the dashboard to load your Member workspace.",
      "Use the navigation cards/tabs available to your role.",
    ],
    canUse: ["Member dashboard", "Allowed contribution records", "Member statement where enabled", "Public group information", "Theme and settings options"],
    cannotUse: ["Approve new users", "Change roles", "Verify payments", "View private member search tools", "Use defaulter notification tools"],
    commonActions: [
      "Check your monthly contribution status.",
      "Review your statement where available.",
      "Report incorrect payment records to Treasurer/Admin.",
      "Use Sign Out before switching accounts.",
    ],
  },
  {
    role: "Treasurer",
    title: "Treasurer",
    summary: "Use this path for finance operations, payment follow-up, and contribution tracking.",
    start: [
      "Open the app.",
      "Use Member Sign In unless you are also registered as Admin.",
      "Sign in with your approved Treasurer Google account.",
      "Open finance-related modules from the dashboard.",
      "Use Data Health before exporting or notifying members.",
    ],
    canUse: ["Contribution management", "Payment verification where enabled", "Member statements", "Defaulter notifications", "Finance charts and analytics", "CSV exports"],
    cannotUse: ["Bootstrap Admin access", "Admin-only role elevation unless also Admin", "Unsafe direct database changes"],
    commonActions: [
      "Generate or review monthly contribution splits.",
      "Verify payments and check arrears.",
      "Export CSV reports for records.",
      "Copy or send defaulter follow-up messages.",
      "Review Data Health warnings before final reports.",
    ],
  },
  {
    role: "Chairperson",
    title: "Chairperson",
    summary: "Use this path for oversight, group visibility, and leadership review.",
    start: [
      "Open the app.",
      "Click Member Sign In.",
      "Sign in with your approved Chairperson Google account.",
      "Review the visible group and finance summary sections.",
      "Coordinate with Admin/Treasurer for restricted updates.",
    ],
    canUse: ["Leadership dashboard areas where enabled", "Group summaries", "Allowed reports", "Member-visible records"],
    cannotUse: ["Approve users unless also Admin", "Change roles unless permission is granted", "Verify finance records unless also Treasurer/Admin"],
    commonActions: [
      "Review overall group status.",
      "Check contribution trends where visible.",
      "Escalate corrections to Admin or Treasurer.",
      "Use reports for meeting preparation.",
    ],
  },
  {
    role: "Admin",
    title: "Admin",
    summary: "Use this path for approvals, role control, protected tools, and system management.",
    start: [
      "Open the landing page.",
      "Click Admin Login.",
      "Sign in with the approved Admin Google account.",
      "If the account is not registered as Admin, the app will sign it out automatically.",
      "Open Admin tools from the dashboard.",
    ],
    canUse: ["Admin Login", "Access Requests", "Role Management", "Member Management", "Audit Logs", "Protected Member Search", "Defaulter Notifications", "Data Health tools"],
    cannotUse: ["Use a non-approved Google account for Admin Login", "Bypass Firestore security rules", "Approve users without checking details"],
    commonActions: [
      "Approve or reject access requests.",
      "Assign correct roles: Admin, Treasurer, Chairperson, or Member.",
      "Confirm approved users appear in Members and Memberships.",
      "Review audit logs after sensitive actions.",
      "Deploy Firestore rules before major production changes.",
    ],
  },
];

const roleOrder: RoleKey[] = ["Guest", "Member", "Treasurer", "Chairperson", "Admin"];

export default function LandingRoleHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<RoleKey>("Guest");

  const activeGuide = useMemo(
    () => roleGuides.find((guide) => guide.role === activeRole) ?? roleGuides[0],
    [activeRole]
  );

  return (
    <>
      <section className="mx-auto mt-8 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/20 ring-1 ring-white/10 backdrop-blur-2xl sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">Need help?</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
                Learn how to navigate the app by role
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Open the quick guide for Guest, Member, Treasurer, Chairperson, and Admin workflows.
                It explains where to start, what each role can access, and what actions are restricted.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/20 px-5 py-3 text-sm font-black text-cyan-50 shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
            >
              Open App Guide
            </button>
          </div>
        </div>
      </section>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/75 px-3 py-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Jirani Mwema app navigation guide"
        >
          <div className="max-h-[92dvh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-slate-100 shadow-2xl shadow-black/50 ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">Jirani Mwema Help</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-white">App Navigation Guide</h3>
                <p className="mt-1 text-sm text-slate-300">Choose your role to see what to do next.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-2 text-sm font-black text-slate-200 transition hover:bg-white/[0.14]"
                aria-label="Close help guide"
              >
                Close
              </button>
            </div>

            <div className="max-h-[calc(92dvh-7rem)] overflow-y-auto p-4 sm:p-5">
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

              <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-4 sm:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-white">{activeGuide.title}</h4>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{activeGuide.summary}</p>
                  </div>
                  <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-400/15 px-3 py-1 text-xs font-black text-cyan-100">
                    {activeGuide.role}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <GuideCard title="Where to start" items={activeGuide.start} ordered />
                  <GuideCard title="Common actions" items={activeGuide.commonActions} ordered />
                  <GuideCard title="This role can access" items={activeGuide.canUse} />
                  <GuideCard title="Restricted for this role" items={activeGuide.cannotUse} muted />
                </div>

                <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                  <strong>Security note:</strong> If a tool is not visible, your role may not have permission.
                  Sign out and sign in with the correct Google account, or contact an Admin.
                </div>
              </div>
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
      <h5 className="text-sm font-black uppercase tracking-[0.18em] text-slate-200">{title}</h5>
      <ListTag className={`mt-3 space-y-2 text-sm leading-6 ${ordered ? "list-decimal pl-5" : "list-disc pl-5"} ${muted ? "text-slate-400" : "text-slate-300"}`}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    </div>
  );
}
