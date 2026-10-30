"use client";

import { useEffect, useId, useRef, useState } from "react";

const cellSource = "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells";
const structures = [
  { name: "Cell wall + membrane", key: "wall", title: "A boundary with two roles.", description: "The fungal wall provides structural support. The plasma membrane regulates movement between the cell and its surroundings.", question: "The environment matters. Understanding a cultivation system requires us to define the conditions around the organism.", source: "https://openstax.org/books/biology-2e/pages/24-1-characteristics-of-fungi" },
  { name: "Nucleus", key: "nucleus", title: "Organization within the cell.", description: "Fungi are eukaryotes: their cells contain a membrane-bound nucleus housing genetic material.", question: "Identity matters. An experiment needs to name the organism and strain actually studied.", source: "https://openstax.org/books/biology-2e/pages/24-1-characteristics-of-fungi" },
  { name: "Mitochondria", key: "mitochondria", title: "Energy has a cellular context.", description: "Mitochondria are organelles involved in cellular respiration and ATP production.", question: "A visible cell structure is not a measure of production. Growth and a chosen compound need their own observations.", source: cellSource },
  { name: "Vacuole", key: "vacuole", title: "An internal compartment.", description: "Vacuoles are membrane-bound compartments associated with storage and other cellular functions.", question: "A schematic helps explain organization. It cannot establish the composition of a culture sample.", source: cellSource },
];

export default function CellStudyGuide({ continueHref = "#inquiry" }: { continueHref?: string }) {
  const [selected,setSelected] = useState(0);
  const [available,setAvailable] = useState(true);
  const dialog = useRef<HTMLDialogElement>(null), returnFocus = useRef<HTMLButtonElement | null>(null), id = useId();
  const item = structures[selected];
  useEffect(()=>{
    const material = document.getElementById("material");
    if(!material)return;
    const update = () => setAvailable(document.documentElement.dataset.engine !== "live" || Number(material.dataset.progress) >= .6);
    const observer = new MutationObserver(update);
    observer.observe(material,{attributes:true,attributeFilter:["data-progress"]});
    observer.observe(document.documentElement,{attributes:true,attributeFilter:["data-engine"]});update();
    return ()=>observer.disconnect();
  },[]);
  const close = () => { dialog.current?.close(); returnFocus.current?.focus({preventScroll:true}); };
  return <>
    <div className="cell-legend cell-study-guide" role="group" aria-label="Explore cell structures" hidden={!available}>
      {structures.map((structure,i)=><button key={structure.key} type="button" aria-haspopup="dialog" aria-controls={id} onClick={event=>{returnFocus.current=event.currentTarget;setSelected(i);dialog.current?.showModal();}}><i className={`${structure.key}-key`} aria-hidden="true"/>{structure.name}<span aria-hidden="true">＋</span></button>)}
    </div>
    <dialog ref={dialog} id={id} className="cell-reading" aria-labelledby={`${id}-title`} onCancel={event=>{event.preventDefault();close();}} onClick={event=>{if(event.target===dialog.current)close();}}>
      <div className="cell-reading-inner">
        <div className="cell-reading-top"><span className="eyebrow">CELL STUDY / 0{selected+1}</span><button type="button" onClick={close} aria-label="Close cell explanation">×</button></div>
        <div className="cell-reading-key"><i className={`${item.key}-key`}/>{item.name}</div>
        <h3 id={`${id}-title`}>{item.title}</h3><p>{item.description}</p>
        <div className="cell-reading-question"><span className="eyebrow">THE NEXT RESEARCH QUESTION</span><p>{item.question}</p></div>
        <a href={item.source} target="_blank" rel="noreferrer">Biology reference · OpenStax ↗</a>
        <p className="cell-reading-scope">Educational schematic · positions and proportions are illustrative. This is not a Huner sample or measurement.</p>
        <a className="cell-to-culture" href={continueHref} onClick={()=>dialog.current?.close()}>Continue from cell to culture ↓</a>
      </div>
    </dialog>
  </>;
}
