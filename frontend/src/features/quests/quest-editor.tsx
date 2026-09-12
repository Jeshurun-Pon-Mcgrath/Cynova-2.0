"use client";

import Link from "next/link";
import { useGameQuery } from "@/lib/query/game-query";
import { QuestForm } from "./quest-form";

export function QuestEditor({ id }: { id: string }) {
  const { data: game } = useGameQuery();
  const quest = game.quests.find((item) => item.id === id);
  if (!quest) return <div className="panel empty-state"><strong>That quest cannot be edited.</strong><p>It may have been removed.</p><Link className="button button-primary" href="/quests">Return to quests</Link></div>;
  return <><div className="page-head"><div><span className="eyebrow">Quest forge</span><h1>Edit quest.</h1><p>Refine the action without losing its completion history.</p></div></div><QuestForm quest={quest}/></>;
}
