"use client";
import { useEffect } from "react";

/** Keep fixed navigation readable as the preserved dark cell gives way to paper. */
export default function JourneyReadingTheme() {
  useEffect(()=>{
    const surfaces = [...document.querySelectorAll<HTMLElement>(".science-home")];
    let frame = 0;
    const draw = () => {
      frame = 0;
      const light = surfaces.some(surface=>{const box=surface.getBoundingClientRect();return box.top<=120&&box.bottom>80;});
      document.documentElement.dataset.readingSurface = light ? "light" : "none";
    };
    const schedule = () => {if(!frame)frame=requestAnimationFrame(draw);};
    const observer = new ResizeObserver(schedule);surfaces.forEach(surface=>observer.observe(surface));
    window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);draw();
    return ()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);delete document.documentElement.dataset.readingSurface;};
  },[]);
  return null;
}
