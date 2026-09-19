"use client";
import { useEffect, useRef, useState } from "react";
import type { OrganicWorld } from "./World";
import styles from "./lab.module.css";

const stops=[0,.34,.69,1];
const names=["A / DISTANT FORM","B / APPROACH","C / CELLULAR PROXIMITY","D / INTERIOR"];
const contours=Array.from({length:35},(_,j) => {
  const points=Array.from({length:100},(_,i) => {
    const a=i/99*Math.PI*2, r=70+j*4+12*Math.sin(a*3+j*.08);
    return (i?"L":"M")+(620+Math.cos(a)*r).toFixed(2)+","+(340+Math.sin(a)*r*1.18).toFixed(2);
  });
  return points.join(" ")+"Z";
});

export default function OrganicWorldLab() {
  const canvas=useRef<HTMLCanvasElement>(null), intro=useRef<HTMLDivElement>(null);
  const engine=useRef<OrganicWorld|null>(null);
  const lastState=useRef(-1);
  const [state,setState]=useState(0),[paused,setPaused]=useState(false);
  const [failed,setFailed]=useState(false),[ready,setReady]=useState(false);
  const [reduced,setReduced]=useState(false),[notice,setNotice]=useState("");
  useEffect(() => {
    let active=true, timer:ReturnType<typeof setTimeout>|undefined;
    const preference=matchMedia("(prefers-reduced-motion: reduce)");
    const sync=()=>setReduced(preference.matches);
    sync();preference.addEventListener("change",sync);
    if(new URLSearchParams(location.search).get("gpu")==="off")setFailed(true);
    else void import("./World").then(({OrganicWorld})=>{
      if(!active||!canvas.current)return;
      const world=new OrganicWorld(canvas.current);
      world.onProgress=progress=>{
        if(intro.current)intro.current.style.opacity=String(Math.max(0,1-progress*5));
        const next=Math.min(3,Math.floor(progress*3+.5));
        if(lastState.current!==next){lastState.current=next;setState(next);}
      };
      world.onCondition=()=>{
        setNotice("Conditions changed. Give life a moment.");
        clearTimeout(timer);
        timer=setTimeout(()=>{if(active)setNotice("The surface is responding.");},3500);
      };
      world.onFailure=()=>{if(active){setFailed(true);setReady(false);}};
      engine.current=world;setReady(true);
    }).catch(()=>{if(active)setFailed(true);});
    return()=>{active=false;clearTimeout(timer);engine.current?.dispose();engine.current=null;preference.removeEventListener("change",sync);};
  },[]);
  const jump=(p:number)=>window.scrollTo({top:p*(document.documentElement.scrollHeight-innerHeight),behavior:"instant"});
  return <main className={styles.lab} data-failed={failed}>
    {failed && <svg className={styles.fallback} viewBox="0 0 1000 700" aria-label="Static contour study of the biological formation" role="img">
      {contours.map((d,i)=><path key={i} d={d} fill="none" stroke="#4A6741" strokeWidth=".9" opacity={.22+i*.018}/>)}
    </svg>}
    <canvas ref={canvas} hidden={failed} className={styles.canvas} aria-label="A single living three-dimensional membrane environment" />
    <header className={styles.header}><span>HUNER BIOFOUNDRY</span><span>ORGANIC WORLD / STUDY 05</span></header>
    <div className={styles.intro} ref={intro}>
      <p className={styles.eyebrow}>LIVING FOUNDRY / ORGANIC WORLD</p>
      <h1>Formed<br/>by life.</h1>
      <p>One formation.<br/>Many possible worlds.</p>
    </div>
    <div className={styles.conditions}>
      <div className={styles.actions}>
        <button disabled={!ready||failed||reduced||paused} onClick={()=>engine.current?.addCondition()}>Add a condition ↗</button>
        <button disabled={!ready||failed||reduced} aria-pressed={paused} onClick={()=>{engine.current?.setPaused(!paused);setPaused(!paused);}}>{paused?"Resume growth":"Pause growth"}</button>
      </div>
      <p role="status">{failed?"Static study · 3D unavailable on this device.":reduced?"Still growth · reduced motion":notice||"Change the conditions. Watch what follows."}</p>
    </div>
    <footer className={styles.footer}>
      <span>{names[state]}</span>
      <nav aria-label="Camera review positions" className={styles.stops}>{stops.map((p,i)=>
        <button disabled={failed} key={p} aria-label={"Camera state "+"ABCD"[i]} aria-pressed={state===i}
          onClick={()=>jump(p)}>{"ABCD"[i]}</button>)}</nav>
      <span>SCROLL TO TRAVEL ↓</span>
    </footer>
  </main>;
}
