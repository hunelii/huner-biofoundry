import ReadingPage from "@/components/content/ReadingPage";
import ProgressArchive from "@/components/content/ProgressArchive";
import { EvidenceStatus } from "@/components/content/Science";
import { contentMetadata } from "@/lib/content-metadata";
export const metadata = contentMetadata("Progress & Milestones", "Verified R&D milestones, incubation programs, and evidence roadmap for Huner's truffle aroma ingredient.", "/progress/");
export default function Page() {
  return (
    <ReadingPage
      path="/progress/"
      chapter="Progress"
      title="Evidence-Driven Development."
      intro="Commercialization in B2B biotechnology requires rigorous, step-by-step evidence reduction. Here is how Huner progresses from university laboratory R&D to qualified pilot production."
    >
      <section className="reading-section">
        <p className="eyebrow">01 / INCUBATION & RECOGNITION</p>
        <h2>Venture milestones & research grants.</h2>
        <p className="section-intro">
          Huner's trajectory is supported by leading academic and national deep tech acceleration programs, providing experimental grant support and venture validation.
        </p>
        <ProgressArchive />
      </section>
      <section className="reading-section two-column">
        <div>
          <p className="eyebrow">02 / ACTIVE R&D</p>
          <EvidenceStatus>Laboratory Phase · METU</EvidenceStatus>
        </div>
        <div className="prose">
          <h2>Controlled submerged fermentation (SmF).</h2>
          <p>
            Current experimental work at Middle East Technical University (METU) focuses on pure <i>Tuber melanosporum</i> strain maintenance, liquid inoculum development, and screening regional agro-industrial side streams (sugar beet molasses) as circular carbon sources.
          </p>
          <p>
            Simultaneously, mathematical models are being parameterized to describe mycelial biomass kinetics and anticipate oxygen transfer constraints before scaling up to benchtop stirred-tank bioreactors.
          </p>
          <a className="text-link" href="/research/">Explore the research program ↗</a>
        </div>
      </section>
      <section className="reading-section two-column">
        <div>
          <p className="eyebrow">03 / 18-MONTH EVIDENCE ROADMAP</p>
          <EvidenceStatus>Decision-Gate Framework</EvidenceStatus>
        </div>
        <div className="prose">
          <h2>Clear gates before commercial scaling.</h2>
          <ul>
            <li><strong>Pure Strain & Baseline:</strong> Establish a reproducible submerged culture protocol with verified fungal identity.</li>
            <li><strong>Molasses Suitability:</strong> Benchmark biomass yield and kinetic stability on sugar beet molasses against standard synthetic media.</li>
            <li><strong>Aroma Characterization:</strong> Map volatile metabolite profile via GC-MS and evaluate consistency across duplicate batches.</li>
            <li><strong>Target Matrix Testing:</strong> Conduct exploratory sensory and thermal stability evaluations in sauces, oils, and seasonings.</li>
            <li><strong>Regulatory Pathway:</strong> Qualify ingredient classification according to EU Regulation 1334/2008 and Turkish Food Codex Aroma Regulation.</li>
          </ul>
          <p>
            Commercialization and pilot scale expansion will proceed only upon passing each sequential technical milestone.
          </p>
          <a className="text-link" href="/collaborate/">Inquire about technical co-development ↗</a>
        </div>
      </section>
    </ReadingPage>
  );
}
