import ResearchLoop from "./visuals/ResearchLoop";
import MeasurementLens from "./visuals/MeasurementLens";
import { ScienceIcon } from "./visuals/ScientificDrawing";
import ProcessExplorer from "./ProcessExplorer";
import { EvidenceStatus, Methodology } from "./Science";
import { programs } from "@/content/research";
import { visibleArticles, reviewMode } from "@/content/server";
import { claims } from "@/content/claims";
export function HomeProcess() { return <div className="science-home post-cell-content">
  <section id="inquiry" className="reading-section inquiry-section" aria-labelledby="inquiry-title" tabIndex={-1}>
    <nav className="scale-route" aria-label="Follow the biological question"><a href="#material">01 / Cell</a><span aria-hidden="true">↗</span><span aria-current="step">02 / Culture & measurement</span><span aria-hidden="true">→</span><a href="#process">03 / Process</a></nav>
    <div className="inquiry-heading"><div><p className="eyebrow">FROM LIVING STRUCTURE TO A RESEARCH QUESTION</p><h2 id="inquiry-title">Growing is visible.<br /><span>Understanding takes a closer look.</span></h2></div><p>Step back from a single cell to a culture. The same growth can raise different questions about amount, form and composition.</p></div>
    <MeasurementLens />
  </section>
  <section id="process" className="reading-section"><p className="eyebrow">THE PROCESS BEHIND THE POSSIBILITY</p><h2>Carry the observation<br /><span>into the process.</span></h2><p className="section-intro">A measurement becomes useful when it informs the next decision. Follow the biological intermediate from cultivation to the requirements of a possible application.</p><ProcessExplorer /><a className="text-link" href="#applications">Explore the requirements of each application ↓</a></section>
</div>; }
export default function HomeScience() { return <div className="science-home">
  {reviewMode && <p className="review-banner">Content preview · active research review</p>}
  <section id="research" className="reading-section"><div className="section-heading"><div><p className="eyebrow">RESEARCH PROGRAM</p><h2>Laboratory & bioprocess research.</h2></div><a className="text-link" href="/research/">Research overview ↗</a></div><div className="home-research-intro"><p>{claims.find(claim => claim.id === "current-work")!.approvedWording}</p><p>We conduct experimental submerged liquid fermentation and kinetic modeling at METU, targeting pure strain characterization, circular molasses conversion, and volatile aroma metabolite synthesis.</p></div><ResearchLoop /><div className="home-research-links">{programs.map(program => <a key={program.slug} href={`/research/${program.slug}/`}><EvidenceStatus>{program.slug === "tuber-melanosporum" ? "Primary Focus · R&D" : "Candidate Direction"}</EvidenceStatus><h3><i>{program.organism}</i> ↗</h3><p>{program.summary}</p></a>)}</div></section>
  <section id="methodology" className="reading-section"><p className="eyebrow">METHODOLOGICAL RIGOR</p><h2>Cultivate. Measure.<br /><span>Validate for scale.</span></h2><p className="section-intro">Every biological finding is linked to explicit bioreactor conditions, chromatographic analysis, and formulator sensory criteria.</p><Methodology/><a className="text-link" href="/approach/">Explore the bioprocess approach ↗</a></section>
  <p className="scope-caption scene-scope">The Living Foundry 3D visualization represents computational models of cellular architecture and bioprocess engineering. It is an illustrative technical framework.</p>
</div>; }
