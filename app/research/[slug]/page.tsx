import { notFound } from "next/navigation";
import ReadingPage from "@/components/content/ReadingPage";
import { CitationList, EvidenceStatus, MeasurementTable, UncertaintyNote } from "@/components/content/Science";
import { programs } from "@/content/research";
import { visibleArticles } from "@/content/server";
import { contentMetadata } from "@/lib/content-metadata";
export const dynamicParams = false;
export function generateStaticParams() { return programs.map(program => ({ slug: program.slug })); }
export async function generateMetadata({ params }: { params: Promise<{slug:string}> }) { const {slug} = await params; const program = programs.find(item => item.slug === slug); return program ? contentMetadata(program.organism, program.summary, `/research/${slug}/`) : {}; }
export default async function Page({ params }: { params: Promise<{slug:string}> }) {
  const {slug} = await params, program = programs.find(item => item.slug === slug); if (!program) notFound();
  const related = visibleArticles.filter(article => article.researchProgram.includes(slug));
  return <ReadingPage path={`/research/${slug}/`} chapter={program.organism} parent={{title:"Research",href:"/research/"}} title={program.title} intro={program.summary}>
    <div className="article-meta"><i>{program.organism}</i><EvidenceStatus>{program.status}</EvidenceStatus><span>Scope reviewed <time dateTime={program.updatedAt}>{program.updatedAt}</time></span></div>
    <section className="reading-section two-column"><p className="eyebrow">THE QUESTION</p><div className="prose"><h2>{program.question}</h2><h3>Working hypothesis</h3><p>{program.hypothesis}</p><h3>Cultivation approach</h3><p>{program.approach}</p></div></section>
    <section className="reading-section"><p className="eyebrow">WHAT WOULD BE MEASURED</p><h2>Define the observation.</h2><MeasurementTable rows={program.measurements} /></section>
    {slug === "tuber-melanosporum" && (
      <section className="reading-section two-column">
        <div>
          <p className="eyebrow">KINETIC MODELING & SCALING</p>
          <EvidenceStatus>Bioprocess Engineering · METU</EvidenceStatus>
        </div>
        <div className="prose">
          <h2>Predicting growth kinetics & mass transfer.</h2>
          <p>
            Submerged fermentation in stirred tanks requires careful optimization of oxygen transfer rate (OTR) and volumetric mass transfer coefficients (<i>k<sub>L</sub>a</i>). Because filamentous mycelial morphology directly alters broth rheology, mathematical models parameterized at METU simulate shear sensitivity, substrate consumption rates, and aeration dynamics before scaling from shake flasks to benchtop bioreactors.
          </p>
          <p>
            Secondary aroma metabolite synthesis is modeled as a partially decoupled kinetic regime, guiding feeding strategies (fed-batch) to trigger volatile production after adequate biomass accumulation.
          </p>
        </div>
      </section>
    )}
    <UncertaintyNote>{program.limitations}</UncertaintyNote><section className="reading-section two-column"><p className="eyebrow">NEXT QUESTIONS</p><div className="prose"><h2>Build the evidence.</h2><p>{program.next}</p><p>Experimental research is ongoing at Middle East Technical University. Commercial specifications and yield datasets will be published upon milestone validation.</p><CitationList ids={program.sources}/></div></section>
    <nav className="related-links" aria-label="Related reading">
      <a href="/approach/">Bioprocess methodology ↗</a>
      <a href="/applications/">Target food matrices ↗</a>
      <a href="/collaborate/">Technical dialogue ↗</a>
    </nav>
  </ReadingPage>;
}
