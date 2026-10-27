"use client";

import { useId, useState } from "react";
import { useVisualProgress } from "./VisualMotion";

const observations = [
  { title: "Biomass", question: "How much biological material?", method: "A defined recovery, sampling and mass basis.", limit: "Supporting substrate can complicate separation. Growth appearance is not a mass measurement.", tag: "AMOUNT" },
  { title: "Morphology", question: "What form does growth take?", method: "Comparable images and a stated analysis method.", limit: "One image may not represent the culture. Structure alone does not establish composition.", tag: "STRUCTURE" },
  { title: "Target compound", question: "What is present in the sample?", method: "A suitable analytical method and reference standard.", limit: "More biomass does not establish more of a chosen metabolite or the suitability of an application.", tag: "COMPOSITION" },
];

export default function MeasurementLens() {
  const [active, setActive] = useState(0), [manual, setManual] = useState(false), id = useId();
  const ref = useVisualProgress(setActive, 3, manual);
  return <div ref={ref} className="measurement-lens" data-step={active}>
    <div className="visual-toolbar"><span>ONE CULTURE / DIFFERENT OBSERVATIONS</span><button type="button" aria-pressed={!manual} onClick={() => setManual(!manual)}>{manual ? "Follow scroll ↓" : "Scroll emphasis on Ⅱ"}</button></div>
    <div className="sample-origin"><span aria-hidden="true">◎</span><p>A traceable culture sample<small>Choose an observation to see what it can—and cannot—tell us.</small></p></div>
    <div className="measurement-branches">
      {observations.map((item,i)=><button key={item.title} type="button" className="measurement-branch" aria-pressed={active===i} aria-controls={`${id}-reading`} onClick={()=>{setManual(true);setActive(i);}}>
        <span className="sample-stem" aria-hidden="true"/>
        <svg viewBox="0 0 240 150" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
          {i===0 ? <><path d="M49 102h142v20H49ZM64 102V91h112v11M107 122v9h26v-9"/><ellipse cx="120" cy="78" rx="43" ry="13" className="visual-wash"/><path d="M77 78v13q43 22 86 0V78"/>{[0,1,2,3,4].map(n=><path key={n} d={`M${91+n*13} 79q-7-20 5-24m-6 14-7-5`}/>)}</> : i===1 ? <><circle cx="120" cy="77" r="48"/><circle cx="120" cy="77" r="41" className="visual-wash"/>{[0,1,2,3,4,5].map(n=><path key={n} d="M120 77q-12-22 6-33m-10 18-14-9" transform={`rotate(${n*60} 120 77)`}/>)}<path d="M155 112l22 22"/></> : <>{[75,120,165].map((x,n)=><g key={x}><path d={`M${x-11} 37v71q11 16 22 0V37m-25 0h28m-25 10h22`}/><path className="visual-wash" d={`M${x-10} ${75+n*8}h20v31q-10 14-20 0Z`}/><circle cx={x} cy={87+n*4} r="2"/></g>)}</>}
        </svg>
        <span className="eyebrow">0{i+1} / {item.tag}</span><strong>{item.title}</strong><span>{item.question}</span>
      </button>)}
    </div>
    <div id={`${id}-reading`} className="measurement-reading" aria-live={manual ? "polite" : "off"}>
      <p><span className="eyebrow">HOW TO OBSERVE / {observations[active].title.toUpperCase()}</span>{observations[active].method}</p>
      <p><span className="eyebrow">WHAT IT DOES NOT ESTABLISH</span>{observations[active].limit}</p>
    </div>
    <details className="full-sequence"><summary>Read all measurement limits</summary>{observations.map(item=><div key={item.title}><h4>{item.title}</h4><p>{item.method} {item.limit}</p></div>)}</details>
    <p className="scope-caption">Conceptual measurement map. No sample results, concentrations or comparative yields are shown. <a href="/approach/">Methods & sources ↗</a></p>
  </div>;
}
