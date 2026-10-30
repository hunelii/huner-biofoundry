"use client";

import { useEffect, useId, useRef, useState } from "react";

const cellSource = "https://openstax.org/books/biology-2e/pages/24-1-characteristics-of-fungi";
const structures = [
  {
    name: "Stratified wall & ergosterol membrane",
    key: "wall",
    title: "A fungal-specific composite barrier.",
    description: "Unlike plant cellulose, the fungal cell wall is a layered composite: an outer protective mannoprotein/melanin coat, a structural β-(1,3)/(1,6)-glucan network, and an inner tensile scaffold of crystalline chitin microfibrils overlying an ergosterol-rich plasma membrane.",
    question: "The chemical boundary defines susceptibility. Chitin and ergosterol pathways provide the primary selective targets in fungal bioprocess control.",
    source: cellSource
  },
  {
    name: "Spitzenkörper & Chitosomes",
    key: "spitzenkorper",
    title: "The apical organizing center of fungal growth.",
    description: "Unique to higher fungi (Dikarya), the Spitzenkörper coordinates polarized tip extension and cell wall remodeling, supplying microvesicles (chitosomes) packed with chitin synthase and macrovesicles carrying glucan synthases along microtubule tracks.",
    question: "Polarity drives morphology. Understanding how cultivation conditions influence apical vesicle flow allows deliberate control over pellet vs. filamentous growth regimes.",
    source: cellSource
  },
  {
    name: "Nucleus & Spindle Pole Body",
    key: "nucleus",
    title: "Closed mitosis without centrosomes.",
    description: "Fungal nuclei maintain nuclear envelope integrity throughout division (closed mitosis). Instead of animal centrosomes, a disc-like Spindle Pole Body (SPB) embedded in the nuclear envelope organizes both spindle and astral microtubules alongside dense nuclear pore complexes.",
    question: "Karyotype and ploidy matter. Basidiomycetes alternate between monokaryotic (n) and dikaryotic (n+n) vegetative phases, each with distinct enzymatic production capabilities.",
    source: cellSource
  },
  {
    name: "Fungal vacuole & polyphosphate",
    key: "vacuole",
    title: "A dynamic homeostasis and storage organelle.",
    description: "The fungal vacuole functions as a tubular-vesicular network balancing turgor pressure, protein turnover, and nutrient reserves. It stores electron-dense polyphosphate (volutin) granules as accessible metabolic energy and phosphate reserves.",
    question: "Phosphate availability regulates metabolic flux. Intracellular volutin levels indicate culture nutritional state and secondary metabolite induction.",
    source: cellSource
  },
  {
    name: "Mitochondria & Lipid bodies",
    key: "mitochondria",
    title: "Aerobic respiration and neutral lipid storage.",
    description: "Tubular fungal mitochondria with folded cristae drive oxidative phosphorylation and ATP synthesis, closely interacting with neutral lipid droplets (triacylglycerols and ergosterol esters) and glycogen rosettes that serve as primary energy reserves.",
    question: "Dissolved oxygen directly governs mitochondrial respiration efficiency and fatty acid desaturation in submerged fungal fermentation.",
    source: "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells"
  },
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
