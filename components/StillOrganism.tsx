/** Quiet arrival composition when motion or GPU rendering is unavailable. */
export default function StillOrganism() {
  return <svg className="still-organism" viewBox="0 0 300 310" aria-hidden="true">
    {[[95,45,17,21,-18],[185,54,20,17,25],[61,102,16,18,17],[136,121,17,23,-35],[228,114,22,16,-20],[88,179,19,24,12],[170,183,21,17,-24],[238,195,16,22,18],[130,253,16,21,25],[199,264,17,20,-8]].map(([x,y,rx,ry,angle],i)=><g key={i} transform={`rotate(${angle} ${x} ${y})`}>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#374f2f" stroke="#4a6741" strokeWidth="3"/>
      <ellipse cx={x-3} cy={y-4} rx={rx*.62} ry={ry*.68} fill="#4a6741"/>
      <path d={`M${x-rx*.45} ${y-ry*.3}q0 ${-ry*.4} ${rx*.35} ${-ry*.4}`} fill="none" stroke="#f4f1e8" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round"/>
    </g>)}
  </svg>;
}
