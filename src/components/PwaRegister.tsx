"use client";

import React, { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

export default function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIsInstalled(isStandalone);

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => {
            setIsServiceWorkerReady(true);
            console.info("[PWA] Service worker registered.");
          })
          .catch((error) => console.error("[PWA] Service worker registration failed:", error));
      });
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      console.info("[PWA] App installed.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  };

  if (isInstalled || !installPrompt) return null;

  return (
    <div className="fixed bottom-24 right-3 z-[60] max-w-[92vw] sm:bottom-5 sm:right-5">
      <div className="rounded-[1.35rem] border border-cyan-300/25 bg-slate-950/85 p-3 text-slate-100 shadow-2xl shadow-black/35 ring-1 ring-white/10 backdrop-blur-2xl">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-400/15 text-xs font-black text-cyan-100">
            JM
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black">Install Jirani Mwema</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-300">
              Add the finance portal to your phone or desktop for faster access.
              {isServiceWorkerReady ? " Offline support is ready." : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={handleInstall} className="rounded-xl border border-cyan-300/25 bg-cyan-400/20 px-3 py-2 text-xs font-black text-cyan-50 transition hover:bg-cyan-400/30">
                Install App
              </button>
              <button type="button" onClick={() => setInstallPrompt(null)} className="rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/[0.14]">
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
