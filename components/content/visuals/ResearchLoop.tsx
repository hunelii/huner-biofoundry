"use client";

import { useState } from "react";
import { ScienceIcon } from "./ScientificDrawing";
import { useVisualProgress } from "./VisualMotion";

const streams = [
  { title: "Laboratory", kind: "culture", action: "Observe the biological system.", copy: "Traceable cultures, documented conditions and suitable measurements give an interpretation something to answer to.", to: "Observations inform the model.", x: 240, y: 60 },
  { title: "Modeling", kind: "model", action: "Make the assumptions visible.", copy: "Models organize possible explanations. Independent observations are needed before relying on a prediction.", to: "Questions return to the next experiment.", x: 390, y: 290 },
  { title: "Application", kind: "specify", action: "Define what useful means.", copy: "Industry research asks which properties matter downstream. Those requirements help shape the cultivation question.", to: "Requirements travel back upstream.", x: 90, y: 290 },
] as const;

export default function ResearchLoop() {
  const [active, setActive] = useState(0), [manual, setManual] = useState(false);
  const ref = useVisualProgress(setActive, 3, manual);
  return <div ref={ref} className="research-circuit" data-step={active}>
    <div className="visual-toolbar"><span>THREE PERSPECTIVES / ONE PROCESS QUESTION</span><button type="button" aria-pressed={!manual} onClick={() => setManual(!manual)}>{manual ? "Follow scroll ↓" : "Scroll emphasis on Ⅱ"}</button></div>
    <div className="circuit-layout">
      <figure className="circuit-figure">
        <svg viewBox="0 0 480 380" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
          <circle cx="240" cy="210" r="146" className="visual-registration" strokeDasharray="2 8"/>
          <path className="circuit-route" d="M273 67Q402 86 395 251M361 312Q240 383 119 312M85 251Q78 86 207 67"/>
          <path d="m389 242 6 10 6-10M130 310l-12 2 5 10M199 62l9 5-7 8"/>
          {streams.map((s,i) => <g key={s.title} data-selected={active===i}><path className="circuit-connection visual-ink" pathLength="1" d={`M${s.x} ${s.y}L240 210`}/><circle className="circuit-node" cx={s.x} cy={s.y} r="35"/><text x={s.x} y={s.y+5} textAnchor="middle" stroke="none" fill="currentColor" fontSize="15">0{i+1}</text></g>)}
          {streams.map((s,i) => <text key={s.title} className="circuit-node-label" x={s.x} y={i===0 ? 15 : 350} textAnchor="middle" stroke="none" fill="currentColor">{s.title}</text>)}
          <circle cx="240" cy="210" r="58" className="circuit-center"/>
          {Array.from({length:8},(_,i)=><path key={i} d="M240 210q-21-22 0-43q19 14 0 43m0-23 15-9" transform={`rotate(${i*45} 240 210)`} className="circuit-organism"/>)}
        </svg>
        <figcaption><strong>A better process question.</strong><span>Observations, explanations and requirements inform one another.</span></figcaption>
      </figure>
      <div className="circuit-streams">
        {streams.map((stream,i) => <div className="circuit-stream" key={stream.title} data-selected={i===active}>
          <button type="button" aria-pressed={i===active} onClick={() => { setManual(true); setActive(i); }}><span className="circuit-number">0{i+1}</span><ScienceIcon kind={stream.kind}/><span>{stream.title}</span><span aria-hidden="true">↗</span></button>
          <h3>{stream.action}</h3><p>{stream.copy}</p><p className="circuit-takeaway">{stream.to}</p>
        </div>)}
      </div>
    </div>
    <p className="scope-caption">Huner’s proposed learning framework. Connections show intended information flow, not measured effects or completed validation.</p>
  </div>;
}
