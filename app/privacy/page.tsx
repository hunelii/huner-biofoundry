import type { Metadata } from "next";
import { site } from "@/lib/site";
export const metadata: Metadata = { title: "Privacy & Cookies | Huner Biofoundry", ...(site.origin ? { alternates: { canonical: "/privacy/" } } : {}), robots: { index: false, follow: true } };
export default function Privacy() {
  return <main className="privacy-page">
    <a href="/">HUNER BIOFOUNDRY ↖</a>
    <h1>Privacy & cookies</h1>
    <p>This website introduces Huner Biofoundry and its work with living systems. You can explore it without creating an account.</p>
    <h2>Optional measurement</h2>
    {site.ga || site.pixel ? <p>Where enabled on our production domain, Google Analytics measures page visits and selected link clicks after Analytics consent. Meta Pixel measures page visits and collaboration-link clicks after Marketing consent. Marketing measurement can associate activity with advertising. We do not send enquiry text or contact details through these events.</p> : <p>Optional analytics and marketing measurement are currently disabled. No Google Analytics or Meta Pixel code is loaded by this website.</p>}
    <p>When optional measurement is available, you can accept, reject or choose each category. Use “Cookie preferences” to change your decision. Your choice is stored in this browser. Rejecting optional measurement does not prevent access to the website.</p>
    <h2>Website operation</h2>
    <p>The hosting provider processes requests needed to deliver the website and may maintain operational and security logs. The interactive living field runs on your device. We do not collect its pointer or touch coordinates.</p>
    <h2>Contact</h2>
    <p>If you choose to email Huner, your email application opens and your message is handled separately from website measurement.</p>
    {site.email && <p>For website or privacy enquiries: <a href={`mailto:${site.email}`}>{site.email}</a>.</p>}
    <h2>Third-party information</h2>
    <p><a href="https://policies.google.com/privacy">Google Privacy Policy ↗</a><br /><a href="https://www.facebook.com/privacy/policy/">Meta Privacy Policy ↗</a></p>
    <a href="/">Return to Huner ↖</a>
  </main>;
}
