"use client";
import { useEffect, useRef, useState } from "react";
import { consentKey, parseConsent, type Consent } from "@/lib/consent";

type Queue = ((...args: unknown[]) => void) & { queue: unknown[][]; callMethod?: (...args: unknown[]) => void; push?: Queue; loaded: boolean; version: string };
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; fbq?: Queue; _fbq?: Queue; } }
const denied = { analytics: false, marketing: false };

function removeCookies(marketing: boolean) {
  const host = location.hostname.split(".");
  const domains = ["", ...host.map((_, i) => `;domain=.${host.slice(i).join(".")}`)];
  document.cookie.split(";").forEach(cookie => {
    const name = cookie.trim().split("=")[0];
    if (marketing ? /^(?:_fbp|_fbc)$/.test(name) : /^_ga(?:_|$)/.test(name))
      domains.forEach(domain => { document.cookie = `${name}=;Max-Age=0;path=/${domain};SameSite=Lax`; });
  });
}
export default function TrackingConsent({ gaId, pixelId, origin }: { gaId: string; pixelId: string; origin?: string }) {
  const [ready, setReady] = useState(false), [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<Consent>(denied);
  const current = useRef<Consent>(denied), initialized = useRef({ analytics: false, marketing: false });
  const enabled = Boolean(gaId || pixelId);

  const apply = (consent: Consent) => {
    current.current = consent;
    if (gaId) {
      (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = !consent.analytics;
      if (consent.analytics) {
        window.dataLayer ||= [];
        window.gtag ||= function() { window.dataLayer!.push(arguments); };
        if (!initialized.current.analytics) {
          window.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
        }
        window.gtag("consent", "update", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
        if (!initialized.current.analytics) {
          initialized.current.analytics = true;
          window.gtag("js", new Date());
          window.gtag("config", gaId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
          const script = document.createElement("script"); script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`; script.dataset.hunerTracker = "analytics"; document.head.append(script);
          window.gtag("event", "page_view", { page_title: document.title, page_location: location.origin + location.pathname });
        }
      } else {
        window.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
        removeCookies(false);
      }
    }
    if (pixelId) {
      if (consent.marketing) {
        if (!window.fbq) {
          const fbq: Queue = Object.assign((...args: unknown[]) => { if (fbq.callMethod) fbq.callMethod(...args); else fbq.queue.push(args); }, { queue: [] as unknown[][], loaded: true, version: "2.0" });
          fbq.push = fbq; window.fbq = window._fbq = fbq;
        }
        window.fbq("consent", "grant");
        if (!initialized.current.marketing) {
          initialized.current.marketing = true;
          window.fbq("set", "autoConfig", false, pixelId);
          window.fbq("init", pixelId);
          const script = document.createElement("script"); script.async = true; script.src = "https://connect.facebook.net/en_US/fbevents.js"; script.dataset.hunerTracker = "marketing"; document.head.append(script);
          window.fbq("track", "PageView");
        }
      } else { window.fbq?.("consent", "revoke"); removeCookies(true); }
    }
  };
  useEffect(() => {
    if (!enabled || !origin || location.origin !== origin) return;
    setReady(true);
    let saved: Consent | null = null;
    try { saved = parseConsent(localStorage.getItem(consentKey)); } catch { /* Storage is optional. */ }
    if (saved) { setChoice(saved); apply(saved); } else setOpen(true);
    const clicked = (event: MouseEvent) => {
      const element = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-track]") : null;
      const name = element?.dataset.track;
      if (!name || !["contact_click", "explore_application"].includes(name)) return;
      if (current.current.analytics && gaId) window.gtag?.("event", name, { transport_type: "beacon" });
      if (current.current.marketing && pixelId && name === "contact_click") window.fbq?.("trackCustom", "ContactClick");
    };
    document.addEventListener("click", clicked);
    return () => document.removeEventListener("click", clicked);
    // IDs and production origin are fixed for the lifetime of the exported page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, gaId, pixelId, origin]);
  function save(value: Consent) {
    try { localStorage.setItem(consentKey, JSON.stringify(value)); } catch { /* Keep the current-page choice. */ }
    setChoice(value); apply(value); setOpen(false);
  }
  if (!ready) return null;
  return <>
    <button className="privacy-control" onClick={() => setOpen(true)}>Cookie preferences</button>
    {open && <section className="consent-panel" aria-labelledby="consent-title">
      <h2 id="consent-title">Your choices, naturally.</h2>
      <p>Optional analytics help us understand visits. Marketing measurement connects visits to advertising. Both are off until you choose. <a href="/privacy/">Read our privacy notice.</a></p>
      <div className="consent-options">
        {gaId && <label><input type="checkbox" checked={choice.analytics} onChange={e => setChoice({ ...choice, analytics: e.target.checked })} /> Analytics</label>}
        {pixelId && <label><input type="checkbox" checked={choice.marketing} onChange={e => setChoice({ ...choice, marketing: e.target.checked })} /> Marketing</label>}
      </div>
      <div className="consent-actions"><button onClick={() => save(denied)}>Reject optional</button><button onClick={() => save(choice)}>Save choices</button><button onClick={() => save({ analytics: Boolean(gaId), marketing: Boolean(pixelId) })}>Accept all</button></div>
    </section>}
  </>;
}
