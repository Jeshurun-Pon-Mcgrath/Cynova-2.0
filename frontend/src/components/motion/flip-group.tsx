"use client";
import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";
import { Flip } from "@/lib/gsap/register";
export function FlipGroup({children,className,watch}:{children:ReactNode;className?:string;watch:string|number}){const ref=useRef<HTMLDivElement>(null);useGSAP(()=>{if(!ref.current)return;const state=Flip.getState(ref.current.children);Flip.from(state,{duration:.3,ease:"power2.out",absolute:false})},{scope:ref,dependencies:[watch]});return <div ref={ref} className={className}>{children}</div>}
