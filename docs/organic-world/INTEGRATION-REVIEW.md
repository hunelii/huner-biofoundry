# Huner — experimental website and focal cell review

The complete desktop prototype is at `/lab/organic-world/`. Everything remains on `experiment/organic-world`. This is a visual review iteration; no production integration or deployment has been made.

## Focal cell

One compressed, tilted oval body sits inside the existing tunnel at the destination of the approved camera path. It has a closed back, eight modeled lip layers, a curved outer wall with real lamellar ridges, and three perforated inner membranes over a darker solid core. The openings are actual geometry. Fine tube fibers and five cradling membrane webs connect it to the throat.

Major wall thickness, ridges, pores, internal layers and fibers are geometry. Fine grain and matte cream-to-olive variation are procedural shading. The cell samples the same biological atlas as the world: input changes environmental conditions, delayed biology evolves, then morphological memory displaces the cell’s vertices. Travel also introduces a small environmental influence. No input writes directly to the biological or morphological channels.

The cell is a stylized study. Pores and fibers retain fixed topology; growth deforms the existing structure rather than creating new holes or branches. Some pore edges and attachment transitions remain visibly procedural, and the core could gain more volumetric complexity in a later visual pass.

## Page integration

The actual `FoundryExperience` component is reused through an optional spatial-layer slot. Its default route still uses the original Living Foundry. The experiment supplies one persistent Organic World canvas instead. `MilestoneJourney`, `TeamCollective`, navigation, copy and content data are reused. No new narrative sections or scientific claims were added.

The existing condition action and pause control operate the new engine. The scene never remounts at section boundaries. Before A, the camera begins farther away and approaches the approved start. A–D use the unchanged spatial camera curve, with an off-axis lens composition and a small zoom adjustment to leave room for DOM text. A broad cream wash affects the entire 3D composition; there are no text-shaped rectangles or text halos.

The original cultivation and material frames provide the scroll time. At a 1440 × 900 viewport, A/B/C/D occur at approximately 2925 / 3960 / 5715 / 7155 pixels. After D there is a short hold, then the lens settles and the scene gradually reduces to 17% overall presence by the applications introduction at 8910 pixels. It remains live through Food, Fragrance, Raw materials, Milestones, Team and Closing. Scrolling backward reverses the same journey.

Typography and copy remain the checkpoint’s. Route-scoped styling makes section backgrounds transparent and uses the existing green type on Culture White. The original anatomical color-key legend and static diagram remain in the shared source but are hidden in this experimental route: the new porous cell does not yet depict those named organelles. The schematic disclaimer remains visible.

## Validation and boundaries

- Production static-export build and TypeScript passed. All 23 tests passed, including new cell-growth and page-progression checks.
- Browser checks passed for canvas continuity, reverse travel, the condition action, paused-state invariance, reduced motion and graphics-off fallback. No page runtime errors or horizontal overflow were reported in the desktop checks. The cell’s measured environmental, biological and morphological channels changed after intervention.
- Rendered HTML comparison preserves all 160 main-page text fragments and all main-content links in both the root route and experimental route.
- The tunnel geometry, camera path and biological field files are unchanged from the approved iteration, `8fa3d32`.
- Desktop Chrome sample: about 60 fps, 0.31 ms CPU update/submission, 1,147,474 rendered triangles, 11 draw calls and 1,296,000 internal pixels after settling. CPU submission is not GPU execution time; this is not a phone benchmark.
- This is a desktop-first review. Tablet/phone art direction and physical-device testing are still deferred. The existing reduced-motion, pause, quality reduction and graphics-off fallback paths are retained.
- The frozen `production/stable` branch and `checkpoint/pre-higgsfield-final` tag both remain at `bde2863203166f399b885180e69e94413c23a139`. The public Vercel deployment was not changed.

The checkpoint is the user-approved reconstruction, not a claimed recovery of the old deployed Git source. The previous isolated four-state review remains available separately. The camera-only study is retained at `/lab/organic-world/study/`.

Stopped for visual review. No merge or deployment will follow without your instruction.
