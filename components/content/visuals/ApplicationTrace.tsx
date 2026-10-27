import { ScienceIcon } from "./ScientificDrawing";
import { ScrollDrawing } from "./VisualMotion";

const directions = {
  food: { target: "Food use", focus: "Composition", test: "Safety & function" },
  fragrance: { target: "Aroma use", focus: "Volatile profile", test: "Sensory evaluation" },
  "raw-materials": { target: "Material use", focus: "Growth structure", test: "Material testing" },
};
export default function ApplicationTrace({ direction }: { direction: keyof typeof directions }) {
  const item = directions[direction];
  return <ScrollDrawing className="application-trace"><figure>
    <div className="trace-flow">
      <div><ScienceIcon kind="organism"/><strong>{item.focus}</strong><span>Biological intermediate</span></div>
      <span className="trace-arrow" aria-hidden="true">→</span>
      <div><ScienceIcon kind="measure"/><strong>{item.test}</strong><span>Application-specific evidence</span></div>
      <span className="trace-arrow" aria-hidden="true">→</span>
      <div><ScienceIcon kind="transform"/><strong>{item.target}</strong><span>Potential direction</span></div>
    </div>
    <figcaption>Application requirements guide what we need to measure upstream.</figcaption>
  </figure></ScrollDrawing>;
}
