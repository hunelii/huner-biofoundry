# Huner Biofoundry — launch guide

Latest update, 13 September 2026: the approved Cultivated Depth design is live. The optimized Higgsfield membrane artwork is rendered as a shallow, animated relief over the existing biological field. Its movement samples delayed environmental conditions, and the cell approach uses the same focal opening with a reversible camera path. This is illustrative artwork, not microscopy or a reconstructed Huner organism. A matching still composition remains available without GPU rendering. The cream/green palette, typography layout, transparent narrative copy, existing milestones and team are preserved; ivy remains absent.

Production deployment `dpl_DmMdwT1nF1Gh4M8v1FjmJ8Wx6hWY` is READY and aliased to [huner-biofoundry.vercel.app](https://huner-biofoundry.vercel.app). [Deployment details](https://vercel.com/hunelis-projects/huner-biofoundry/DmMdwT1nF1Gh4M8v1FjmJ8Wx6hWY). Local and Vercel production builds, TypeScript checks and all 19 automated model tests passed. Browser checks covered desktop and 390px compositions, environmental interaction, cell approach/cutaway/reverse scroll, the pause control and GPU-off still presentation. Live arrival and Conditions load the new membrane, preserve transparent heading backgrounds with no text shadows, and report no browser errors in the checks. Physical-device performance and actual OS reduced-motion-switch testing remain outstanding. Domain, contact and indexing setup below remains unchanged.

Previous update, 12 September 2026: white narrative backing and letter halos have been removed. The field is continuous behind the copy; broad field tones preserve readability. Captions and motion controls are transparent, while the page palette and typography retain their existing layout. Production deployment `dpl_XZ4QHipcGoodoxV3j5cMQELvAQZC` is READY and aliased to [huner-biofoundry.vercel.app](https://huner-biofoundry.vercel.app). [Deployment details](https://vercel.com/hunelis-projects/huner-biofoundry/XZ4QHipcGoodoxV3j5cMQELvAQZC). Local and production builds and 17 automated tests pass. Desktop and 390px browser checks covered copy over light and dark fields; live Conditions shows the continuous pattern and all checked narrative copy has transparent backgrounds and no text shadows. No browser errors were observed.

Previous update, 12 September 2026: the continuous cell approach, redesigned sculptural milestones, and seamless Conditions composition are live. Production deployment `dpl_DrAFD8koVqBVmqAAvgrkQ2yhRr6A` is READY and aliased to [huner-biofoundry.vercel.app](https://huner-biofoundry.vercel.app). [Deployment details](https://vercel.com/hunelis-projects/huner-biofoundry/DrAFD8koVqBVmqAAvgrkQ2yhRr6A). Local and Vercel production builds pass, along with 17 automated tests. Browser checks verified Conditions text metrics and original beige, phone composition, cell reveal and reverse entry, synchronized model/caption exit, five semantic fallback records, and live milestone selection. No browser errors were observed in those checks. The right number rail and explicit boundary line are removed; boundary physics remains. Ivy remains absent. Physical-device and OS reduced-motion-switch testing remain outstanding.

Previous update, 11 September 2026: the ornamental ivy has been completely removed at the owner’s request. The biological field, typography clearings, 3D milestones and team collective remain. Production deployment `dpl_GKQn6Usg1UjqNYYqsWh6eFo1L2eM` is READY and aliased to [huner-biofoundry.vercel.app](https://huner-biofoundry.vercel.app). [Deployment details](https://vercel.com/hunelis-projects/huner-biofoundry/GKQn6Usg1UjqNYYqsWh6eFo1L2eM). The production build and 14 remaining automated tests pass; the ivy-specific tests were removed with the feature. The production export contains no ivy component or leaf asset.

Previous update, 11 September 2026: architectural ivy, the 3D milestone journey and the team collective were published. Production deployment `dpl_CDNMvXZwYb8V37t1uDc7vode4mN1` was verified READY with the canonical alias attached. [Deployment details](https://vercel.com/hunelis-projects/huner-biofoundry/CDNMvXZwYb8V37t1uDc7vode4mN1). The upload connection interrupted its status stream; inspection confirmed successful publication, so no duplicate deployment was created.

Validation: production build and all 18 automated checks passed. Desktop and 390-pixel layouts, text clearance, milestone camera selection, paused static selection, GPU-off semantic content, team selection and internal anchors were checked locally with no reported browser errors. The public page was reloaded and confirmed to contain the ivy asset, five milestones, all three supplied names and the working 3D entry point. Physical-device and actual OS reduced-motion switching checks remain outstanding. The first-launch record below is retained as history.

Status, 10 September 2026: the website is **live on Vercel** at [huner-biofoundry.vercel.app](https://huner-biofoundry.vercel.app). Production deployment `dpl_PMDLKrkqRAqGtm48daQ7w7VzBVBt` completed with status READY in the `hunelis-projects` workspace. It was uploaded directly with Vercel CLI; a GitHub repository was not required. [Deployment details](https://vercel.com/hunelis-projects/huner-biofoundry/PMDLKrkqRAqGtm48daQ7w7VzBVBt).

Anonymous HTTPS checks returned 200 for the homepage, `/privacy/`, `/robots.txt` and `/sitemap.xml`, and 404 for an unknown path. The public arrival renders with the live GPU engine, one H1, valid internal anchor targets, no optional tracking scripts and no reported browser errors. The local production build and all 14 automated tests passed before upload.

The public cell chapter was checked at the intermediate transition and detailed cutaway endpoint, with no reported browser errors. The privacy link opens its deployed page, and `?gpu=off#material` switches to the semantic static cell. Physical-device testing and a real reduced-motion preference change remain outstanding.

No custom domain has been purchased or connected. `huner.com` remains a candidate only; ownership and availability have not been verified. A public contact email and analytics accounts/IDs are still needed. Search indexing remains disabled and the sitemap remains empty until the canonical domain is confirmed. This Vercel address is publicly accessible despite that indexing setting.

## 1. Domain, DNS and SSL

1. Confirm a domain you own. `www` is a hostname within a domain: owning `huner.com` lets you configure `www.huner.com`. If it is unavailable, consider `hunerbiofoundry.com` or `huner.bio` as candidates, checking registration cost, renewal cost and suitability before purchasing. These alternatives have not been checked for availability.
2. Keep ownership in a company-controlled registrar account. Enable two-factor authentication, auto-renewal and a recovery contact. Record who can change DNS. Do not move email hosting as part of the website launch.
3. Deploy and review the site on Vercel's assigned temporary address first. Do not enable indexing or trackers for that preview.
4. In Vercel → Project → Settings → Domains, add the chosen apex and `www` hostnames. Use `www` as primary; redirect the apex to it in the Domains settings. Set `NEXT_PUBLIC_SITE_URL` to exactly that final HTTPS origin.
5. Open DNS management at the existing DNS provider. Copy the records displayed in **this project's** Vercel domain cards. Values can be project-specific; generic copied IPs/CNAME targets are not authoritative. Remove only conflicting website records after recording the previous values. Preserve MX and mail-related TXT records (SPF, DKIM, DMARC), verification records and unrelated subdomains.

| Record | Name | Value |
|---|---|---|
| A, if Vercel requests it | `@` or the root domain | Exact IP shown by this Vercel project |
| CNAME | `www` | Exact target shown by this Vercel project |
| TXT, if verification is requested | Exact issued name | Exact ownership token shown by Vercel |
| TXT for Search Console | Usually `@` | Exact `google-site-verification=…` record issued by Google |

6. During the change, a short TTL such as 300–600 seconds is useful if the provider supports it. Existing caches may persist until their prior TTL expires. Avoid conflicting A/AAAA/CNAME entries. Do not change nameservers unless intentionally moving all DNS management.
7. Wait for Vercel to show a valid domain configuration and an issued certificate. HTTPS issuance and renewal are managed by Vercel. If issuance fails, inspect the exact DNS records and any restrictive CAA records using the provider's instructions; do not disable HTTPS validation.
8. Verify `http://apex`, `https://apex`, `http://www` and `https://www` all arrive at the selected HTTPS hostname with no redirect loop. Test `/privacy/` and a homepage hash link too. Check the certificate covers both aliases. Never publish credentials in DNS or source files.

Official guidance: [Vercel domain setup](https://vercel.com/docs/domains/working-with-domains/add-a-domain), [domain redirects](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting), [managed HTTPS](https://vercel.com/docs/domains/working-with-ssl).

## 2. Vercel deployment — chosen route

The site is a fully static Next.js export. It needs no database, server secrets, forms service or runtime backend. The exact exported output is deployed; the existing Sites manifest is retained, but this launch targets Vercel.

1. Sign in to the Vercel account that should own Huner. Account creation and any paid plan or domain purchase need the account owner's action. Vercel describes Hobby as personal/non-commercial; select a plan appropriate for Huner’s business use and confirm its current price before paying. [Plan terms](https://vercel.com/docs/plans/hobby).
2. Connect a repository containing this app, then choose **Add New → Project → Import**. There is currently no Git remote configured locally. If the repository contains the surrounding project folder, set **Root Directory** to `huner-biofoundry`; if the app itself is the repository root, leave it at `.`.
3. Apply the settings below. `vercel.json` already contains the explicit static deployment configuration.

| Setting | Value |
|---|---|
| Framework preset | Other (the configuration sets `framework: null`) |
| Node.js | 24.x — locally verified with Node 24.19.0 |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `out` |
| Trailing slash | Enabled, matching Next's static export |
| Runtime/server variables | None required |

4. Add the environment values below in Project Settings → Environment Variables. Public values are embedded **at build time**, so redeploy after changing them. Do not paste private API keys into any `NEXT_PUBLIC_` variable.
5. For the initial preview, leave indexing false and tracking IDs blank. Deploy and inspect the assigned URL. Vercel can call the first deployment “Production” even before the custom domain exists; the app's explicit indexing flag still controls publication to crawlers.
6. Connect the domain, configure the contact email, approve the privacy notice, and validate the preview. Set indexing true only for the final production environment and redeploy.
7. Confirm the exported checks and public checks below. Preserve the previous known-good deployment. For rollback, use the production deployment's **Instant Rollback** action and review affected domains. Account for Vercel's post-rollback production assignment behavior before resuming releases.

| Variable | Value to supply | Preview | Production |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Confirmed HTTPS canonical origin, no path | Can retain canonical production origin | Required for canonical/sitemap |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `true` or `false` | `false` | `true` after review |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Approved public enquiry email | Same approved address or blank | Required for enquiry links |
| `NEXT_PUBLIC_GA_ID` | Issued GA4 `G-…` measurement ID | Blank | Optional, activates only after consent |
| `NEXT_PUBLIC_META_PIXEL_ID` | Issued numeric Pixel ID | Blank | Optional, activates only after consent |
| `GOOGLE_SITE_VERIFICATION` | Issued URL-prefix verification token | Blank | Optional; DNS verification preferred |

Production tracking also checks that the browser origin equals `NEXT_PUBLIC_SITE_URL`; preview hosts do not collect production events. Preview host environments are explicitly excluded from indexing. `.env.example` documents the values without inventing any IDs or addresses.

For local checks using Node 24: `npm ci`, `npm run build`, `npm test`, then `npm run check:launch`. The last command is deliberately failing until the confirmed domain, indexing approval and public enquiry email are present. It checks the exported output, not an assumed account state.

Official references: [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build), [vercel.json](https://vercel.com/docs/project-configuration/vercel-json), [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [environments](https://vercel.com/docs/deployments/environments), [rollback](https://vercel.com/docs/instant-rollback), [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports).

### Netlify alternative

If hosting changes to Netlify, import the same repository, select the app base directory, use `npm run build`, publish `out`, and Node 24. `netlify.toml` already supplies these settings and skips the runtime Next.js adapter for the static output. Do **not** use the obsolete `next export` command or add an SPA catch-all redirect that hides real 404s.

Add the same production environment values and keep deploy previews non-indexable. Add the domain in Domain management → Production domains. Use the exact external DNS instructions shown under Pending DNS verification: `www` normally uses the assigned site's CNAME target; the apex uses the displayed ALIAS/ANAME/flattened-CNAME or A fallback. Choose `www` as primary. Check managed HTTPS. To roll back, publish the previous successful deploy; temporarily lock automatic publishing while fixing the release.

Official references: [Netlify builds](https://docs.netlify.com/build/configure-builds/overview/), [external DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/), [HTTPS](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/), [rollback](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/).

## 3. Google Analytics, Search Console and Meta Pixel

The code is installed in `components/TrackingConsent.tsx`, mounted once by `app/layout.tsx`. Do not paste duplicate snippets into the page, header, tag manager or hosting dashboard. Google Search Console's optional verification meta is generated separately by the layout.

### Google Analytics 4

1. In Google Analytics, create or choose the company account and GA4 property. Choose the actual reporting timezone/currency; these have not been assumed for Huner.
2. Add a **Web data stream** for the canonical HTTPS website. Copy its **Measurement ID** (`G-…`), not the numeric property ID, into `NEXT_PUBLIC_GA_ID` for Production, then rebuild/deploy.
3. The app waits for Analytics consent before adding `https://www.googletagmanager.com/gtag/js?id=G-…`. It queues denied defaults, then grants analytics storage only; Google advertising storage/personalization remains denied. Google Signals is disabled in the configuration.
4. Manual `page_view` uses the origin and pathname without query or hash. Set Enhanced Measurement → Page views → advanced settings → **Page changes based on browser history events** off, to prevent duplicate pageviews from the narrative's hash navigation. Disable unnecessary form/outbound-click automatic collection and review the remaining Enhanced Measurement switches.
5. Events available are `page_view`, `explore_application` and `contact_click`. Contact clicks indicate intent, **not a received or qualified lead**. Initially compare them in reports; mark only an agreed business outcome as a key event. There is no form completion event because the site has no contact form.
6. Open a clean session: no optional tags should load before consent. Accept Analytics only and use Tag Assistant/GA4 Realtime to confirm one pageview and expected clicks. Reject/revoke, then reload and confirm collection stops. Consent is saved locally; malformed storage is treated as no decision.

On revoke, the code sets `window['ga-disable-' + measurementId] = true`, updates consent to denied, stops application events and expires matching first-party GA cookies where accessible. Removing a script alone would not stop an already-loaded SDK.

Official guidance: [basic consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode), [consent commands](https://developers.google.com/tag-platform/security/guides/consent), [pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views), [privacy controls](https://developers.google.com/tag-platform/security/guides/privacy).

### Google Search Console

1. Add a **Domain property** for the chosen domain without `https://` or a path. It covers protocols and subdomains. Copy Google's exact TXT record into DNS; verify and retain it.
2. If DNS access is unavailable, add a **URL-prefix property** for the exact canonical origin. Choose HTML tag verification and place only its token in `GOOGLE_SITE_VERIFICATION`. Rebuild, check the public homepage `<head>`, then Verify. Do not use consent-gated Analytics as the ownership verification method.
3. After production indexing is enabled, open `/sitemap.xml`. It should contain the canonical homepage once. Submit its absolute URL in **Sitemaps**.
4. Inspect the homepage using **URL Inspection → Test live URL**. Confirm Google's selected canonical, indexing permission, mobile usability and resource access. Request indexing after the production review. Submission does not guarantee indexing.
5. Check indexing/crawl errors after launch, then review Performance queries and pages weekly. Keep existing verification records through host changes.

Official guidance: [property types](https://support.google.com/webmasters/answer/34592?hl=en), [verification](https://support.google.com/webmasters/answer/9008080?hl=en), [sitemap submission](https://support.google.com/webmasters/answer/7451001?hl=en).

### Meta Pixel

1. In Meta Events Manager, create/select the appropriate web data source for the business and choose manual Pixel installation. Copy the numeric Pixel ID into `NEXT_PUBLIC_META_PIXEL_ID`, then rebuild/deploy.
2. Compare the account-generated instructions with this implementation before activation. The code loads `https://connect.facebook.net/en_US/fbevents.js` only after Marketing consent, initializes once, and sends a PageView. A collaboration-link click sends the custom event `ContactClick`; it is not called a Lead.
3. Keep automatic advanced matching and automatic event detection off for this minimal launch. The implementation requests `autoConfig: false`. Do not add an unconditional `<noscript>` tracking image; it would bypass the consent choice. No Conversions API/backend integration is included.
4. Use Meta Pixel Helper and Events Manager → Test Events to verify PageView and ContactClick. Test Marketing only, Analytics only, both, neither, withdrawal and reload. Confirm no duplicate integrations.
5. Revocation invokes `fbq('consent', 'revoke')`, stops app events, and expires accessible `_fbp`/`_fbc` first-party cookies. Prior data already transmitted is not removed by changing the browser choice.

Meta's public developer pages could not be retrieved during this review and its Test Events help redirected to login. The existing API commands must be confirmed against the account-generated snippet and real network tests before activating a real Pixel. Official destinations: [Pixel setup](https://developers.facebook.com/docs/meta-pixel/get-started/), [consent](https://developers.facebook.com/docs/meta-pixel/implementation/gdpr/), [Test Events](https://www.facebook.com/business/help/742478679120153).

### Privacy readiness

The `/privacy/` page accurately describes the implemented behavior, including the disabled state. Before live tracking, supply the public contact address and have the business confirm the notice's controller identity, purposes, retention, international transfers and rights information for its actual operations. This technical setup does not establish legal compliance. Trackers can remain off while the public site launches.

## 4. Sitemap, robots and on-page SEO

`app/sitemap.ts` generates `/sitemap.xml`; `app/robots.ts` generates `/robots.txt` at build time. They use the confirmed origin, never a guessed domain. Preview builds disallow crawling and keep a noindex meta. Approved production builds allow crawling and reference the sitemap. The privacy page stays noindex and is deliberately omitted from the sitemap. Hash chapters are not separate pages and are not falsely listed as URLs.

Implemented: a descriptive brand/category title, grounded description, canonical origin, Open Graph and X text metadata, one visible H1, semantic H2s and navigation, accessible cell description, factual Organization structured data when the domain is known, and direct application links. No scientific results, addresses, staff, product efficacy or certifications have been invented.

The brand headline remains “Making with life, for life.” Search relevance belongs in the supporting copy and metadata rather than stuffing that headline. Future application pages should have unique factual content and titles; do not create near-duplicate pages just for keywords. Licensed Amazing Grotesk and approved Huner imagery remain outstanding. The site currently has text-only sharing metadata; approve a social preview image before a coordinated social campaign.

## 5. Pre-launch checklist

### Account and publication

- [ ] Domain ownership, renewal and DNS access confirmed.
- [x] Vercel account connected and production deployed in `hunelis-projects`.
- [ ] Business owner confirms the appropriate ongoing hosting plan and billing.
- [ ] Repository ownership, production branch and recovery access confirmed.
- [ ] Public email approved; a real enquiry sent and received.
- [ ] Public copy, font license and schematic labels approved.
- [x] Public production arrival reviewed; no announcements sent.

### Technical and security

- [x] Production build and automated checks pass on Node 24.
- [x] Static output includes homepage, privacy, sitemap, robots and 404.
- [x] No external tracking script tags appear in the unconfigured HTML.
- [ ] Production build passes `npm run check:launch` with final values.
- [ ] All four HTTP/HTTPS + apex/www variants redirect correctly.
- [x] Public HTTPS requests succeed with certificate verification enabled.
- [ ] Complete mixed-content and physical-device review.
- [ ] `/privacy/`, direct hash links, refresh and unknown-path 404 work publicly.
- [ ] No browser errors; cache headers are appropriate; rollback tested.

### SEO and measurement

- [ ] Production robots and meta permit indexing; previews do not.
- [ ] Canonical, structured data, sharing URL and sitemap use one domain.
- [ ] Search Console verifies ownership and accepts the sitemap.
- [ ] Tracking IDs belong to Huner; duplicate snippets are absent.
- [ ] Consent matrix and withdrawal verified with the real vendor accounts.
- [ ] Key events represent their actual meaning; no click is reported as a qualified lead.
- [ ] Privacy notice approved for actual data handling.

### Performance and user experience

- [ ] Run mobile Lighthouse/PageSpeed on the production URL three times; save median results.
- [ ] Target field Core Web Vitals at the 75th percentile: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. These are goals, not measured results from this local review. [Official thresholds](https://web.dev/articles/vitals).
- [ ] Test physical iPhone/Safari, Android/Chrome and tablet touch; normal and slow connections.
- [ ] Test keyboard focus, reduced motion, no JavaScript and graphics failure.
- [ ] Read all copy at 320px width, landscape and 200% zoom.
- [ ] Enquiry, privacy and application links remain easy to find on mobile.

See `OPTIMIZATION-PLAN.md` for audit findings, conversion experiments and the 90-day roadmap. See `LAUNCH-ANNOUNCEMENTS.md` for copy to use only after launch checks pass.
