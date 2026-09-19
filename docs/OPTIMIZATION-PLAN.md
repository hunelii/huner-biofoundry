# Huner Biofoundry — optimization and growth plan

This is a source and local-build audit, not a report of real visitors or a completed A/B experiment. No conversion lift, Lighthouse score or search ranking has been invented.

## Performance: findings and implemented fixes

| Finding | Fix implemented | Remaining verification |
|---|---|---|
| The detailed cell was bundled with the engine and constructed synchronously during scrolling. | Type-only reference, separate dynamic import, idle preparation, and texture computation split into 64-row tasks. The fallback remains available while it prepares. | Profile geometry preparation and shader compilation on physical low-end phones. |
| Every scroll event queried layout and rendered immediately. | Scroll updates are coalesced into a single animation frame. | Compare trace long tasks during a complete scroll journey. |
| Animation continued behind the opaque closing section. | Suspend when the closing fully covers the viewport. | Confirm battery/CPU behavior on physical devices. |
| Internal GPU/performance failures bypassed layout-preserving cleanup. | Route failures through the owner, preserve chapter position, dispose resources and show static content. | Exercise context loss and reduced-motion switching in target browsers. |
| Cell rendering bypassed the normal simulation budget. | Separate cell render-cost observation and lower pixel budgets after sustained slow work; static fallback if slow work persists. | CPU submission duration is only a proxy, not a direct GPU timer. Real device profiling remains needed. |
| The cell and final canvas previously constrained sharpness differently. | Shared DPR-aware size, capped at 4.2 MP desktop / 1.8 MP phone/coarse input; cached unchanged views. | Balance quality against scrolling cost on older graphics hardware. |
| Static/no-JavaScript cultivation did not get all fallback styling. | Static colors and readable labels now apply whenever the GPU is not live; motion controls appear only with a live engine. | Check the entire no-JavaScript narrative. |
| Optional measurement could add load cost. | No vendor library loads before its consent category; no IDs means no tracking integration loads. | Test real IDs, blocked scripts and revocation after account setup. |

The local static homepage is about 15.4 KB before compression. Its declared script URLs total about 177 KB gzip, including a roughly 39 KB legacy `nomodule` polyfill; these are file-size calculations, not browser transfer measurements. Actual modern-browser requests differ. The largest individual generated chunk is approximately 322 KB raw / 75 KB gzip. The 3D engine is loaded after the semantic page; the detailed cell is deferred further.

Preserved strengths: semantic content exists before JavaScript, the arrival needs no GPU or large hero photograph, the fallback image is only about 1.8 KB, there are no remote webfonts, the biological grid is independent of output resolution, and hidden tabs stop simulation updates. The unused mushroom photograph is no longer requested by the page; its presence in the source is not a page-load bottleneck.

After deployment, run three mobile PageSpeed/Lighthouse checks on the real production URL and keep the median. Inspect the network waterfall and main-thread trace. Use field Core Web Vitals as traffic becomes available: LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile. Lighthouse's TBT is a lab proxy and does not measure field INP. [Official Web Vitals guidance](https://web.dev/articles/vitals).

If the trace still shows long tasks, prioritize: (1) worker/prebaked texture preparation, (2) instancing repeated pore meshes, (3) lower shadow-map/geometry detail on constrained devices, (4) defer GPU initialization until the semantic arrival paints. Change one source of cost at a time and preserve the fallback. Do not remove the signature experience based on an unmeasured assumption.

## Mobile experience

Implemented: both application navigation and the conditional enquiry action remain available on phones; a direct “Explore the possibilities” link lets readers skip the long visual journey. The arrival uses a smaller minimum type size for 320px screens. Copy offsets are clamped to stable viewport dimensions. Static/mobile sections use shorter spacing. Fixed controls account for safe areas and use 44px targets; consent choices are separate and scroll within short screens.

Validate at 320×568, 390×844, tablet portrait, phone landscape and 200% zoom. A simulated viewport does not reproduce mobile Safari's browser chrome, touch physics, thermal throttling or memory pressure. Test deliberate phone taps versus scrolling and sustained tablet contact on real devices before claiming full device coverage.

## SEO and content priorities

The homepage now has a descriptive search title, canonical support, social text metadata, factual Organization structured data when configured, one H1, semantic headings and a proper sitemap/robots route. Production indexing remains gated until the canonical origin is supplied and approved.

Potential content directions to validate with Search Console and conversations:

- “What is a biofoundry?” — a clear explanation grounded in Huner's actual approach.
- “Biological production for food” — what Huner is exploring, with current limits.
- “How living systems make aroma molecules” — reviewed scientific explanation, not product efficacy claims.
- “From organism to controlled cultivation” — distinguish the illustrative web simulation from actual laboratory methods.
- “Biological raw materials: questions for collaborators” — explain the scope of an initial conversation.

These are hypotheses, not proven high-volume keywords. Build dedicated application pages only when there is enough approved, distinct material to answer a real question. Add descriptive titles, an H1, a concise answer, relevant internal links, dated factual evidence and an enquiry route. Cite scientific sources, have technical claims reviewed and avoid invented yield, impact or team data. Keep the artistic cell clearly labeled as schematic.

## Conversion flow

Primary recommended goal: a relevant collaboration enquiry. A mailto click is only an intent signal; a received and qualified email is the actual outcome.

| Friction | Action |
|---|---|
| Visitors had to traverse the full experience to reach applications. | Direct application link added below arrival copy; navigation remains available. |
| The website ended with only a link back to the beginning. | A clear collaboration invitation is prepared; it appears when the approved public email is configured. |
| The value proposition is evocative but broad. | Keep the brand headline, then make the three application directions and the type of conversation concrete. |
| Visitors may confuse the simulation with experimental evidence. | Preserve schematic labels; add approved actual-work evidence when supplied. |
| Email clicks do not prove enquiry completion. | Review received enquiries against a simple qualification definition, separately from analytics clicks. |

Do not add an unsupported “Book a demo,” commercial availability claim, fabricated testimonial or response-time promise. A short form may be useful later if mailbox friction is demonstrated, but it requires a real receiving workflow and spam/accessibility handling.

## A/B tests to run after a baseline exists

No live random assignment has been deployed and no test results exist yet. Start with five usability conversations if launch traffic is too small for a useful split test.

| Test | A | B | Hold constant |
|---|---|---|---|
| Headline | “Making with life, for life.” | “Cultivating possibilities with life.” | Supporting explanation, CTA and visual sequence |
| CTA | “Discuss a collaboration” | “Talk to Huner” | Destination, placement, headline and surrounding copy |
| Section order | Current narrative before the applications index | Compact application links directly after arrival, then the living story | Same factual copy, enquiry destination and model |

Run these **sequentially**, not simultaneously. Do not replace the brand headline on the basis of aesthetics alone. Choose one primary metric: received qualified enquiries per eligible visitor where lawful, or contact-click rate explicitly labeled as a proxy. Use application exploration and engagement as secondary measures; use mobile usability and load performance as guardrails.

After two to four weeks of baseline data, estimate the base conversion rate and choose a minimum detectable improvement and sample requirement before starting. Randomize eligible consented visitors 50/50 with stable assignment. Track exposure once with `experiment_id` and `variant` only after Analytics consent. Exclude staff/test visits consistently. Run through complete weekly cycles until the planned sample is met; do not stop on a temporary winner. Report uncertainty and inconclusive results. If traffic cannot support the sample, use interviews and a carefully documented sequential design change rather than claiming an A/B win.

## 90-day growth roadmap

| Period | Work | What to measure |
|---|---|---|
| Days 1–14 | Complete domain/HTTPS/measurement, verify enquiries, inspect indexing, conduct five usability conversations, correct launch defects. | Public checks, first indexed page, enquiry delivery, qualitative friction. |
| Days 15–30 | Publish one reviewed “What is a biofoundry?” explanation and one factual application overview. Add links from relevant sections. Establish reporting baseline. | Relevant search queries, application visits and enquiry relevance. |
| Days 31–60 | Publish one approved cultivation/process story and one collaborator FAQ. Begin the first experiment only if sample requirements are feasible. Request accurate links from existing genuine partners or directories. | Search impressions/clicks by intent, referral quality, qualified conversations. |
| Days 61–90 | Expand the strongest application direction with actual evidence. Review experiment uncertainty, prune repetitive copy, improve slow devices and refresh internal links. | Returning relevant visitors, enquiries received/qualified, mobile field performance. |

Backlink strategy: earn editorial links through useful reviewed explanations, real research/community contributions, verified partner pages and relevant event profiles. Keep outreach individual and relevant. No outreach has been sent. Avoid bought ranking links, bulk directory submissions or reciprocal-link schemes. Qualify paid placements appropriately. [Google's link-spam policy](https://developers.google.com/search/docs/essentials/spam-policies#link-spam).

Weekly: inspect Search Console issues, enquiries, consented event quality and site availability. Monthly: review content accuracy, dependency updates, broken links and performance regressions. Quarterly: revisit audience questions and application priorities. Do not schedule an automation or paid campaign until its owner, budget and desired behavior are agreed.
