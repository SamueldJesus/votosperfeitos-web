"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "vp-marketing-consent";

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[][]; loaded?: boolean; version?: string };

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

export interface BrowserMetaTracking {
  eventId: string;
  fbp?: string;
  fbc?: string;
}

function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

function saveConsent(): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, "granted");
  } catch {
    // When storage is unavailable, this tab can still use consented tracking.
  }
}

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  return document.cookie.split(";").map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(prefix))?.slice(prefix.length);
}

function eventId(): string {
  return crypto.randomUUID();
}

function ensureFbq(): Fbq {
  if (window.fbq) return window.fbq;
  const fbq = ((...args: unknown[]) => {
    fbq.queue?.push(args);
  }) as Fbq;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  return fbq;
}

async function loadPixel(): Promise<string | null> {
  const response = await fetch("/api/meta/config");
  if (!response.ok) return null;
  const result = (await response.json()) as { pixelId?: unknown };
  if (typeof result.pixelId !== "string" || !result.pixelId) return null;

  const fbq = ensureFbq();
  if (!document.querySelector('script[data-meta-pixel="true"]')) {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.dataset.metaPixel = "true";
    document.head.appendChild(script);
  }
  fbq("init", result.pixelId);
  return result.pixelId;
}

export function createCheckoutTracking(): BrowserMetaTracking | null {
  if (!hasConsent()) return null;
  return {
    eventId: eventId(),
    ...(readCookie("_fbp") ? { fbp: readCookie("_fbp") } : {}),
    ...(readCookie("_fbc") ? { fbc: readCookie("_fbc") } : {}),
  };
}

export function trackInitiateCheckout(tracking: BrowserMetaTracking | null): void {
  if (!tracking || !window.fbq) return;
  window.fbq("track", "InitiateCheckout", { value: 47, currency: "BRL" }, { eventID: tracking.eventId });
}

export function MetaPixel() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (!hasConsent()) return;
    const restoreConsent = window.setTimeout(() => setConsented(true), 0);
    return () => window.clearTimeout(restoreConsent);
  }, []);

  useEffect(() => {
    if (!consented) return;
    void loadPixel().then((pixelId) => {
      if (pixelId && window.fbq) {
        window.fbq("track", "PageView", {}, { eventID: eventId() });
      }
    });
  }, [consented]);

  if (consented) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-[#F0EAE1] bg-white p-4 shadow-2xl sm:bottom-5 sm:p-5" aria-label="Preferências de cookies">
      <p className="text-sm font-semibold text-[#1C1917]">Cookies de marketing</p>
      <p className="mt-1 text-xs leading-relaxed text-[#78716C]">Usamos cookies para medir anúncios e entender quais visitas viram pedidos. Você pode continuar sem aceitar.</p>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => setConsented(true)} className="min-h-10 rounded-full px-4 text-xs font-semibold text-[#78716C] hover:bg-[#FAF8F5]">Continuar sem cookies</button>
        <button type="button" onClick={() => { saveConsent(); setConsented(true); }} className="min-h-10 rounded-full bg-[#1C1917] px-4 text-xs font-semibold text-white hover:bg-[#292524]">Aceitar cookies de marketing</button>
      </div>
    </aside>
  );
}
