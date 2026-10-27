import { useId } from "react";
import type { ObservationId } from "@/content/observations";

// A deterministic drawing shared by the three questions. Its geometry encodes no data.
const filaments = Array.from({ length: 29 }, (_, i) => {
  const angle = i * 137.508 * Math.PI / 180;
  const length = 80 + (i % 7) * 13;
  const point = (r: number, bend = 0) => `${(270 + Math.cos(angle + bend) * r).toFixed(2)} ${(248 + Math.sin(angle + bend) * r * .84).toFixed(2)}`;
  return { main: `M270 248 Q${point(length * .4, .28)} ${point(length * .7, -.1)} T${point(length, .06)}`, forks: `M${point(length * .65, -.08)} Q${point(length * .76, -.24)} ${point(length * .92, -.32)} M${point(length * .8)} Q${point(length * .89, .2)} ${point(length * 1.04, .22)}` };
});

export default function CultureSpecimen({ observation }: { observation: ObservationId }) {
  const id = useId();
  return <svg className="culture-specimen" data-observation={observation} viewBox="0 0 560 510" role="img" aria-labelledby={`${id}-title ${id}-description`}>
    <title id={`${id}-title`}>One schematic culture, three ways of observing it</title>
    <desc id={`${id}-description`}>An unchanged network of fungal filaments. The selected overlay shows a recovery boundary, growth-form detail, or a sample for separate analysis. No measurements are represented.</desc>
    <defs><radialGradient id={`${id}-wash`}><stop stopColor="#4a6741" stopOpacity=".16"/><stop offset=".8" stopColor="#4a6741" stopOpacity=".03"/><stop offset="1" stopColor="#4a6741" stopOpacity="0"/></radialGradient></defs>
    <g fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M55 90V60h30M455 60h30v30M55 403v30h30M455 433h30v-30" opacity=".25"/>
      <ellipse cx="270" cy="248" rx="204" ry="180" fill={`url(#${id}-wash)`} strokeOpacity=".26"/>
      <ellipse cx="270" cy="248" rx="196" ry="172" strokeOpacity=".16"/>
      <path d="M67 253q204 179 407 0M270 51v18M270 426v18M56 248h18M466 248h18" opacity=".25"/>
      <g className="specimen-filaments">{filaments.map((f,i)=><g key={i}><path d={f.main} strokeWidth={i%3===0?1.8:1.1}/><path d={f.forks} opacity=".65" strokeWidth=".9"/></g>)}</g>
      <g className="specimen-overlay specimen-amount"><ellipse cx="270" cy="248" rx="180" ry="156" strokeDasharray="3 7"/><path d="M134 340l-39 45H45"/><circle cx="134" cy="340" r="4" fill="currentColor"/><text x="45" y="410">RECOVERY BOUNDARY</text></g>
      <g className="specimen-overlay specimen-form"><circle cx="365" cy="201" r="48" fill="#f4f1e8" fillOpacity=".6"/><path d="M332 220q23-32 55-50m-37 35 4-31m13 20 24 12" strokeWidth="2"/><path d="M398 165l35-35h78"/><text x="409" y="116">GROWTH FORM</text></g>
      <g className="specimen-overlay specimen-compound"><path d="M320 296l91 66h69" strokeDasharray="3 6"/><circle cx="320" cy="296" r="14"/><circle cx="320" cy="296" r="4" fill="currentColor"/><path d="M465 320v62q12 18 24 0v-62m-28 0h32m-28 9h24m-23 38h22" strokeWidth="1.5"/><text x="374" y="421">SEPARATE ANALYSIS</text></g>
      <text className="specimen-label" x="270" y="481" textAnchor="middle">CULTURE SCALE / SCHEMATIC</text>
    </g>
  </svg>;
}
