"use client";

import Link from "next/link";
import { useGameQuery } from "@/lib/query/game-query";
import { QuestDetail } from "./quest-detail";

export function QuestRoute({ id }: { id: string }) {
  const { data: game, isFetching } = useGameQuery();
  const quest = game.quests.find((item) => item.id === id);
  if (isFetching && !quest) return <div className="skeleton" aria-label="Loading quest"/>;
  if (!quest) return <div className="panel empty-state"><strong>That quest has faded from the archive.</strong><p>It may have been deleted or the link is incomplete.</p><Link className="button button-primary" href="/quests">Return to quests</Link></div>;
  return <QuestDetail quest={quest}/>;
}
