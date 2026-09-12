"use client";
import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap/register";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null); const reduced = useReducedMotion();
  useGSAP(() => { if (!reduced) gsap.fromTo(ref.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .65, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 88%", once: true } }); }, { scope: ref, dependencies: [reduced] });
  return <div ref={ref} className={className}>{children}</div>;
}
