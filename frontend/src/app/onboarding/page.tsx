"use client";

import { useGSAP } from "@gsap/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { gsap } from "@/lib/gsap/register";
import { gameQueryKey, useGameQuery } from "@/lib/query/game-query";
import { mockPlayerService } from "@/services/mock/game-service";
import { ATTRIBUTES, type Archetype, type Attribute } from "@/types/domain";

const archetypes: Archetype[] = ["Scholar", "Vanguard", "Pathfinder", "Alchemist"];
export default function OnboardingPage() {
  const router = useRouter(); const client = useQueryClient(); const { data: game } = useGameQuery();
  const [step, setStep] = useState(0); const [name, setName] = useState(game.player.name); const [archetype, setArchetype] = useState<Archetype>(game.player.archetype); const [selected, setSelected] = useState<Attribute[]>(game.player.focusAreas); const [target, setTarget] = useState(game.player.dailyQuestTarget);
  const save = useMutation({ mutationFn: () => mockPlayerService.completeOnboarding({ name: name.trim(), archetype, focusAreas: selected, dailyQuestTarget: target }), onSuccess: (snapshot) => { client.setQueryData(gameQueryKey, snapshot); setStep(4); toast.success("Your character has awakened."); } });
  const toggle = (focus: Attribute) => setSelected((values) => values.includes(focus) ? values.filter((value) => value !== focus) : values.length < 3 ? [...values, focus] : values);
  const valid = step !== 0 || name.trim().length >= 2;
  return <main className="onboarding"><div className="onboarding-card"><Logo/><div className="step-track" aria-label={`Step ${step + 1} of 5`}>{[0,1,2,3,4].map((index) => <i className={index <= step ? "active" : ""} key={index}/>)}</div><section className="panel">{step === 0 && <><p className="eyebrow">Name your hero</p><h1 className="display">What should your realm call you?</h1><div className="field"><label htmlFor="player-name">Player name</label><input id="player-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={40}/>{!valid && <span className="field-error">Use at least 2 characters.</span>}</div></>}{step === 1 && <><p className="eyebrow">Choose an archetype</p><h1 className="display">How do you approach the unknown?</h1><div className="choice-grid">{archetypes.map((value) => <button key={value} className={`choice ${value === archetype ? "selected" : ""}`} onClick={() => setArchetype(value)} aria-pressed={value === archetype}><strong>{value}</strong><p className="muted">{value === "Scholar" ? "Master ideas through deliberate practice." : value === "Vanguard" ? "Meet hard things with courage." : value === "Pathfinder" ? "Explore, adapt, and keep moving." : "Experiment until insight appears."}</p></button>)}</div></>}{step === 2 && <><p className="eyebrow">Shape your path</p><h1 className="display">Choose three focus areas.</h1><div className="choice-grid">{ATTRIBUTES.map((focus) => <button key={focus} className={`choice ${selected.includes(focus) ? "selected" : ""}`} onClick={() => toggle(focus)} aria-pressed={selected.includes(focus)}><strong>{focus}</strong><p className="muted">{selected.includes(focus) ? "Selected" : "Choose this path"}</p></button>)}</div></>}{step === 3 && <><p className="eyebrow">Set your rhythm</p><h1 className="display">How many daily quests feel sustainable?</h1><div className="field"><label htmlFor="daily-target">Daily target: {target} quests</label><input id="daily-target" type="range" min="1" max="7" value={target} onChange={(event) => setTarget(Number(event.target.value))}/><small>Aim for consistency before intensity.</small></div></>}{step === 4 && <CharacterReveal name={name} archetype={archetype} selected={selected} target={target}/>}<div className="form-actions">{step > 0 && step < 4 && <Button variant="secondary" onClick={() => setStep((value) => value - 1)}>Back</Button>}<Button disabled={!valid || (step === 2 && selected.length !== 3) || save.isPending} onClick={() => step === 4 ? router.push("/dashboard") : step === 3 ? save.mutate() : setStep((value) => value + 1)}>{save.isPending ? "Awakening…" : step === 4 ? "Enter my realm" : "Continue"}</Button></div></section></div></main>;
}

function CharacterReveal({ name, archetype, selected, target }: { name: string; archetype: Archetype; selected: Attribute[]; target: number }) {
  const ref = useRef<HTMLDivElement>(null); const reduced = useReducedMotion();
  useGSAP(() => { if (!reduced) gsap.fromTo(ref.current?.children ?? [], { opacity: 0, y: 18, scale: .96 }, { opacity: 1, y: 0, scale: 1, stagger: .12, duration: .55, ease: "back.out(1.4)" }); }, { scope: ref, dependencies: [reduced] });
  return <div ref={ref} className="reveal-character"><div className="character-emblem"/><p className="eyebrow">Realm awakened</p><h1 className="display">{name}, the {archetype}</h1><p className="muted">Your path begins with {selected.join(", ")}. Complete {target} quests today to charge your Nova Core.</p></div>;
}
