"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BellRing,
  ChevronRight,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  UserSearch,
  WalletCards,
} from "lucide-react";

type ThemeMode = "dark" | "light";

const featureCards = [
  {
    title: "Monthly Contributions",
    detail:
      "Track welfare, merry-go-round, insurance, bereavement support, paid amounts, balances, and arrears.",
    icon: BarChart3,
  },
  {
    title: "Payment Verification",
    detail:
      "Treasurer and Admin users can verify, reject, and review member payments with clean accountability.",
    icon: ShieldCheck,
  },
  {
    title: "Defaulter Reminders",
    detail:
      "Generate WhatsApp-ready reminders for members with outstanding remittance balances.",
    icon: BellRing,
  },
  {
    title: "Member Search",
    detail:
      "Admin and Treasurer can quickly find individual member records, statements, and arrears.",
    icon: UserSearch,
  },
];

const trustCards = [
  {
    title: "Role-Based Access",
    detail: "Admin, Treasurer, Chairperson, and Member views.",
  },
  {
    title: "Audit Ready",
    detail: "Important actions are recorded for accountability.",
  },
  {
    title: "Mobile First",
    detail: "Designed for phone-first group operations.",
  },
];

export default function LandingPage() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");

  const isLightTheme = themeMode === "light";
  const themeClass = isLightTheme ? "theme-light" : "theme-dark";

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("jirani-mwema-landing-theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      setThemeMode(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("jirani-mwema-landing-theme", themeMode);
  }, [themeMode]);

  const handleThemeToggle = () => {
    setThemeMode((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <main
      className={`${themeClass} relative min-h-dvh overflow-hidden px-3 py-3 text-slate-100 sm:px-5 lg:px-8`}
    >
      <style>{`
        .theme-dark {
          color-scheme: dark;
          background:
            radial-gradient(circle at top left, rgba(34,211,238,0.30), transparent 34%),
            radial-gradient(circle at 85% 10%, rgba(168,85,247,0.22), transparent 35%),
            radial-gradient(circle at 50% 100%, rgba(16,185,129,0.12), transparent 38%),
            linear-gradient(135deg,#020617,#0f172a 48%,#111827);
        }

        .theme-light {
          color-scheme: light;
          background:
            radial-gradient(circle at top left, rgba(14,165,233,0.18), transparent 34%),
            radial-gradient(circle at 85% 10%, rgba(99,102,241,0.14), transparent 35%),
            radial-gradient(circle at 50% 100%, rgba(16,185,129,0.12), transparent 38%),
            linear-gradient(135deg,#f8fafc,#eef6ff 48%,#ffffff);
          color: rgb(15,23,42);
        }

        .frost-card {
          background:
            linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06)),
            radial-gradient(circle at top left, rgba(34,211,238,0.12), transparent 35%),
            radial-gradient(circle at bottom right, rgba(129,140,248,0.10), transparent 35%);
          box-shadow:
            0 30px 100px rgba(0,0,0,0.28),
            inset 0 1px 0 rgba(255,255,255,0.20);
          backdrop-filter: blur(28px) saturate(150%);
          -webkit-backdrop-filter: blur(28px) saturate(150%);
        }

        .theme-light .frost-card {
          background:
            linear-gradient(135deg, rgba(255,255,255,0.88), rgba(255,255,255,0.54)),
            radial-gradient(circle at top left, rgba(14,165,233,0.14), transparent 35%),
            radial-gradient(circle at bottom right, rgba(99,102,241,0.12), transparent 35%);
          box-shadow:
            0 30px 100px rgba(15,23,42,0.12),
            inset 0 1px 0 rgba(255,255,255,0.70);
        }

        .soft-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 38px 38px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
        }

        .theme-light .soft-grid {
          background-image:
            linear-gradient(rgba(15,23,42,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.055) 1px, transparent 1px);
        }

        .theme-light .text-white,
        .theme-light .text-slate-100,
        .theme-light .text-slate-200 {
          color: rgb(15,23,42) !important;
        }

        .theme-light .text-slate-300,
        .theme-light .text-slate-400 {
          color: rgb(71,85,105) !important;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 soft-grid opacity-60" />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, 24, 0], y: [0, -18, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, -28, 0], y: [0, 22, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-28 top-56 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/14 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-7xl flex-col">
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="sticky top-3 z-30 mb-5 flex flex-col gap-3 rounded-[1.75rem] border border-white/15 bg-slate-950/45 px-4 py-3 shadow-2xl shadow-black/30 ring-1 ring-white/10 backdrop-blur-3xl sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: -6, scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="grid h-12 w-12 place-items-center rounded-[1.1rem] border border-cyan-300/35 bg-gradient-to-br from-cyan-300/25 via-white/10 to-indigo-400/25 text-sm font-black text-cyan-50 shadow-lg shadow-cyan-950/30"
            >
              JM
            </motion.div>
            <div>
              <p className="text-base font-black tracking-tight text-white">
                Jirani Mwema SHG
              </p>
              <p className="text-xs font-medium text-slate-300">
                Self Help Group Finance Portal
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={handleThemeToggle}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black text-slate-100 shadow-lg shadow-black/10 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.14] sm:py-2"
              type="button"
              aria-pressed={isLightTheme}
            >
              {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {isLightTheme ? "Dark" : "Light"}
            </button>

            <motion.a
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-200/35 bg-gradient-to-r from-cyan-400/25 via-sky-400/20 to-indigo-400/25 px-4 py-3 text-sm font-black text-cyan-50 shadow-lg shadow-cyan-950/25 backdrop-blur-xl transition hover:from-cyan-400/35 hover:to-indigo-400/35 sm:w-auto sm:py-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Member Portal
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="/"
              onClick={() => window.localStorage.setItem("jirani-mwema-login-intent", "admin")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200/35 bg-gradient-to-r from-amber-400/25 via-orange-400/20 to-rose-400/25 px-4 py-3 text-sm font-black text-amber-50 shadow-lg shadow-amber-950/25 backdrop-blur-xl transition hover:from-amber-400/35 hover:to-rose-400/35 sm:w-auto sm:py-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Login
            </motion.a>
          </div>
        </motion.nav>

        <section className="grid flex-1 items-start gap-5 pt-3 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="frost-card relative overflow-hidden rounded-[2rem] border border-white/15 p-5 ring-1 ring-white/10 sm:p-8 lg:rounded-[2.65rem] lg:p-10"
          >
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl" />

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200 shadow-lg shadow-cyan-950/20 backdrop-blur-2xl"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Transparent. Accountable. Member-owned.
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.65, ease: "easeOut" }}
              className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl"
            >
              Jirani Mwema SHG
              <span className="block bg-gradient-to-r from-cyan-200 via-white to-indigo-200 bg-clip-text text-transparent">
                Finance Portal
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.6 }}
              className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base lg:text-lg lg:leading-8"
            >
              A frosty, secure, mobile-first finance workspace for members,
              contributions, merry-go-round payouts, insurance records,
              bereavement support, arrears, verification, reports, defaulter
              reminders, and audit trails.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.55 }}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <motion.a
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-200/35 bg-gradient-to-r from-cyan-400/35 via-sky-400/25 to-indigo-400/35 px-6 py-3 text-center text-sm font-black text-cyan-50 shadow-2xl shadow-cyan-950/25 backdrop-blur-xl transition hover:from-cyan-400/45 hover:to-indigo-400/45"
              >
                <ShieldCheck className="h-4 w-4" />
                Open Member Portal
                <ChevronRight className="h-4 w-4" />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="/"
                onClick={() => window.localStorage.setItem("jirani-mwema-login-intent", "admin")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200/35 bg-gradient-to-r from-amber-400/30 via-orange-400/25 to-rose-400/30 px-6 py-3 text-center text-sm font-black text-amber-50 shadow-2xl shadow-amber-950/25 backdrop-blur-xl transition hover:from-amber-400/40 hover:to-rose-400/40"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Login
                <ChevronRight className="h-4 w-4" />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.08] px-6 py-3 text-center text-sm font-black text-slate-100 shadow-lg shadow-black/10 backdrop-blur-xl transition hover:bg-white/[0.14]"
              >
                <Sparkles className="h-4 w-4" />
                Explore Features
              </motion.a>
            </motion.div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {trustCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.58 + index * 0.08, duration: 0.48 }}
                  whileHover={{ y: -6, scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="rounded-[1.35rem] border border-white/15 bg-white/[0.075] p-4 shadow-xl shadow-black/10 ring-1 ring-white/10 backdrop-blur-2xl"
                >
                  <div className="mb-3 grid h-9 w-9 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10">
                    <ShieldCheck className="h-4 w-4 text-cyan-200" />
                  </div>
                  <p className="text-base font-black text-white">{card.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{card.detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div id="features" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:gap-4">
            {featureCards.map(({ title, detail, icon: Icon }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.12, duration: 0.58, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.018 }}
                whileTap={{ scale: 0.985 }}
                className="group frost-card relative overflow-hidden rounded-[1.65rem] border border-white/15 p-4 ring-1 ring-white/10 transition hover:border-cyan-300/30 sm:p-5"
              >
                <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-cyan-300/10 blur-2xl transition group-hover:bg-cyan-300/20" />
                <div className="relative flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-cyan-400/20 to-indigo-400/15 shadow-lg shadow-cyan-950/20">
                    <Icon className="h-5 w-5 text-cyan-100" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.55 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="rounded-[1.65rem] border border-emerald-300/20 bg-emerald-400/10 p-4 shadow-xl shadow-black/15 ring-1 ring-white/5 backdrop-blur-3xl sm:p-5"
            >
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10">
                <WalletCards className="h-5 w-5 text-emerald-200" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">
                Built for daily operations
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Use the portal for role-based dashboards, member tools, charts,
                reports, settings, and data health checks.
              </p>
            </motion.div>
          </div>
        </section>

        <footer className="mt-5 rounded-3xl border border-white/10 bg-white/[0.06] px-4 py-4 text-center text-xs text-slate-400 shadow-xl shadow-black/10 backdrop-blur-2xl sm:mt-8">
          © {new Date().getFullYear()} Jirani Mwema SHG. Secure group finance
          management for registered members.
        </footer>
      </div>
    </main>
  );
}
