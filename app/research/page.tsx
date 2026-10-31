import ResearchLoop from "@/components/content/visuals/ResearchLoop";
import ReadingPage from "@/components/content/ReadingPage";
import { EvidenceStatus, UncertaintyNote } from "@/components/content/Science";
import { programs } from "@/content/research";
import { contentMetadata } from "@/lib/content-metadata";
export const metadata = contentMetadata(
  "Research & Development",
  "Submerged fermentation of Tuber melanosporum, volatile aroma characterization via GC-MS, and kinetic bioprocess modeling at METU.",
  "/research/"
);
export default function Page() {
  return (
    <ReadingPage
      path="/research/"
      chapter="Research"
      title="R&D, Analytics & Kinetic Modeling."
      intro="We conduct laboratory submerged fermentation, chromatographic volatile profiling (GC-MS), and mathematical kinetic modeling at Middle East Technical University (METU) to develop reproducible, fermentation-derived truffle aroma ingredients."
    >
      <ResearchLoop />
      <section className="reading-section">
        <p className="eyebrow">RESEARCH PROGRAMS</p>
        <h2>Fungal systems.<br /><span>Single-product focus.</span></h2>
        <p className="section-intro">
          Our primary active R&D focus is <i>Tuber melanosporum</i> for truffle-characterized aroma ingredients, supported by foundational research into fungal growth kinetics and metabolite regulation.
        </p>
        <div className="research-list">
          {programs.map((program, i) => (
            <article key={program.slug}>
              <span className="research-number">0{i + 1}</span>
              <div>
                <EvidenceStatus>{program.slug === "tuber-melanosporum" ? "Primary Focus · Active R&D" : "Candidate Direction"}</EvidenceStatus>
                <h3><a href={`/research/${program.slug}/`}><i>{program.organism}</i> ↗</a></h3>
                <p>{program.summary}</p>
                <p className="scope-caption">
                  Focus: {program.slug === "tuber-melanosporum"
                    ? "Submerged fermentation (SmF), molasses carbon evaluation, and GC-MS volatile mapping."
                    : "Comparative fungal biomass accumulation and metabolite yield."}
                </p>
                <a className="text-link" href={`/research/${program.slug}/`}>Read research details ↗</a>
              </div>
            </article>
          ))}
        </div>
      </section>
      <UncertaintyNote>
        Early-stage R&D at METU. Commercial ingredient yield, comprehensive volatile specifications, and regulatory approvals are actively being characterized through ongoing experimental work.
      </UncertaintyNote>
      <nav className="related-links" aria-label="Related research resources">
        <a href="/approach/">Bioprocess methodology ↗</a>
        <a href="/applications/">Target food matrices ↗</a>
        <a href="/collaborate/">Technical dialogue ↗</a>
      </nav>
    </ReadingPage>
  );
}
