import { useState } from "react";
declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      queue?: unknown[][];
      loaded?: boolean;
      version?: string;
      callMethod?: (...args: unknown[]) => void;
      push?: unknown;
    };
  }
}
export type Attribution = Partial<
  Record<
    | "utm_source"
    | "utm_medium"
    | "utm_campaign"
    | "utm_content"
    | "utm_term"
    | "fbclid",
    string
  >
>;
const consentKey = "fishn-analytics-consent";
const attributionKey = "fishn-attribution";
const pixelId = import.meta.env.VITE_META_PIXEL_ID;
export const analyticsConfigured = Boolean(pixelId && /^\d+$/.test(pixelId));
export function hasConsent() {
  try {
    return sessionStorage.getItem(consentKey) === "yes";
  } catch {
    return false;
  }
}
export function captureAttribution() {
  if (!hasConsent()) return;
  const params = new URLSearchParams(window.location.search);
  const next: Attribution = {};
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
  ] as const) {
    const value = params.get(key);
    if (value) next[key] = value.slice(0, 200);
  }
  if (Object.keys(next).length)
    try {
      sessionStorage.setItem(attributionKey, JSON.stringify(next));
    } catch {
      /* Optional storage. */
    }
}
export function getAttribution(): Attribution | undefined {
  if (!hasConsent()) return undefined;
  try {
    return (
      JSON.parse(sessionStorage.getItem(attributionKey) || "null") ?? undefined
    );
  } catch {
    return undefined;
  }
}
function initializePixel() {
  if (!analyticsConfigured || !hasConsent() || window.fbq) return;
  const fbq: NonNullable<Window["fbq"]> = (...args) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue?.push(args);
  };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  fbq("consent", "grant");
  fbq("init", pixelId);
  const script = document.createElement("script");
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  script.async = true;
  script.id = "fishn-pixel";
  document.head.appendChild(script);
}
export function track(
  event: string,
  data: Record<string, string | number> = {},
) {
  if (!hasConsent()) return;
  captureAttribution();
  initializePixel();
  if (!window.fbq) return;
  if (event === "Lead") window.fbq("track", "Lead", data);
  else window.fbq("trackCustom", event, data);
}
export function AnalyticsSettings() {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);
  function choose(value: "yes" | "no") {
    try {
      sessionStorage.setItem(consentKey, value);
      if (value === "no") sessionStorage.removeItem(attributionKey);
    } catch {
      /* Optional storage. */
    }
    setChoice(value);
    if (value === "yes") {
      captureAttribution();
      track("PageView");
    } else window.fbq?.("consent", "revoke");
  }
  return (
    <>
      <button
        className="text-button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        Analytics choices
      </button>
      {open && (
        <aside className="consent-panel" aria-label="Analytics preferences">
          <button
            className="consent-close"
            onClick={() => setOpen(false)}
            aria-label="Close analytics preferences"
          >
            ×
          </button>
          <h3>Your day. Your choice.</h3>
          <p>
            {analyticsConfigured
              ? "With your permission, Meta analytics and campaign information help us understand how people find fishn. No contact details are sent in analytics events."
              : "Optional Meta analytics are not configured. Campaign information is only saved if you choose to allow it."}
          </p>
          <div className="choice-actions">
            <button className="button" onClick={() => choose("yes")}>
              Allow optional analytics
            </button>
            <button className="text-button" onClick={() => choose("no")}>
              Keep essential only
            </button>
          </div>
          {choice && (
            <p role="status">
              {choice === "yes"
                ? "Optional analytics allowed for this browser session."
                : "Essential only. Optional analytics are off."}
            </p>
          )}
        </aside>
      )}
    </>
  );
}
