export type DrawingKind = "organism" | "culture" | "measure" | "specify" | "transform" | "model" | "repeat";

/** Original vector schematics; neither microscopy nor a depiction of Huner's equipment. */
export function ScienceIcon({ kind }: { kind: DrawingKind }) {
  return <svg className="science-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "organism" && <><path d="M24 42V24L13 13M24 29l13-12M13 13V6m0 7H5m32 4V8m0 9h7M24 35l-12-4m12-7V6"/><circle cx="24" cy="5" r="2"/><circle cx="12" cy="31" r="2"/></>}
    {kind === "culture" && <><path d="M16 5h16M18 5v14L8 37q-3 6 5 6h22q8 0 5-6L30 19V5M14 27q8-4 13 0t8 0"/><circle cx="20" cy="34" r="2"/><circle cx="29" cy="37" r="1"/></>}
    {kind === "measure" && <><path d="M7 39V10m0 29h35M12 23h10m-5-5v10m11-15h10m-5-5v10m-5 14h10m-5-5v10"/><circle cx="17" cy="23" r="3"/><circle cx="33" cy="13" r="3"/><circle cx="33" cy="32" r="3"/></>}
    {kind === "specify" && <><path d="M10 5h22l7 7v31H10ZM31 5v9h8M17 23h15m-15 7h15m-15 7h8"/></>}
    {kind === "transform" && <><circle cx="10" cy="24" r="5"/><path d="M15 24h10m0 0V9h12M25 24h12M25 24v15h12"/><path d="M34 6l4 3-4 3m0 9l4 3-4 3m0 9l4 3-4 3"/></>}
    {kind === "model" && <><path d="M6 39V8m0 31h36M10 33l9-13 9 6 12-17" strokeDasharray="3 4"/><circle cx="19" cy="20" r="3"/><circle cx="28" cy="26" r="3"/><circle cx="40" cy="9" r="3"/></>}
    {kind === "repeat" && <><path d="M9 18a16 16 0 0 1 28-5l4 5m0-10v10H31M39 30a16 16 0 0 1-28 5l-4-5m0 10V30h10"/><circle cx="24" cy="24" r="3"/></>}
  </svg>;
}

function Mycelium({ x = 240, y = 175, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {Array.from({ length: 13 }, (_, i) => <g key={i} transform={`rotate(${i * 27.7})`}><path className="visual-ink" pathLength="1" d={`M0 0C18 -12 21 -30 40 -46S70 -65 87 -87M40 -46Q31 -61 34 -79M62 -66Q83 -53 99 -68M22 -25Q5 -31 7 -50`}/><circle cx="87" cy="-87" r="2" className="visual-fill"/></g>)}
    <ellipse rx="26" ry="34" className="visual-wash"/><ellipse rx="18" ry="27"/><ellipse cx="-3" cy="-3" rx="7" ry="10"/>
  </g>;
}

export default function ScientificDrawing({ kind }: { kind: DrawingKind }) {
  return <svg className="scientific-drawing" viewBox="0 0 480 330" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <g className="visual-registration"><path d="M35 52V35h17M428 35h17v17M35 278v17h17M428 295h17v-17M230 22h20M240 12v20M230 308h20M240 298v20"/><circle cx="240" cy="165" r="133" strokeDasharray="2 9"/></g>
    {kind === "organism" && <Mycelium />}
    {kind === "culture" && <><path d="M168 40h144M183 40v51l-48 150q-9 35 25 35h160q34 0 25-35L297 91V40"/><path className="visual-wash" d="M164 151Q202 141 240 154T316 151l29 90q9 35-25 35H160q-34 0-25-35Z"/><path d="M164 151Q202 141 240 154T316 151M240 29v166m-25-6 25 6 25-6"/><Mycelium x={235} y={218} scale={.35}/>{[0,1,2,3].map(i=><g className="culture-bubble" key={i} style={{transform:`translateY(calc(var(--visual-progress, 1) * ${-12-i*5}px))`}}><circle cx={283+i%2*12} cy={137+i*25} r={2+i}/></g>)}<path d="M353 96h39m-24 0v103m-8-8 8 8 8-8" strokeDasharray="3 5"/></>}
    {kind === "measure" && <><path d="M100 218h280M110 218v26h260v-26M230 243v12h20v-12"/><ellipse cx="240" cy="195" rx="102" ry="22"/><path d="M138 195v-23m204 23v-23"/><ellipse cx="240" cy="171" rx="102" ry="22" className="visual-wash"/><Mycelium x={240} y={170} scale={.4}/><path d="M118 82h78m88 0h78M196 75v14m88-14v14M213 82h54" strokeDasharray="3 4"/><circle cx="240" cy="82" r="13"/><path d="M240 95v33"/></>}
    {kind === "specify" && <><path d="M159 48h126l40 42v191H159ZM285 48v43h40"/><path className="visual-wash" d="M177 111h130v54H177Z"/><Mycelium x={242} y={138} scale={.17}/>{[190,220,250].map((y,i)=><g key={y}><circle cx="185" cy={y} r="5"/><path d={`M202 ${y}h${i===2?63:102}`} className="visual-ink" pathLength="1"/></g>)}<path d="M115 110v95m-8-8 8 8 8-8M354 110v95" strokeDasharray="3 5"/></>}
    {kind === "transform" && <><Mycelium x={132} y={165} scale={.45}/><path className="visual-ink" pathLength="1" d="M191 165h45q25 0 25-25V93q0-20 25-20h39M236 165h89M236 165q25 0 25 25v47q0 20 25 20h39"/>{[73,165,257].map((y,i)=><g key={y}><circle cx="350" cy={y} r="25" className="visual-wash"/>{i===0?<><ellipse cx="350" cy={y} rx="13" ry="6"/><path d={`M337 ${y}v6q13 12 26 0v-6`}/></>:i===1?<><path d={`M350 ${y-16}q-21 26 0 30q21-4 0-30Z`}/></>:<><path d={`M337 ${y-8}h26m-26 8h26m-26 8h26m-20-22v28m14-28v28`}/></>}</g>)}</>}
    {kind === "model" && <><path d="M115 265V70m0 195h260"/><path d="M138 235l59-78 60 19 81-91" strokeDasharray="5 8" className="visual-ink" pathLength="1"/>{[[138,235],[197,157],[257,176],[338,85]].map(([x,y])=><g key={x}><path d={`M${x} ${y-18}v36m-6-36h12m-12 36h12`} className="visual-registration"/><circle cx={x} cy={y} r="6" className="visual-wash"/></g>)}</>}
    {kind === "repeat" && <><path className="visual-ink" pathLength="1" d="M131 120A125 125 0 0 1 355 114l9 18m-1-35 1 35-32-11M350 215A125 125 0 0 1 126 221l-9-18m1 35-1-35 32 11"/><Mycelium x={240} y={170} scale={.48}/></>}
  </svg>;
}
