import { ScienceIcon } from "./ScientificDrawing";

const directions = {
  food: { target: "Food use", focus: "Composition", test: "Safety & function", question: "What would make this suitable as an ingredient?", evidence: "Composition, identity and appropriate safety and functional assessments must be considered together." },
  fragrance: { target: "Aroma use", focus: "Volatile profile", test: "Sensory evaluation", question: "Which compounds contribute to the intended aroma?", evidence: "Chemical characterization and sensory evaluation address different parts of the question. Biomass alone is not an aroma profile." },
  "raw-materials": { target: "Material use", focus: "Growth structure", test: "Material testing", question: "How would growth structure meet a material requirement?", evidence: "Growth form must be considered alongside composition, processing and tests of the intended finished material." },
};
export default function ApplicationTrace({ direction }: { direction: keyof typeof directions }) {
  const item = directions[direction];
  return <div className="application-trace"><figure>
    <p className="application-question">{item.question}</p>
    <div className="trace-flow">
      <div><ScienceIcon kind="organism"/><strong>{item.focus}</strong><span>Biological intermediate</span></div>
      <span className="trace-arrow" aria-hidden="true">→</span>
      <div><ScienceIcon kind="measure"/><strong>{item.test}</strong><span>Application-specific evidence</span></div>
      <span className="trace-arrow" aria-hidden="true">→</span>
      <div><ScienceIcon kind="transform"/><strong>{item.target}</strong><span>Potential direction</span></div>
    </div>
    <figcaption>Application requirements guide what we need to measure upstream.</figcaption>
  </figure><details className="application-evidence"><summary>What would we need to establish?</summary><p>{item.evidence}</p><a href="/approach/#measurement">Explore the measurement approach ↗</a></details></div>;
}
