"use client";

import { formatDistanceToNow } from "date-fns";
import { useGameQuery } from "@/lib/query/game-query";

export function HistoryView() {
  const { data: game } = useGameQuery(); const values = Array.from({ length: 90 }, (_, index) => ((index * 17 + game.progression.completedToday) % 10) / 10);
  return <><div className="page-head"><div><span className="eyebrow">Chronicle</span><h1>Your effort leaves a trail.</h1><p>Review the quests and milestones shaping your character.</p></div></div><div className="dashboard-grid"><section className="panel"><div className="panel-head"><h2>90-day quest rhythm</h2><span className="green">{game.progression.weeklyConsistency}% this week</span></div><div className="heatmap" role="img" aria-label={`Activity heatmap for the last 90 days. Weekly consistency is ${game.progression.weeklyConsistency} percent.`}>{values.map((value, index) => <i key={index} style={{ "--heat": String(.05 + value * .7) } as React.CSSProperties} title={`${Math.round(value * 5)} quests`}/>)}</div><p className="muted heatmap-key">Less activity <span className="cyan">■ ■ ■ ■</span> More activity</p></section><aside className="panel"><h2>Recent timeline</h2><div className="timeline">{game.activities.map((activity) => <article key={activity.id}><h3>{activity.text}</h3><p>{formatDistanceToNow(new Date(activity.at), { addSuffix: true })} · {activity.kind}</p></article>)}</div></aside></div></>;
}
