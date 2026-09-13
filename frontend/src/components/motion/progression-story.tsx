"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { gsap } from "@/lib/gsap/register";

const steps = [
  ["Quest", "Choose a real action worth doing."],
  ["XP", "Finish it and capture momentum."],
  ["Level", "Watch effort shape your attributes."],
  ["Reward", "Unlock a realm that reflects your growth."],
];
export function ProgressionStory() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      const cards = ref.current.querySelectorAll("article");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.48,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
        },
      );
    },
    { scope: ref, dependencies: [reduced] },
  );
  return (
    <section ref={ref} className="section">
      <div className="section-head">
        <p className="eyebrow">A record of your effort</p>
        <h2>Every screen answers a real action.</h2>
      </div>
      <div className="story">
        {steps.map(([heading, copy], index) => (
          <article key={heading}>
            <span>0{index + 1}</span>
            <h3>{heading}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
