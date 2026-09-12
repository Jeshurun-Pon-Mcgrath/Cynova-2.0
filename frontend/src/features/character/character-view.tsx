"use client";

import { AttributeRadar } from "@/components/charts/attribute-radar";
import { Progress } from "@/components/ui/progress";
import { useGameQuery } from "@/lib/query/game-query";
import { xpPercent } from "@/lib/utils";

export function CharacterView() {
  const { data: game } = useGameQuery();
  const { player, progression } = game;
  return <><div className="page-head"><div><span className="eyebrow">Character</span><h1>{player.name}, the {player.archetype}</h1><p>Every attribute is evidence of work done beyond this screen.</p></div></div><div className="character-layout"><section className="panel character-card"><div className="character-emblem" data-core-skin={player.equipped.coreSkin} role="img" aria-label={`${player.name}'s ${player.equipped.coreSkin} Nova Core emblem`}/><span className="rarity">Level {progression.level} · {player.archetype}</span><h2>{player.equipped.title}</h2><p className="muted">Focused on {player.focusAreas.join(", ")} with a daily target of {player.dailyQuestTarget} quests.</p><div className="level-row"><span>{progression.currentXp} XP</span><strong>{progression.nextLevelXp - progression.currentXp} to next level</strong></div><Progress value={xpPercent(progression.currentXp, progression.nextLevelXp)} label={`Level ${progression.level} progress, ${progression.currentXp} of ${progression.nextLevelXp} XP`}/><div className="equipment-grid"><small><span className="muted">Frame</span><br/>{player.equipped.frame}</small><small><span className="muted">Core</span><br/>{player.equipped.coreSkin}</small><small><span className="muted">Title</span><br/>{player.equipped.title}</small><small><span className="muted">Theme</span><br/>{player.equipped.theme}</small></div></section><section className="panel"><div className="panel-head"><h2>Attribute balance</h2><span className="muted">Live progression</span></div><AttributeRadar attributes={player.attributes}/><div className="attribute-list">{Object.entries(player.attributes).map(([name, value]) => <div className="attribute-row" key={name}><strong>{name}</strong><Progress value={value} label={`${name}: ${value} out of 100`}/><span>{value}</span></div>)}</div></section></div></>;
}
