# Living focal cell — experiment review

This iteration stays on `experiment/organic-world`. The approved tunnel geometry, original camera definition, biological field, page content, typography, section pacing, and composition styles are unchanged. A separate terminal camera progression now reaches the cell after the approved A–B entry.

## Cell geometry

- **Outer wall:** an asymmetric, tilted ellipsoidal back, an annular folded lip, and a separate descending inner wall. Major lamellar ridges are modeled vertices that follow the cell curvature. The wall has depth rather than being a single textured face.
- **Interior:** three fenestrated tissue layers at different depths, a closed dark core, seven convoluted lamellar folds, 44 smaller biological masses, and branching fibers. Foreground openings reveal successive structures rather than empty background.
- **Pores:** seeded, irregular Voronoi patches with rounded openings and modeled passages through their thickness. Adjacent patches share a tangent plane. Small existing openings expand as tissue matures; this is fixed mesh topology, not runtime creation of new holes or vertices.
- **Fibers:** tapered curve geometry at several internal depths, including developing branches and outer connections. Seven broad tissue folds and 64 outer fibers embed the cell in the existing chamber.
- The cell remains at **(2.98, −0.12, −6.02)**. Its two mesh instances persist during travel and growth. No photograph, image plane, video, object-scale animation, or state-specific model is used.

## Growth model

The existing chain remains **raw condition → environmental memory → Gray–Scott response → delayed morphology**. A new 72 × 72 maturation atlas integrates local tissue deposition from the morphology channel. Different neighborhoods have different biological activity and competence, so they develop at different rates.

Each cell vertex has a base position, a developmental endpoint, and a maturation threshold/window. The shader samples local maturation and changes actual vertex positions and normals. This produces uneven wall thickening, emerging secondary ridges, widening pore rims, extending fibers, increasing interior density, and modest asymmetric expansion. A smaller displacement continues to follow the delayed morphology field.

This is procedural artistic maturation, not a scientific growth prediction. The mesh keeps a fixed number of vertices. Growth accumulates toward a bounded mature state; it does not enlarge indefinitely.

Biology advances at **30 fixed steps per second**, independent of the display frame rate and camera progression. Scroll no longer injects any environmental stimulus. Input only writes raw conditions. Pausing freezes biological development while allowing page/camera navigation. Reduced motion freezes growth.

**Fixed-camera review:** T0 / T1 / T2 / T3 represent **0 / 40 / 80 / 120 simulated seconds**. One raw condition is added after T0. The capture tool advances the same fixed-step solver; these are deterministic samples, not a claimed real-time recording. The camera, lens, mesh identity, and lighting remain fixed. Mean cell-region maturation is 0.000 / 0.451 / 0.722 / 0.853; at T3 local values span 0.299–0.996.

## Camera

The original camera path through A and B is retained. After B, a smooth blend joins a centripetal spline through the existing passage toward the fixed cell. C reveals the cell as an oval body; D targets a porous region beside its layered right wall.

| State | Camera position | Target |
| --- | --- | --- |
| A | (0.000, 1.400, 17.600) | (−0.700, 0.100, −0.400) |
| B | (2.123, 0.783, 8.247) | (2.421, −0.054, −2.029) |
| C | (2.750, −0.260, −4.226) | (2.989, −0.117, −6.024) |
| D | (2.910, −0.190, −5.200) | (3.130, −0.060, −5.940) |

The approach uses **38° FOV and zoom 1**. Camera translation and controlled lateral motion produce the approach. The existing lens/presence settling happens only after D, when the original page continues.

The parallax pair shifts camera X by **−0.045 / +0.045 world units** at fixed maturity. Foreground tissue, the wall, interior structures, and the tunnel change their relative positions and occlusions. An automated projection test also verifies different displacement rates across four depths.

The camera stops outside the cell. No optional State E was added; the interior capture looks through its porous face.

## Performance and verification

Measured in desktop Chrome at **1440 × 900**, with 1,296,000 drawing pixels:

- Cell: **993,872 triangles**, combined into two meshes.
- Visible full world: approximately **1.81–1.85 million triangles**, **11–12 draw calls**.
- Observed active rendering: **60 fps**. Sampled CPU update/render-submission time: approximately **0.3–1.2 ms per frame**.
- No raymarch pass. The principal cost to budget is dense geometry construction and vertex/fragment processing; GPU time was not independently profiled.
- Reduced pixel resolution remains the first runtime quality response. It no longer rebuilds the cell, preserving its mesh identity. Initial coarse-device geometry is smaller.
- These desktop observations are not mobile or cross-browser performance guarantees.

Production build and TypeScript pass. All **27 tests pass**, including delayed treatment effects, spatially uneven bounded maturation, nonuniform geometric changes, camera continuity, parallax, and absence of camera-driven maturation. Browser checks cover the same mesh instances across A–D, continued growth during travel, pause during reverse scroll, reduced motion, GPU-off fallback, and page continuation. No runtime page errors were reported in final checks.

## Scope and limits

The result is still a stylized biological visualization. Very close inspection can expose the procedural pattern of the pores and individual fiber geometry; it is not a scan or a reconstruction of a specific Huner organism. Existing scientific copy and its disclaimer remain unchanged.

`production/stable` and `checkpoint/pre-higgsfield-final` remain at `bde2863203166f399b885180e69e94413c23a139`. No production deployment was made. This iteration stops for visual review.

All captures and per-capture camera, field, maturation, and mesh-identity diagnostics are in the accompanying review folder and `capture-manifest.json`.

