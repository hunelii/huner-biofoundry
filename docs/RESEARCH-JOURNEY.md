# Huner — applying the Nutshell study

27 October 2026 · local implementation on `feature/scientific-content`

## Design translation

The source study is `../output/nutshell-design-study/inceleme.html`. This iteration applies its communication lessons: keep a recognizable subject across stages, start with a question, reveal evidence on demand, and show what an observation enables next. Huner's cream/green palette, typography and spatial cell experience remain the design foundation. No Nutshell artwork, code, claims or branding was copied.

The homepage now reads **cell → culture and measurement → process → applications → research and records**. The existing 3D cell and camera journey remain intact. Two-dimensional diagrams follow the cell to explain relationships; they do not replace it.

## Implemented

- The existing cell legend now opens explanations of the wall/membrane, nucleus, mitochondria and vacuole. Each connects basic biology to a research question and links to OpenStax. A native dialog supports Escape, focus return and continuation to the culture section.
- A single deterministic culture drawing persists across biomass, morphology and target-compound questions. Selection changes the observation overlay, method, interpretation limit, source and proposed record fields. The culture geometry does not encode measurements.
- The process follows measurement. Characterization reuses the culture drawing; the intermediate stage shows the identity, properties, handling and acceptance information that would cross into an application process.
- Application explanations now begin with a downstream question and disclose what evidence would be needed to answer it.
- Milestones disclose status, provenance and date uncertainty, with direct links to their archive entries. Selection notices remain selections, not final-event wins.
- The conditions section gains a brief explanation of delayed environmental response. Its original heading and composition are retained.

## Motion, rendering and accessibility

The original camera, material transition and shader files are unchanged. `LivingFoundryCanvas.tsx` only adds visibility handling: it suspends drawing while an opaque reading surface fully covers the viewport. The fixed navigation changes contrast as the paper sections pass it, and the original cell becomes visible again when scrolling back.

The new observation component uses the existing scroll emphasis hook, shared pause state and reduced-motion behavior. Manual selection or keyboard focus suspends automatic selection. SVG geometry is deterministic, lightweight and independent of a new animation loop. Dialog and reading-theme observers clean up on unmount. Native disclosures retain all measurement explanations without JavaScript. Phone structure controls have 44 px touch targets.

## Content boundaries

The culture, fields and process specification are conceptual examples. They are not completed Huner studies or experimental results. No invented numerical data, dates, roles, contact details or performance claims were added. General biology sources explain structures; measurement sources provide methodological context rather than validating a Huner protocol.

## Verification

- Existing unit suite: 32/32 pass.
- Production build and TypeScript: pass.
- Static export audit: 19 HTML pages and 454 local links; no missing anchors, duplicate titles, draft leaks or public contact links.
- `scripts/review-research-journey.mjs`: 12 named browser checks pass, no captured application errors. Covers the preserved 3D cell, dialog focus/Escape, continuation anchor, reverse scrolling, observation/source/record synchronization, keyboard selection, intermediate specification, milestone provenance, 390/820/320 px layouts, reduced motion and JavaScript-disabled measurement reading.
- Desktop and phone captures were visually inspected; inherited mobile grid rules and the doubled continuation-anchor offset were corrected.
- Captures and machine-readable results: `../output/research-journey-review/`.

These are headless browser viewport checks, not physical-device performance measurements. No hosting configuration, new dependency, analytics or backend was added. Verification used the local preview. Production deployment is separate from this implementation checkpoint.
