"use client";
import { useState, type ComponentType, type ReactNode } from "react";
import ApplicationTrace from "./content/visuals/ApplicationTrace";
import SiteNavigation from "./content/SiteNavigation";
import JourneyReadingTheme from "./content/JourneyReadingTheme";
import dynamic from "next/dynamic";
import MilestoneJourney from "./MilestoneJourney";
import TeamCollective from "./TeamCollective";
import StillOrganism from "./StillOrganism";
import BioprocessStage from "./BioprocessStage";
const LivingFoundry = dynamic(
  () => import("@/living-foundry/LivingFoundryCanvas"),
  { ssr: false },
);
export default function FoundryExperience({ SpatialLayer, content, processContent }: { SpatialLayer?: ComponentType<{ paused: boolean }>; content?: ReactNode; processContent?: ReactNode } = {}) {
  const [paused, setPaused] = useState(false);
  return (
    <>
      <a className="skip-link" href="#arrival">
        Skip to content
      </a>
      <SiteNavigation home />
      <JourneyReadingTheme />
      <main id="arrival" tabIndex={-1}>
        <div className="field-layer" aria-hidden="true">
          {SpatialLayer ? <SpatialLayer paused={paused} /> : <>
            <StillOrganism />
            <LivingFoundry paused={paused} />
          </>}
        </div>
        <section className="arrival" aria-labelledby="arrival-title">
          <div className="arrival-statement">
            <h1 id="arrival-title">
              <span className="making">Truffle aroma,</span>
              <br />
              <span className="life-tone">from living mycelium.</span>
            </h1>
            <p>
              We develop fermentation-derived aroma ingredients for B2B food manufacturers,
              <br className="desktop-break" /> replacing volatile agricultural harvest with controlled biological production.
            </p>
            <p className="arrival-stage-note">Early-stage R&D · Submerged fermentation research & bioprocess modeling at METU.</p>
            <div className="home-stage-links"><a className="arrival-direct" href="#applications">Target applications ↓</a><a className="arrival-direct" href="/research/">Follow our research ↗</a></div>
          </div>
          <a
            className="scroll-cue"
            href="#life"
            aria-label="Explore the aroma bioprocess"
          >
            SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
          </a>
        </section>
        <section
          id="life"
          className="narrative life"
          aria-labelledby="life-title"
        >
          <p className="eyebrow">01 / AROMA COMPLEXITY</p>
          <div className="narrative-copy">
            <h2 id="life-title">
              The challenge of
              <br />
              authentic
              <br className="phone-break" /> truffle aroma.
            </h2>
            <p>
              Black truffles (<i>Tuber melanosporum</i>) produce one of gastronomy’s most complex volatile bouquets. Yet wild harvest is volatile, climate-dependent, and prone to rapid degradation. Today, food manufacturers are caught between unpredictable wild supply and flat, single-molecule synthetic alternatives.
            </p>
          </div>
        </section>
        <section
          id="conditions"
          className="narrative conditions"
          aria-labelledby="conditions-title"
        >
          <p className="eyebrow">02 / SUBMERGED FERMENTATION</p>
          <div className="narrative-copy">
            <h2 id="conditions-title">
              Controlled
              <br />
              bioreactors,
              <br />
              circular inputs.
            </h2>
            <p>
              Instead of waiting years for unpredictable soil ecology, we cultivate pure mycelium in controlled submerged liquid fermentation (SmF). By investigating regional agro-industrial side streams like sugar beet molasses as a circular carbon source, we target an indoor, scalable production cycle.
            </p>
          </div>
        </section>
        <section
          id="foundry"
          className="narrative foundry"
          aria-labelledby="foundry-title"
        >
          <p className="eyebrow">03 / PRECISION METABOLISM</p>
          <div className="narrative-copy">
            <h2 id="foundry-title">
              Decoupling
              <br />
              growth from
              <br />
              aroma synthesis.
            </h2>
            <p>
              Fungal biomass expansion and volatile aroma metabolite synthesis follow distinct kinetic pathways. Through bioprocess parameter control (temperature, pH, dissolved oxygen, shear stress), we research how to trigger and maximize targeted aroma formation in liquid culture.
            </p>
          </div>
        </section>
        <section id="cultivation" className="narrative cultivation" aria-labelledby="cultivation-title">
          <div className="cultivation-frame">
          <p className="eyebrow">04 / BATCH CONSISTENCY</p>
          <div className="narrative-copy">
            <h2 id="cultivation-title">Predictable profile.<br />Industrial reliability.</h2>
            <p>Food formulators need predictable sensory performance, lot-to-lot consistency, and clear regulatory qualifications. We aim to replace batch volatility with repeatable fermentation kinetics.</p>
          </div>
          </div>
        </section>
        <section
          id="material"
          className="material-stage"
          aria-labelledby="material-title"
        >
          <div className="material-frame">
            <svg className="material-still cell-still" viewBox="0 0 1000 700" role="img" aria-labelledby="cell-description">
              <title id="cell-description">Schematic fungal cell cutaway showing a cell wall, membrane, nucleus, mitochondria and vacuole. Not to scale.</title>
              <rect width="1000" height="700" fill="#22311d" />
              <g transform="translate(500 350) rotate(-12)">
                <ellipse rx="320" ry="210" fill="#a6ad83" />
                <ellipse rx="301" ry="191" fill="#4a6741" />
                <ellipse rx="289" ry="180" fill="#374f2f" />
                <ellipse cx="110" cy="10" rx="98" ry="114" fill="#d7dcc0" />
                <circle cx="-115" cy="-35" r="70" fill="#c19255" />
                <circle cx="-125" cy="-45" r="21" fill="#71502e" />
                {[[0,-126],[0,130],[-210,70],[222,-76]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y}) rotate(25)`}><ellipse rx="40" ry="18" fill="#85996b" /><path d="M-24 8 L-17 -8 L-8 8 L0 -8 L8 8 L17 -8 L24 8" fill="none" stroke="#374f2f" strokeWidth="4" /></g>)}
              </g>
            </svg>
            <div className="material-heading">
              <p className="eyebrow">05 / CELLULAR ENGINE</p>
              <h2 id="material-title">Inside the<br />mycelial factory.</h2>
              <p className="material-copy">
                Volatile synthesis begins inside fungal hyphae. Metabolic pathways and cellular transport mechanisms govern how secondary metabolites are formed, compartmentalized, and recovered.
              </p>
            </div>
            <div className="material-caption">
              <span>FUNGAL CELL ARCHITECTURE<br /><span className="material-disclaimer">From cellular metabolism to pilot bioreactor scale</span></span>
              <a href={processContent ? "#bioprocess" : "/approach/#measurement"}>From cell to bioprocess ↓</a>
            </div>
          </div>
        </section>
        <BioprocessStage />
        {processContent}
        <div className="applications-intro" id="applications">
          <p className="eyebrow">07 / TARGET FOOD MATRICES</p>
          <p>Application-driven development.<br /><span>Formulated for industrial food matrices.</span></p>
          <nav aria-label="Explore target applications">
            <a data-track="explore_application" href="#food">Sauces & Culinary ↘</a>
            <a data-track="explore_application" href="#fragrance">Oils & Condiments ↘</a>
            <a data-track="explore_application" href="#raw-materials">Seasonings & Snacks ↘</a>
          </nav>
        </div>
        {[
          {
            id: "food",
            number: "01",
            title: "Gourmet Sauces & Culinary Bases",
            line: "Thermal stability in emulsified matrices.",
            copy: "Pasta sauces, culinary bases, and dairy emulsions demand volatile retention during thermal processing and pasteurization without aroma deterioration.",
          },
          {
            id: "fragrance",
            number: "02",
            title: "Infused Oils & Finishing Condiments",
            line: "Authentic multi-compound depth in lipid carriers.",
            copy: "Gourmet olive and finishing oils require true lipid solubility and authentic multi-compound complexity, eliminating the harsh chemical sharpness of synthetic 2,4-dithiapentane.",
          },
          {
            id: "raw-materials",
            number: "03",
            title: "Dry Seasonings & Snack Formulations",
            line: "Homogeneous dispersion and shelf-life stability.",
            copy: "Snack coatings, specialty salt blends, and dry culinary seasonings require stable carrier integration, homogeneous particle distribution, and consistent lot-to-lot flavor release.",
          },
        ].map((application) => (
          <section key={application.id} id={application.id} className={`narrative application ${application.id}`} aria-labelledby={`${application.id}-title`}>
            <p className="eyebrow">{application.number} / TARGET APPLICATION MATRIX</p>
            <div className="narrative-copy">
              <h2 id={`${application.id}-title`}>{application.title}</h2>
              <p className="application-line">{application.line}</p>
              <p>{application.copy}</p>
              <ApplicationTrace direction={application.id as "food" | "fragrance" | "raw-materials"} />
              <a className="text-link" href={`/applications/#${application.id}`}>Explore matrix requirements ↗</a>
            </div>
          </section>
        ))}
        {content}
        <MilestoneJourney paused={paused} />
        <TeamCollective paused={paused} />
        <section id="possibility" className="closing" aria-labelledby="closing-title">
          <p className="eyebrow">HUNER BIOFOUNDRY · B2B COLLABORATION</p>
          <h2 id="closing-title">Shaping the future<br />of sustainable aroma.</h2>
          <p className="closing-sub">
            We welcome technical dialogue with food R&D formulators, flavor houses, and bioprocess researchers interested in early sensory evaluation and technical co-development.
          </p>
          <nav className="closing-research-links" aria-label="Continue exploring"><a href="/research/">Explore research ↗</a><a href="/approach/">Read the methodology ↗</a><a href="/collaborate/">Collaboration directions ↗</a></nav>
          <a href="#arrival">RETURN TO TOP ↑</a>
        </section>
      </main>
      <footer>
        <span>HUNER BIOFOUNDRY</span>
        <span>MAKING WITH LIFE, FOR LIFE.</span>
        <a href="/privacy/">PRIVACY & COOKIES</a>
        <a href="#arrival">BACK TO ARRIVAL ↑</a>
      </footer>
      <button
        className="motion-control"
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? "Resume motion" : "Pause motion"}
      </button>
    </>
  );
}
