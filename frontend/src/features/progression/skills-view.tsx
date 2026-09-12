"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { gameQueryKey, useGameQuery } from "@/lib/query/game-query";
import { mockSkillService } from "@/services/mock/game-service";

export function SkillsView() {
  const client = useQueryClient(); const { data: game } = useGameQuery(); const [selectedId, setSelectedId] = useState(game.skills[0].id); const selected = game.skills.find((skill) => skill.id === selectedId) ?? game.skills[0];
  const requirement = selected.requires ? game.skills.find((skill) => skill.id === selected.requires?.skillId) : undefined;
  const unlocked = game.progression.level >= selected.requiredLevel && (!selected.requires || (requirement?.level ?? 0) >= selected.requires.level);
  const canUpgrade = unlocked && selected.level < selected.maxLevel && game.progression.skillPoints > 0;
  const upgrade = useMutation({ mutationFn: () => mockSkillService.upgrade(selected.id), onSuccess: (snapshot) => { client.setQueryData(gameQueryKey, snapshot); toast.success(`${selected.name} upgraded.`); }, onError: (error) => toast.error(error instanceof Error ? error.message : "Skill upgrade failed.") });
  return <><div className="page-head"><div><span className="eyebrow">Attribute constellation</span><h1>Turn repetition into mastery.</h1><p>Spend skill points earned from leveling your Nova Core.</p></div><span className="hud-pill">{game.progression.skillPoints} skill points</span></div><div className="dashboard-grid"><section className="panel skill-constellation" aria-label="Intellect skill constellation">{game.skills.map((skill) => { const prerequisite = skill.requires ? game.skills.find((item) => item.id === skill.requires?.skillId) : undefined; const locked = game.progression.level < skill.requiredLevel || (!!skill.requires && (prerequisite?.level ?? 0) < skill.requires.level); return <button key={skill.id} className={`skill-node ${locked ? "locked" : ""}`} onClick={() => setSelectedId(skill.id)} aria-pressed={skill.id === selected.id} aria-label={`${skill.name}, level ${skill.level} of ${skill.maxLevel}. ${locked ? "Locked" : "Available"}`}><strong>{skill.name}</strong><span>{locked ? "Locked" : `Level ${skill.level} / ${skill.maxLevel}`}</span></button>; })}</section><aside className="panel"><span className="eyebrow">Selected skill</span><h2 className="skill-title">{selected.name}</h2><p className="muted">{selected.description}</p><p>{unlocked ? selected.level >= selected.maxLevel ? "This skill is mastered." : "Requirements met." : `Requires level ${selected.requiredLevel}${selected.requires ? ` and ${requirement?.name} level ${selected.requires.level}` : ""}.`}</p><Button disabled={!canUpgrade || upgrade.isPending} onClick={() => upgrade.mutate()}>{upgrade.isPending ? "Upgrading…" : selected.level >= selected.maxLevel ? "Mastered" : game.progression.skillPoints < 1 ? "No skill points" : unlocked ? "Upgrade for 1 point" : "Requirements not met"}</Button></aside></div></>;
}
