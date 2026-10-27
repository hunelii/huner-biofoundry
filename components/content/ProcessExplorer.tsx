"use client";
import { useId, useRef, useState } from "react";
import ScientificDrawing, { type DrawingKind } from "./visuals/ScientificDrawing";
import { useVisualProgress } from "./visuals/VisualMotion";
const stages = [
  { name: "Biological system", label: "Define", group: "PROCESS A / BIOLOGICAL PRODUCTION", title: "Begin with a biological question.", copy: "Choose the organism and strain in relation to the intended output. Establish what is known about its growth requirements and what still needs to be measured.", measure: "Culture identity · intended output · a relevant baseline" },
  { name: "Cultivation", label: "Cultivate", group: "PROCESS A / BIOLOGICAL PRODUCTION", title: "Conditions become process decisions.", copy: "Consider the medium, feedstock, cultivation route and environment together. Their importance depends on the organism and the target; a universal recipe is not assumed.", measure: "Defined inputs · monitored conditions · repeatable sampling" },
  { name: "Characterization", label: "Characterize", group: "PROCESS A / BIOLOGICAL PRODUCTION", title: "Measure what matters to the next step.", copy: "Evaluate biomass, morphology or target compounds with methods appropriate to the question. A change in one property does not automatically establish an improvement in another.", measure: "Measurement method · uncertainty · comparison criterion" },
  { name: "Biological intermediate", label: "Specify", group: "THE INTERFACE / APPLICATION-INFORMED", title: "Agree on what crosses the boundary.", copy: "Define the intermediate and the properties required downstream. Harvest or stabilization can belong to Process A when they are necessary to deliver it. The boundary follows the application.", measure: "Intermediate specification · handling · downstream compatibility" },
  { name: "Application transformation", label: "Transform", group: "PROCESS B / APPLICATION-SPECIFIC", title: "Develop the finished application.", copy: "Transform the biological intermediate through the processing needed for a specific material or ingredient. Formulation, finishing, safety and qualification depend on the intended application.", measure: "Application performance · safety · qualification" },
];
export default function ProcessExplorer() {
  const [active, setActive] = useState(0), id = useId(), tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [manual, setManual] = useState(false);
  const ref = useVisualProgress(setActive, stages.length, manual);
  const drawings: DrawingKind[] = ["organism", "culture", "measure", "specify", "transform"];
  const stage = stages[active];
  const select = (index: number) => { setManual(true); setActive(index); tabs.current[index]?.focus(); };
  return <div ref={ref} className="process-explorer visual-process" data-step={active}>
    <div className="visual-toolbar"><span>01—05 / FOLLOW THE BIOLOGICAL INTERMEDIATE</span><button type="button" aria-pressed={!manual} onClick={() => setManual(!manual)}>{manual ? "Follow scroll" : "Scroll emphasis on"}<span aria-hidden="true"> {manual ? "↓" : "Ⅱ"}</span></button></div>
    <div className="process-bands"><span><b>Process A</b> Cultivation → biological intermediate</span><span><b>Process B</b> Application-specific transformation</span></div>
    <div className="process-map" data-stage={active}>
      <div className="process-tabs" role="tablist" aria-label="Explore the biological value chain">{stages.map((item, index) => <button key={item.label} ref={element => { tabs.current[index] = element; }} role="tab" id={`${id}-tab-${index}`} aria-selected={index === active} aria-controls={`${id}-panel`} tabIndex={index === active ? 0 : -1} onFocus={() => setManual(true)} onClick={() => select(index)} onKeyDown={event => { const next = event.key === "ArrowRight" ? (active + 1) % stages.length : event.key === "ArrowLeft" ? (active + stages.length - 1) % stages.length : event.key === "Home" ? 0 : event.key === "End" ? stages.length - 1 : null; if (next !== null) { event.preventDefault(); select(next); } }}><span>0{index + 1}</span>{item.label}<small>{item.name}</small></button>)}</div>
    </div>
    <div className="process-detail" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`} tabIndex={0} onFocus={() => setManual(true)}>
      <figure className="process-specimen"><ScientificDrawing kind={drawings[active]} /><figcaption><span>0{active + 1}</span>{stage.name}<small>Conceptual process schematic</small></figcaption></figure>
      <div className="process-explanation"><p className="eyebrow">{stage.group}</p><h3>{stage.title}</h3><p>{stage.copy}</p><p className="process-measure">{stage.measure}</p></div>
    </div>
    <p className="feedback-line"><span aria-hidden="true">←</span> Requirements travel back upstream. A different application may need a different cultivation target.</p>
    <details className="full-sequence"><summary>Read the complete sequence</summary>{stages.map(item => <div key={item.label}><h4>{item.name}</h4><p>{item.copy}</p></div>)}</details>
    <p className="scope-caption">Huner’s intended specialization is Process A. This is a proposed working framework, not a claim of a validated commercial service.</p>
  </div>;
}
