"use client";
import { useState } from "react";
import { team } from "@/lib/milestones";

export default function TeamCollective({ paused }: { paused: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  return <section id="team" className="team-collective" data-active={active ?? "all"} data-paused={paused} aria-labelledby="team-title">
    <div className="team-heading"><p className="eyebrow">08 / PEOPLE</p><h2 id="team-title">Individual minds.<br /><span>A living collective.</span></h2></div>
    <div className="collective-field" aria-hidden="true">
      <div className="collective-orbits"><i /><i /><i /></div>
      <span className="collective-word">HUNER</span>
      <span className="collective-label">{active === null ? "MAKING WITH LIFE, FOR LIFE." : team[active].initials}</span>
    </div>
    <div className="team-members" onMouseLeave={() => setActive(null)}>{team.map((person, index) => <button key={person.name} className="team-member" aria-pressed={active === index} onPointerEnter={event => { if (event.pointerType === "mouse") setActive(index); }} onFocus={() => setActive(index)} onClick={() => setActive(index)} onBlur={event => { if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) setActive(null); }}><span className="team-number">{String(index + 1).padStart(2, "0")}</span><span className="team-name">{person.name}</span><span className="team-monogram" aria-hidden="true">{person.initials}</span><span className="team-line" /></button>)}</div>
  </section>;
}
