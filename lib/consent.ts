export type Consent = { analytics: boolean; marketing: boolean };
export const consentKey = "huner-consent-v1";
export function parseConsent(value: string | null): Consent | null {
  try {
    const parsed = JSON.parse(value ?? "null");
    return parsed && typeof parsed.analytics === "boolean" && typeof parsed.marketing === "boolean"
      ? { analytics: parsed.analytics, marketing: parsed.marketing } : null;
  } catch { return null; }
}
