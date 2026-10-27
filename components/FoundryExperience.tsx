"use client";
import { useState, type ComponentType, type ReactNode } from "react";
import ApplicationTrace from "./content/visuals/ApplicationTrace";
import { VisualMotionContext } from "./content/visuals/VisualMotion";
import SiteNavigation from "./content/SiteNavigation";
import dynamic from "next/dynamic";
import MilestoneJourney from "./MilestoneJourney";
import TeamCollective from "./TeamCollective";
const LivingFoundry = dynamic(
  () => import("@/living-foundry/LivingFoundryCanvas"),
  { ssr: false },
);
export default function FoundryExperience({ SpatialLayer, content }: { SpatialLayer?: ComponentType<{ paused: boolean }>; content?: ReactNode } = {}) {
  const [paused, setPaused] = useState(false);
  return (
    <VisualMotionContext value={paused}>
      <a className="skip-link" href="#arrival">
        Skip to content
      </a>
      <SiteNavigation home />
      <div className="journey-progress" aria-hidden="true" />
      <main id="arrival" tabIndex={-1}>
        <div className="field-layer" aria-hidden="true">
          {SpatialLayer ? <SpatialLayer paused={paused} /> : <>
            <div className="still-organism" />
            <LivingFoundry paused={paused} />
          </>}
        </div>
        <section className="arrival" aria-labelledby="arrival-title">
          <div className="arrival-observation" aria-hidden="true"><span className="observation-dot" /> A LIVING POSSIBILITY<span className="observation-line" /></div>
          <div className="arrival-statement">
            <h1 id="arrival-title">
              <span className="making">Making</span> with life,
              <br />
              <span className="life-tone">for life.</span>
            </h1>
            <p>
              We study fungal cultivation and the processes
              <br className="desktop-break" /> behind biological production.
            </p>
            <p className="arrival-stage-note">Early-stage research · laboratory, modeling and industry learning.</p>
            <div className="home-stage-links"><a className="arrival-direct" href="/approach/">Explore our approach ↗</a><a className="arrival-direct" href="/research/">Follow our research ↗</a></div>
          </div>
          <a
            className="scroll-cue"
            href="#life"
            aria-label="Explore the living foundry"
          >
            SCROLL TO CULTIVATE <span aria-hidden="true">↓</span>
          </a>
        </section>
        <section
          id="life"
          className="narrative life"
          aria-labelledby="life-title"
        >
          <p className="eyebrow">01 / LIFE</p>
          <div className="narrative-copy">
            <h2 id="life-title">
              Life already
              <br />
              knows how
              <br className="phone-break" /> to make.
            </h2>
            <p>
              Fungi can form biomass, metabolites and fibrous structures.
              What becomes useful depends on the organism and the application.
            </p>
          </div>
          <p className="side-note">
            POTENTIAL,
            <br />
            ALREADY LIVING.
          </p>
        </section>
        <section
          id="conditions"
          className="narrative conditions"
          aria-labelledby="conditions-title"
        >
          <p className="eyebrow">02 / CONDITIONS</p>
          <div className="narrative-copy">
            <h2 id="conditions-title">
              We create
              <br />
              the conditions.
            </h2>
            <p>
              You change the environment.
              <br />
              Life determines the response.
            </p>
          </div>
          <button
            className="condition-action"
            onClick={() => window.dispatchEvent(new Event("huner:influence"))}
          >
            <span className="fine-hint">Move near the living field, or </span>
            <span className="touch-hint">Touch the field, or </span>add a
            condition <span aria-hidden="true">↗</span>
          </button>
          <p className="response-note" role="status" id="condition-status" />
        </section>
        <section
          id="foundry"
          className="narrative foundry"
          aria-labelledby="foundry-title"
        >
          <p className="eyebrow">03 / FOUNDRY</p>
          <div className="narrative-copy">
            <h2 id="foundry-title">
              The foundry
              <br />
              begins with control.
            </h2>
            <p>
              We investigate how cultivation conditions, measurement and modeling
              can help us understand fungal production.
            </p>
          </div>
          <div className="foundry-calibration" aria-hidden="true"><span>OPEN FIELD</span><i /><span>CULTIVATED SPACE</span></div>
          <p className="boundary-caption">
            A BOUNDARY.
            <br />A DIFFERENT POSSIBILITY.
          </p>
        </section>
        <section id="cultivation" className="narrative cultivation" aria-labelledby="cultivation-title">
          <div className="cultivation-frame">
          <p className="eyebrow">04 / CULTIVATION</p>
          <div className="narrative-copy">
            <h2 id="cultivation-title">Give possibility<br />time to grow.</h2>
            <p>Conditions shape growth. Cultivation turns that growth into something we can work with.</p>
          </div>
          <div className="tissue-sequence" aria-hidden="true"><span>CONNECT</span><i /><span>CONCENTRATE</span><i /><span>BECOME</span></div>
          <p className="side-note">LIVING SYSTEM.<br />EMERGING STRUCTURE.</p>
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
              <p className="eyebrow">05 / INSIDE LIFE</p>
              <h2 id="material-title">A world<br />within life.</h2>
            </div>
            <div className="cell-legend" aria-label="Cell structures">
              <span><i className="wall-key" />Cell wall + membrane</span>
              <span><i className="nucleus-key" />Nucleus</span>
              <span><i className="mitochondria-key" />Mitochondria</span>
              <span><i className="vacuole-key" />Vacuole</span>
            </div>
            <div className="material-caption">
              <span>FUNGAL CELL / A SCHEMATIC STUDY<br /><span className="material-disclaimer">Not to scale · not a reconstruction of a Huner organism</span></span>
              <a href="https://openstax.org/books/biology-2e/pages/24-1-characteristics-of-fungi" target="_blank" rel="noreferrer">Explore fungal biology ↗</a>
            </div>
          </div>
        </section>
        <div className="applications-intro" id="applications">
          <p className="eyebrow">06 / POSSIBILITIES</p>
          <p>Different possibilities.<br /><span>Different process requirements.</span></p>
          <nav aria-label="Explore applications">
            <a data-track="explore_application" href="#food">Food ↘</a>
            <a data-track="explore_application" href="#fragrance">Fragrance ↘</a>
            <a data-track="explore_application" href="#raw-materials">Raw materials ↘</a>
          </nav>
        </div>
        {[
          { id: "food", number: "01", title: "Food", line: "A possible ingredient begins upstream.", copy: "Biomass composition, safety and consistency matter to a downstream food application. This is a research direction, not an available Huner product.", behavior: "ACCUMULATION" },
          { id: "fragrance", number: "02", title: "Fragrance", line: "Cultivating the question of aroma.", copy: "A volatile profile needs chemical characterization and application-specific evaluation. Growing biomass alone does not recreate a finished aroma.", behavior: "DIFFUSION" },
          { id: "raw-materials", number: "03", title: "Raw materials", line: "Structure before transformation.", copy: "Filamentous biomass could be a starting point for materials. Morphology and downstream compatibility remain specific to each application.", behavior: "STRUCTURE" },
        ].map((application) => (
          <section key={application.id} id={application.id} className={`narrative application ${application.id}`} aria-labelledby={`${application.id}-title`}>
            <p className="eyebrow">{application.number} / APPLICATION DIRECTION</p>
            <div className="narrative-copy">
              <h2 id={`${application.id}-title`}>{application.title}</h2>
              <p className="application-line">{application.line}</p>
              <p>{application.copy}</p>
              <ApplicationTrace direction={application.id as "food" | "fragrance" | "raw-materials"} />
              <a className="text-link" href={`/applications/#${application.id}`}>Explore this direction ↗</a>
            </div>
            <p className="behavior-note">{application.behavior}<br /><span>Illustrative living study</span></p>
          </section>
        ))}
        {content}
        <MilestoneJourney paused={paused} />
        <TeamCollective paused={paused} />
        <section id="possibility" className="closing" aria-labelledby="closing-title">
          <p className="eyebrow">HUNER BIOFOUNDRY</p>
          <h2 id="closing-title">What else<br />can life make?</h2>
          <nav className="closing-research-links" aria-label="Continue exploring"><a href="/research/">Explore research ↗</a><a href="/approach/">Read the methodology ↗</a><a href="/collaborate/">Collaboration directions ↗</a></nav>
          <a href="#arrival">RETURN TO THE SEED ↑</a>
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
    </VisualMotionContext>
  );
}
