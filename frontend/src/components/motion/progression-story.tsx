"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { gsap } from "@/lib/gsap/register";

const steps = [["Quest", "Choose a real action worth doing."], ["XP", "Finish it and capture momentum."], ["Level", "Watch effort shape your attributes."], ["Reward", "Unlock a realm that reflects your growth."]];
export function ProgressionStory() {
  const ref = useRef<HTMLElement>(null); const reduced = useReducedMotion();
  useGSAP(() => { if (reduced || !ref.current) return; const media = gsap.matchMedia(); media.add("(min-width: 1024px)", () => { const cards = ref.current?.querySelectorAll("article"); if (!cards) return; gsap.from(cards, { opacity: .35, y: 28, stagger: .16, scrollTrigger: { trigger: ref.current, start: "top 68%", end: "+=420", scrub: .6, pin: true, anticipatePin: 1 } }); }); return () => media.revert(); }, { scope: ref, dependencies: [reduced] });
  return <section ref={ref} className="section"><div className="section-head"><p className="eyebrow">A world that remembers</p><h2>From intention to identity.</h2></div><div className="story">{steps.map(([heading, copy], index) => <article key={heading}><span>0{index + 1}</span><h3>{heading}</h3><p>{copy}</p></article>)}</div></section>;
}
