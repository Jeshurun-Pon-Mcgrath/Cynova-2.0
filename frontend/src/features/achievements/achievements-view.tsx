"use client";

import { Award, LockKeyhole } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAchievementsQuery } from "@/lib/query/game-query";

export function AchievementsView() {
  const { data: achievements, isError, refetch } = useAchievementsQuery(); const unlocked = achievements.filter((item) => item.unlockedAt).length;
  if (isError) return <div className="panel empty-state"><strong>Achievements are unavailable.</strong><button className="button button-secondary" onClick={() => refetch()}>Retry</button></div>;
  return <><div className="page-head"><div><span className="eyebrow">Achievements</span><h1>Milestones worth remembering.</h1><p>{unlocked} of {achievements.length} achievements unlocked.</p></div><span className="hud-pill"><Award/>{Math.round(unlocked / achievements.length * 100)}% complete</span></div><div className="content-grid">{achievements.map((achievement) => { const done = !!achievement.unlockedAt; const value = Math.round(achievement.progress / achievement.target * 100); return <article className="panel achievement-card" key={achievement.id}><span className={done ? "green" : "muted"}>{done ? <Award/> : <LockKeyhole/>}</span><h2>{achievement.name}</h2><p>{achievement.description}</p><div className="card-actions achievement-progress"><div className="level-row"><span>{done ? `Unlocked ${new Date(achievement.unlockedAt!).toLocaleDateString()}` : `${achievement.progress} / ${achievement.target}`}</span><strong>{value}%</strong></div><Progress value={value} label={`${achievement.name}: ${achievement.progress} of ${achievement.target}`}/></div></article>; })}</div></>;
}
