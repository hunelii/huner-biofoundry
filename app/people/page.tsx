import ReadingPage from "@/components/content/ReadingPage";
import { team } from "@/lib/milestones";
import { contentMetadata } from "@/lib/content-metadata";
export const metadata = contentMetadata("People", "Core team bridging bioprocess engineering, chemistry, and kinetic modeling at Huner Biofoundry.", "/people/");
export default function Page() {
  return (
    <ReadingPage
      path="/people/"
      chapter="People"
      title="Bioprocess engineering. Chemistry. Mathematical modeling."
      intro="Huner brings together interdisciplinary capabilities from Middle East Technical University (METU) to transform fungal biology into scalable, reproducible food ingredients."
    >
      <section className="reading-section">
        <p className="eyebrow">FOUNDING & TECHNICAL TEAM</p>
        <div className="people-record">
          {team.map((person, i) => (
            <article key={person.name}>
              <span className="eyebrow">0{i + 1} / {person.role}</span>
              <h2>{person.name}</h2>
              <p className="person-bio">{person.bio}</p>
              <span className="person-initials" aria-hidden="true">{person.initials}</span>
            </article>
          ))}
        </div>
        <p className="scope-caption">
          Founded at Middle East Technical University (METU), Huner operates at the intersection of bioprocess engineering, analytical chemistry, and computational reaction modeling.
        </p>
      </section>
      <section className="reading-section two-column">
        <p className="eyebrow">HOW THE WORK CONNECTS</p>
        <div className="prose">
          <h2>Complementary disciplines.<br /><span>Single-product focus.</span></h2>
          <p>
            <strong>Bioprocess Engineering</strong> defines the submerged fermentation envelope—optimizing nutrient feeds, dissolved oxygen profiles, shear rates, and downstream recovery in stirred-tank systems.
          </p>
          <p>
            <strong>Analytical Chemistry</strong> leads experimental design, media formulation, extraction kinetics, and qualitative/quantitative volatile characterization via chromatography (GC-MS).
          </p>
          <p>
            <strong>Kinetic Modeling</strong> develops mass balances, substrate consumption dynamics, and predictive growth models to bridge laboratory shake-flasks to pilot-scale bioreactors.
          </p>
          <a className="text-link" href="/research/">Explore our research streams ↗</a>
        </div>
      </section>
    </ReadingPage>
  );
}
