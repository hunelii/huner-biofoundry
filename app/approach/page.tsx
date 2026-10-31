import ReadingPage from "@/components/content/ReadingPage";
import { EvidenceStatus } from "@/components/content/Science";
import { contentMetadata } from "@/lib/content-metadata";

export const metadata = contentMetadata(
  "Our Approach",
  "Controlled submerged liquid fermentation (SmF) of Tuber melanosporum mycelium on circular molasses feedstocks.",
  "/approach/"
);

export default function Page() {
  return (
    <ReadingPage
      path="/approach/"
      chapter="Approach"
      title="Controlled Bioprocess. Measured Aroma."
      intro="We replace volatile agricultural harvest with controlled biological production, cultivating pure fungal mycelium in submerged liquid bioreactors to produce defined, reproducible truffle aroma ingredients."
    >
      <section className="reading-section two-column">
        <div>
          <p className="eyebrow">01 / BIOLOGICAL CHASSIS</p>
          <EvidenceStatus>Pure Mycelial Culture</EvidenceStatus>
        </div>
        <div className="prose">
          <h2>Cultivating the mycelium,<br /><span>not the fruiting body.</span></h2>
          <p>
            Natural black truffles (<i>Tuber melanosporum</i>) take 5 to 10 years to form underground mycorrhizal associations with host trees, subject to erratic rainfall, temperature swings, and pest vulnerabilities.
          </p>
          <p>
            Huner focuses exclusively on pure mycelial liquid culture. Mycelium contains the complete genetic and enzymatic machinery to synthesize the complex volatile bouquet of authentic truffle. Cultivating mycelium indoors eliminates seasonal harvest bottlenecks and preserves strain identity across generations.
          </p>
        </div>
      </section>

      <section className="reading-section two-column">
        <div>
          <p className="eyebrow">02 / LIQUID BIOPROCESS</p>
          <EvidenceStatus>Submerged Fermentation (SmF)</EvidenceStatus>
        </div>
        <div className="prose">
          <h2>Precision bioreactors,<br /><span>circular carbon feedstocks.</span></h2>
          <p>
            Instead of unmanageable solid substrates, we cultivate mycelium in submerged liquid fermentation (SmF) inside closed, stirred-tank vessels. Submerged culture enables tight, real-time control over critical physicochemical parameters: temperature, dissolved oxygen, pH, and agitation shear.
          </p>
          <p>
            To build a sustainable carbon loop, our R&D investigates regional agro-industrial side streams—specifically sugar beet molasses—as a primary carbon and nutrient source, converting industrial by-products into high-value culinary ingredients.
          </p>
        </div>
      </section>

      <section className="reading-section two-column">
        <div>
          <p className="eyebrow">03 / METABOLIC REGULATION & ANALYTICS</p>
          <EvidenceStatus>Kinetics & Chromatography</EvidenceStatus>
        </div>
        <div className="prose">
          <h2>Decoupling biomass growth<br /><span>from aroma synthesis.</span></h2>
          <p>
            In filamentous fungi, vegetative growth and secondary metabolite synthesis follow distinct kinetic regimes. Growing dense biomass alone does not produce an aroma. Through bioprocess modeling and controlled nutrient limitation, we investigate the precise metabolic triggers that initiate volatile synthesis.
          </p>
          <p>
            Headspace gas chromatography-mass spectrometry (GC-MS) provides objective, multi-compound chemical finger-printing, ensuring each fermentation batch delivers the multi-compound complexity required for industrial food formulations.
          </p>
          <a className="text-link" href="/applications/">Explore target food matrices ↗</a>
        </div>
      </section>

      <nav className="related-links" aria-label="Next steps">
        <a href="/research/">Follow METU laboratory research ↗</a>
        <a href="/applications/">Target application specifications ↗</a>
        <a href="/collaborate/">Inquire about technical dialogue ↗</a>
      </nav>
    </ReadingPage>
  );
}
