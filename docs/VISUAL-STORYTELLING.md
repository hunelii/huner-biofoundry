# Huner — visual explanation review

27 October 2026 · `feature/scientific-content`

## Checkpoint before this work

At the user's request, `e2fd45566fc67e23acd94451c48392f0ecc09959` was created and pushed to `origin/feature/scientific-content`. The remote ref was independently checked. This checkpoint includes the scientific content expansion and restoration of the published cell transition. It does not include the visual explanation changes described below. The main branch and production alias were not changed.

## Reading the supplied playbook

The supplied Chartosaur checklist and Present With Data Playbook were read through the chart-selection, credibility, emphasis, audience, tables, presentation and resource sections. Repeated navigation, example datasets, outreach templates and résumé advice are not website content. Its relevant principles are applied rather than reproducing its examples or inferring that Huner has comparable data.

| Principle | Application to Huner |
| --- | --- |
| Begin with the reader's question and a clear takeaway | Each figure answers a particular question: what crosses Process A/B; how research activities inform one another; why different properties require different observations. |
| Choose a form that expresses the relationship | A sequence for process development, a connected cycle for learning, branches for measurement and a short flow for application requirements. There are no unsupported trend, yield, market-size or cost charts. |
| Direct labels reduce decoding | Process steps have named drawings, research nodes have direct labels, and application icons carry adjacent text. Small numbers are sequence identifiers, not values. |
| Focus attention without deleting context | Scroll changes the selected step and line emphasis. Research descriptions remain visible; complete process and measurement explanations remain available through native disclosure elements. |
| Let the audience control detail | All selections work by touch and keyboard. Manual selection suspends automatic selection until the reader chooses “Follow scroll”. Focus in the process panel also suspends automatic selection. |
| State source, scope and uncertainty | Figures identify their conceptual status and Huner's proposed framework. Measurement explanations link to the existing approach and sources. No sample values or performance claims were invented. |
| Keep scales honest | No numeric axes, proportions or confidence bands are used without data. Small drawing details do not encode quantities. The modeling glyph is a symbolic icon, not an experimental chart. |
| Consistent color, readable type, redundant cues | Existing cream/green tokens and fonts are retained. Selected states also use filled nodes, underlines, borders and accessible button states; meaning does not depend solely on green shades. |
| Layer the explanation | Short figure takeaway → named steps → methodological explanation → limits and sources. The existing measurement tables remain available for comparison and exact wording. |
| Remove decoration that impedes comprehension | No new charting library, 3D chart, background effect or continuous animation loop was added. The established 3D cell remains the experiential layer. |

The playbook's warning about misleading 3D charts does not justify removing the user's approved 3D cell experience. Likewise, its later “power word” list is not a reason to add unsupported scientific or commercial claims. Clear, bounded wording takes precedence.

## Implemented surfaces

- **Process:** five original vector drawings, changing with the selected step; Process A/B boundary, downstream requirements and complete text retained. Used on the homepage and Approach.
- **Research:** an illustrated laboratory–modeling–application learning cycle, with scroll emphasis and direct selection. Used on the homepage and Research.
- **Measurement:** one culture branching into biomass, morphology and target-compound observations; each selection explains its method and interpretation limit. Used on the homepage and Approach.
- **Applications:** composition, volatile profile and growth structure mapped to the evidence needed for possible downstream uses. Used in all three homepage application chapters and their detail page.
- **Supporting explanations:** original line icons for methodology and journal categories; cultivation-variable illustrations. The initial field, conditions, cultivation, cell, milestones and team retain their existing experiential visuals.

## Motion and accessibility

Scroll schedules a single frame only while the figure intersects the viewport. Idle figures do not run a frame loop. Listeners and observers are cleaned up. The homepage pause state is shared with the new figures. Reduced-motion preferences suppress scroll-driven changes; all controls and explanations remain usable. No scroll hijacking or forced camera movement was introduced.

The process retains arrow/Home/End tab navigation. Research and measurement controls use native buttons with pressed state. Diagram strokes are supplementary to HTML labels, captions and explanations. Native disclosures provide the complete sequence with JavaScript disabled.

## Verification

- 32 existing tests pass; production build and TypeScript pass.
- Browser script `scripts/review-visual-stories.mjs`: 16 named checks pass with no captured application errors. This includes scroll emphasis, manual-selection persistence, keyboard operation, 390 px phone, 820 px tablet, 320 px narrow phone, reduced motion, JavaScript-disabled reading and the shared pause state.
- The existing 3D cell renders in the main route. No files under `living-foundry/` or the original global stylesheet were modified.
- Screenshots and JSON results are in `../output/visual-stories-review/`. Component screenshots isolate the figure from fixed navigation; the homepage uses ordinary viewport captures.

Browser viewport tests do not establish performance on a physical low-power phone. No numerical research dataset has been supplied, and no experimental result graph is claimed. This iteration remains a local preview; the earlier checkpoint is the version pushed to GitHub.
