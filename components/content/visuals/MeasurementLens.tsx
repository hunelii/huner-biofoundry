"use client";

import { useId, useRef, useState } from "react";
import { observations } from "@/content/observations";
import { references } from "@/content/references";
import CultureSpecimen from "./CultureSpecimen";

export default function MeasurementLens() {
  const [active, setActive] = useState(0), id = useId();
  const controls = useRef<(HTMLButtonElement | null)[]>([]);
  const item = observations[active];
  const source = references.find(reference => reference.id === item.source)!;
  return <div className="measurement-lens specimen-lens" data-step={active}>
    <div className="specimen-layout">
      <figure className="specimen-view">
        <CultureSpecimen observation={item.id}/>
        <figcaption><span className="eyebrow">{item.tag}</span><strong>{item.figure}</strong></figcaption>
      </figure>
      <div className="specimen-questions">
        <div className="measurement-branches" role="group" aria-label="Choose an observation">
          {observations.map((entry,i)=><button key={entry.id} ref={el=>{controls.current[i]=el;}} type="button" className="measurement-branch" aria-pressed={active===i} aria-controls={`${id}-reading`} onClick={()=>{setActive(i);}} onKeyDown={event=>{
            const next = event.key === "ArrowDown" || event.key === "ArrowRight" ? (i+1)%observations.length : event.key === "ArrowUp" || event.key === "ArrowLeft" ? (i+observations.length-1)%observations.length : null;
            if(next !== null){event.preventDefault();setActive(next);controls.current[next]?.focus();}
          }}><span className="question-number">0{i+1}</span><span><strong>{entry.title}</strong><span>{entry.question}</span></span><span className="question-mark" aria-hidden="true">{active===i?"●":"○"}</span></button>)}
        </div>
        <div id={`${id}-reading`} className="measurement-reading" aria-live="polite">
          <p><span className="eyebrow">HOW TO OBSERVE</span>{item.method}</p>
          <p className="measurement-limit"><span className="eyebrow">INTERPRET WITH CARE</span>{item.limit}</p>
          <details className="observation-source" key={item.id}><summary>Method context & source</summary><p>{source.scope}</p><a href={source.url} target="_blank" rel="noreferrer">{source.attribution} ↗</a><a href="/approach/#measurement">Read our measurement approach →</a></details>
        </div>
      </div>
    </div>
    <div className="sample-record" aria-label="Example research record structure">
      <div><span className="eyebrow">FROM OBSERVATION TO A RECORD</span><h3>Make the next decision traceable.</h3><p>An example of what a study would document.</p></div>
      <div className="sample-record-fields"><span className="eyebrow">{item.title.toUpperCase()} / RECORD FIELDS</span><div className="record-disclosures" key={item.id}>{item.record.map(field=><details key={field.name}><summary>{field.name}</summary><p>{field.description}</p></details>)}</div><p>{item.decision}</p></div>
    </div>
    <details className="full-sequence"><summary>Read all measurement limits</summary>{observations.map(entry=><div key={entry.id}><h4>{entry.title}</h4><p>{entry.method} {entry.limit}</p></div>)}</details>
    <p className="scope-caption">Conceptual measurement map · no sample results or measured quantities. The record fields describe a proposed structure, not a completed Huner study.</p>
  </div>;
}
