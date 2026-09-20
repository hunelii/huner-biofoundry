# Organic World — four-reference visual review

20 September 2026

This is a local visual review iteration, not an approved production integration. The remaining differences are material: the scene is still more regular and less organically interconnected than the four references.

The authoritative references are the four original PNGs supplied on 19/20 September. Copies in this review folder are used only for comparison. None is included in the app’s public assets, canvas, background, textures or camera journey.

The five corrections targeted the detached outline, overly concentric folds, suspended inner structures, empty white interior and regular pores/sparse fibers. The terrain and interior depth show the clearest improvements. Cell morphology and tissue connectivity still need further art direction if another iteration is requested.

## State A — Distant form

![State A](/Users/huneli/.codex/.chatgpt-projects/g-p-6a97d7eb5f448191a652863e241cfb68/checkpoints/organic-world-review/STATE_A.png)

**REFERENCE:** photo2, with photo3’s layered terrain

**MATCHES:** The aperture occupies the right of the composition. Its outer surface now continues into pale, shallow terrain and gradually dissolves into Culture White. The detached silhouette has been removed. The raised crest is asymmetrical.

**MISMATCHES:** The overall field remains more radial and regular than photo2. It has fewer independent, overlapping folds, and the two inner forms still look more like chambers than embedded oval bodies.

**IMPLEMENTATION:** A continuous parametric mesh supplies the terrain, raised folds, real ridges and aperture. Vertex color and a gradual outer-edge opacity soften the terrain into the background. Delayed biological morphology displaces this same mesh; the image is not used as a texture.

**NEXT ITERATION:** Break the radial organization into a few larger, differently oriented folds while preserving the same aperture and camera target.

## State B — Approach

![State B](/Users/huneli/.codex/.chatgpt-projects/g-p-6a97d7eb5f448191a652863e241cfb68/checkpoints/organic-world-review/STATE_B.png)

**REFERENCE:** photo2 for depth; photo3 for curved lamellae

**MATCHES:** Actual camera travel reveals the depth of the lip, the raised left fold and the nested structures. Ridges have real geometry and follow the curved surface. Pale exterior tones move into olive recesses.

**MISMATCHES:** The aperture rim is still more uniformly ribbed than the references. Transitions between smooth membranes and fine porous tissue are less rich. Fiber attachments can still read as individual wires.

**IMPLEMENTATION:** The same perspective camera moves through the same scene. Surface ridges and lip are triangles; the finest grain is procedural shading. The independent growth clock continues updating vertex displacement during travel.

**NEXT ITERATION:** Vary ridge spacing locally, soften the most abrupt creases and blend the inner chamber attachments into broader tissue bridges.

## State C — Cellular proximity

![State C](/Users/huneli/.codex/.chatgpt-projects/g-p-6a97d7eb5f448191a652863e241cfb68/checkpoints/organic-world-review/STATE_C.png)

**REFERENCE:** photo2’s nested cells; photo3 and photo4’s porous material vocabulary

**MATCHES:** The small chamber now has a porous membrane at its mouth. Different pore sizes, layered surfaces and branched fiber connections become visible at close range. Porosity is actual open geometry.

**MISMATCHES:** The selected form still reads more as an open membrane chamber than the compact, rounded cell in photo2. Its tissue is too thin and some pore intersections remain abrupt. It does not yet achieve the dense fine network seen in photo3–4.

**IMPLEMENTATION:** Clipped membrane triangles form rounded, irregularly sized openings. Tube meshes form the fibers. A shared biological atlas drives surface movement and restrained material variation; new pores are not born dynamically.

**NEXT ITERATION:** Sculpt a fuller oval wall and a denser porous core around the existing passage, then give the connecting tissue more thickness and better shared attachment deformation.

## State D — Interior

![State D](/Users/huneli/.codex/.chatgpt-projects/g-p-6a97d7eb5f448191a652863e241cfb68/checkpoints/organic-world-review/STATE_D.png)

**REFERENCE:** photo1 primarily; photo4 for nested chambers

**MATCHES:** The camera is physically inside the original formation. Nested perforated membranes now lead to a modeled olive back wall rather than a large white opening. Layers, fibers and occlusion establish depth within one continuous world.

**MISMATCHES:** The inner layers remain too regular and comparatively smooth. The reference’s wrapping porous shell and delicate branching network are substantially richer. The deepest basin has a noticeable procedural spiral; it should become less regular. Some close-up edges remain thin.

**IMPLEMENTATION:** Four nested membrane surfaces, a concave terminal basin and curved fiber meshes form the interior. All remain in the same scene throughout the journey. Fine grain and roughness are shader-based; delayed growth changes the geometry through vertex displacement.

**NEXT ITERATION:** Replace the regular terminal spiral with an irregular layered recess, develop a wrapping porous shell and couple the fine fiber network more closely to the membranes.

## Geometry, shading and biological response

The outer terrain, aperture, ridges, chambers, membrane openings, basin and fibers are real mesh geometry. The finest grain, matte surface response and cream-to-olive tone variation are shaders/materials. The outer terrain has a gradual opacity taper; it is a displaced surface, not an image plane.

The existing deterministic seed helper and environment → delayed response concept are retained. The isolated lab uses a 72 × 72 CPU simulation atlas, with separate raw conditions, delayed conditions, reaction–diffusion biology and slower morphological memory. Only the biological/morphological channels drive vertex displacement and modest color/roughness changes. Pointer/touch input and the keyboard-accessible condition button alter the environment, never the biological field directly. Simulation continues on its own clock during camera movement. The camera and field architecture were not rebuilt in the reference refinement.

Pores currently have fixed topology. Growth deforms their surrounding surfaces; it does not create new holes, branch new fibers or simulate tissue mechanics. The atlas is two-dimensional rather than a volumetric biological simulation. Fine shading normals remain approximate under displacement, and nearby membrane/fiber attachment motion could be better coordinated. This is an artistic system, not a scientific model of a Huner organism.

## Technique choice

| Approach | Fit for this study | Cost / limitation |
| --- | --- | --- |
| Procedural meshes + field displacement — selected | Explicit thin sheets, lamellar ridges, openings and fibers; easy inspection and predictable camera depth; direct vertex displacement | Fixed topology, potential sheet intersections, limited volumetric growth; geometry density must be managed |
| SDF / full-screen raymarching — considered | Useful for smooth mass-to-cavity blending and topology changes | Thin membranes and fibers need careful distance bounds; per-pixel sampling and normal/light evaluations can be expensive; no visual or runtime SDF benchmark was built in this pass |

The choice is provisional, based on the modeled thin-sheet vocabulary and the measured mesh prototype, not a claim that raymarching is slower on every device. Three.js BufferGeometry is the implementation basis: https://threejs.org/docs/#api/en/core/BufferGeometry. A focused SDF test would be justified if future review prioritizes topology-changing growth or smoother connected mass.

## Measured cost and checks

- Desktop Chrome, 1440 × 900: approximately 60 fps, 0.58 ms average CPU update/submission, 820,112 rendered triangles, 9 draw calls and 1,296,000 internal pixels in the sampled interior view. CPU submission time is not GPU execution time.
- Narrow viewport in the same desktop browser, 390 × 844: approximately 60 fps, 0.60 ms CPU, 491,726 triangles and 329,160 internal pixels. This is not a physical phone performance result.
- Quality selection limits geometry and internal pixel count. Sustained slow frames reduce geometry, resolution and simulation frequency. Hidden tabs stop updates. Pausing freezes biological state while preserving camera inspection.
- Production static-export build and TypeScript passed; all 21 model/launch/camera/organic-field tests passed.
- Browser checks covered all four camera states, reverse travel, real delayed response, pause, reduced motion, static graphics-off fallback, and desktop/narrow viewport layouts. No page runtime errors were reported. Narrow viewport had no horizontal overflow.
- Earlier live paused-field check held ticks, biology, morphology and environment identical over 2.5 seconds. The controlled simulation test demonstrates that identical treated/control fields diverge only after the environmental delay.
- Real touch hardware, Safari/Firefox, GPU timer measurements, device thermal behavior and a fresh clean-clone installation remain unverified. Dev hot-reload produced a duplicate-Three warning during iteration; final direct-route verification reported no page errors.

## Preservation and scope

- Reconstructed checkpoint: bde2863203166f399b885180e69e94413c23a139.
- Frozen tag: checkpoint/pre-higgsfield-final. Frozen branch: production/stable. Both still point to that same commit.
- The checkpoint is the user-authorized reconstruction, not a claimed recovery of the original deployed Git SHA. Its provenance is recorded in docs/CHECKPOINT.md and ../checkpoints/pre-higgsfield-reconstructed/checkpoint.json.
- Original post-Higgsfield work remains at backup/post-higgsfield-current (c3b93f65371a4f3101436e1649f5fdbc929b92b3), with the private full archive retained separately.
- Pre-reference lab mechanics are preserved in commit d468fc2. Earlier captures remain in before-four-reference-refinement/.
- All new work stays on experiment/organic-world. The route is /lab/organic-world, unlinked from public navigation and marked noindex.
- Existing homepage, global styling, layout, components, Living Foundry, content library and public assets have no diff from the reconstructed checkpoint. Only the lab and its supporting files changed.
- No deployment or production mutation was made. Public Vercel deployment remains dpl_XZ4QHipcGoodoxV3j5cMQELvAQZC.

## Before any production integration

Visual approval comes first. The main remaining work would be less radial macro folds, a fuller cell wall/core, denser connected porous tissue, improved displacement normals and shared fiber attachments. Production work would also need real-device performance/accessibility review, adaptive initialization, refined static artwork and a separate plan for coupling this lab to the existing homepage. No homepage integration is authorized by this review.

Stopped for visual approval. The next-iteration notes above are proposals only.

