# Scientific content expansion — implementation record

## Source and preservation

- Feature branch: `feature/scientific-content`, derived from `b4a96ee3f3820698c83eb66e6b32fb8dea6ecf38` (the last locally recorded `origin/main` and the source previously uploaded to GitHub).
- `production/stable` and `checkpoint/pre-higgsfield-final` remain at `bde2863203166f399b885180e69e94413c23a139`. The original experimental branch remains at `b4a96ee`.
- The current public domain was checked through Vercel on 26 October 2026: it resolves to `dpl_XZ4QHipcGoodoxV3j5cMQELvAQZC`, a CLI deployment without Git metadata. It must not be described as a confirmed deployment of a particular Git commit.
- The GitHub connector returns 404 for the private repository, but a subsequent authenticated Git CLI read succeeded: remote `main` and `experiment/organic-world` both resolve to `b4a96ee3f3820698c83eb66e6b32fb8dea6ecf38`. No remote branch was modified.
- Latest user correction: match the current published transition, not just the final cell image. The earlier source comparison was insufficient: the reconstructed Git baseline shortened the approach and added a pullback absent from production. The published timing, field anchor, compositing and sticky exit are now restored. See `PUBLISHED-TRANSITION-RESTORATION.md` for source verification. The main route stays `FoundryExperience`; Organic World is not promoted, and new scientific content is preserved.
- `sources/` was empty during this audit. No pitch deck or experimental dataset was available there. Synced sources were not modified.
- No production deployment, promotion, account infrastructure, form backend, database or new analytics was introduced.

## File-specific implementation map

| Area | Files | Implementation |
| --- | --- | --- |
| Public evidence / schemas | `content/schema.ts`, `claims.ts`, `references.ts` | Typed maturity, approval, visibility and provenance; build-time validation |
| Publishing gate | `content/server.ts`, `articles.ts` | Public articles require approval, author and actual publication date; safe drafts only appear in explicitly enabled local review |
| Homepage | `app/page.tsx`, `components/FoundryExperience.tsx`, `components/content/HomeScience.tsx` | Qualified positioning, application copy, Process A/B, research and methodology; existing anchors retained |
| Teaching components | `components/content/ProcessExplorer.tsx`, `VariablesExplorer.tsx`, `Science.tsx` | Keyboard/touch selection, complete text alternative, definitions, measurement framework and citations |
| Reading design | `app/content.css`, `ReadingPage.tsx`, `SiteNavigation.tsx` | Existing brand palette and fallback typography; responsive editorial layouts without GPU imports |
| Research architecture | `app/research/**`, `content/research.ts` | Two candidate directions; explicit hypotheses, measurements, limitations and sources |
| Journal / publications | `app/journal/**`, `app/publications/**`, `ArticleReader.tsx`, `JournalSearch.tsx` | Working filtering, search, contents navigation, citations and safe empty archives |
| Institutional pages | `app/applications`, `progress`, `people`, `collaborate` | Possible uses, undated source-aware records, supplied names with confirmation status; no public contact details |
| Discovery | `lib/content-metadata.ts`, `app/sitemap.ts`, `robots.ts`, `not-found.tsx` | Per-page metadata, gated sitemap, noindex review, genuine 404 and breadcrumbs |
| Verification | `tests/content.test.mjs`, `scripts/check-content-export.mjs`, `scripts/review-content-browser.mjs` | Publication/visibility gates, local links and rendered device/interaction checks |

## Internal claim register and editorial decisions

This document is not imported by application code and is not a public asset. No confidential experimental information is copied into the public manifest.

| Claim or record | Source available | Classification | Public decision / outstanding evidence |
| --- | --- | --- | --- |
| Early-stage laboratory, modeling and industry work | Current user brief | Company statement; under investigation | Use qualified current-tense wording; no established industrial capability implied |
| Application-informed Process A specialization | Current user brief | Strategic hypothesis | Explain intended focus and flexible interface with Process B |
| Reusable proprietary process modules | Current user brief | Future target | Describe required validation, never completed technology |
| Cordyceps / Tuber program scope | Planning summarized by user | Candidate research | Do not label as verified active experiments; confirm current scope separately |
| Rice, molasses, SmF / SSF work | Planning summarized by user | Historical / scope pending | Context only, not records of completed trials |
| Model accuracy, biomass improvements, cordycepin yield, VOC profile | No approved Huner dataset | Missing evidence | No numerical results or comparison charts published |
| Cost reduction, environmental advantage, industrial readiness | No applicable supporting evidence | Unsupported historical ambition | Excluded from public claims |
| Autonomous AI bioreactors / commercially validated service | No supporting evidence | Future / unvalidated | Excluded as existing capabilities |
| AdımODTÜ, IFT first place, İTÜ Çekirdek | User-supplied earlier milestone image | Huner-reported recognition | Preserve provenance; date and shareable source pending, no chronology inferred |
| ChangeNOW / Genç İşi Tarım | User-supplied selection correspondence | Selection, not final prize | Preserve selection wording; exact event record and year pending |
| Three team names | Earlier explicit user roster | Supplied names; current roster pending | No inferred roles, qualifications, affiliations, portraits or biographies |
| Contact details | Latest explicit user instruction | Withheld | No mailto/tel links, email schema property or contact form |
| Three educational articles | New drafts based on cited literature and user framework | Unpublished educational drafts | Author confirmation and scientific/editorial sign-off required |
| Proposed research perspective | Current brief and new draft | Unpublished, not peer-reviewed | No PDF or publication date until reviewed |

Public claim wording was reviewed against the brief on 25 October 2026. This is an editorial review date, not an experiment or publication date. External studies are identified by their own authors and dates and are never presented as Huner results.

## Review workflow

Normal builds exclude draft articles from HTML, browser bundles, listings, routes and sitemaps. A real editorial-policy route keeps empty archives compatible with Next.js static export. It is not a placeholder article.

For a **local, non-indexable review only**, set `HUNER_CONTENT_REVIEW=true`. Safe educational drafts then render with an unpublished label, no publication date, no Article structured data and no analytics. Private records are excluded even in review mode. The build rejects this mode with production hosting flags or indexing enabled. This is an editorial gate, not authentication: do not deploy a review build publicly without explicit authorization.

To publish a reviewed article, confirm the named author, source review, publication date, approval, visibility and status together. Never manufacture dates to fill the template. Keep confidential source material outside the public content directory and outside client imports.

The user has not approved a production release of this iteration.

## Dependency maintenance

The audit found advisories in the existing Next.js 16.3.4, sharp and source-map-js versions. Next was updated to 16.4.3 and compatible transitive fixes were installed. The feature checkout now has its own dependency directory; the old shared symlink was detached without altering its target. The declared Node 24 runtime is used for final build/test verification. A dependency audit with zero current findings is not a guarantee of general site security.

## Remaining factual inputs

Confirm current program scope, team roster/roles, event dates and shareable supporting evidence, and authorship/review of the educational drafts. Contact details remain intentionally withheld. Real datasets and an approved publication file are required before empirical charts or PDF downloads can be added.
