"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock, Copy, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCompleteQuest } from "@/features/quests/use-complete-quest";
import { gameQueryKey } from "@/lib/query/game-query";
import { gameService, questService } from "@/services";
import type { Quest } from "@/types/domain";

export function QuestDetail({ quest }: { quest: Quest }) {
  const router = useRouter(); const client = useQueryClient(); const [confirm, setConfirm] = useState(false);
  const complete = useCompleteQuest();
  const duplicate = useMutation({ mutationFn: () => questService.duplicate(quest.id), onSuccess: async (copy) => { client.setQueryData(gameQueryKey, await gameService.getSnapshot()); toast.success("Quest duplicated."); router.push(`/quests/${copy.id}`); } });
  const remove = useMutation({ mutationFn: () => questService.remove(quest.id), onSuccess: async () => { client.setQueryData(gameQueryKey, await gameService.getSnapshot()); toast.success("Quest deleted."); router.push("/quests"); }, onError: (error) => toast.error(error instanceof Error ? error.message : "Delete failed.") });
  return <><div className="page-head"><div><span className="eyebrow">{quest.category} · {quest.difficulty}</span><h1>{quest.title}</h1><p>{quest.description}</p><div className="quest-meta">{quest.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div></div><div className="page-actions"><Link className="button button-secondary" href={`/quests/${quest.id}/edit`}><Pencil/>Edit</Link><Button variant="secondary" onClick={() => duplicate.mutate()} disabled={duplicate.isPending}><Copy/>Duplicate</Button><Button variant="danger" onClick={() => setConfirm(true)}><Trash2/>Delete</Button></div></div><div className="dashboard-grid"><section className="panel"><div className="panel-head"><h2>Quest briefing</h2><span className="rarity">{quest.status}</span></div><div className="content-grid"><article><CalendarDays className="cyan"/><h3>Due</h3><p className="muted">{new Date(quest.dueAt).toLocaleString()}</p></article><article><Clock className="cyan"/><h3>Duration</h3><p className="muted">{quest.estimatedMinutes} minutes</p></article><article><Copy className="cyan"/><h3>Recurrence</h3><p className="muted">{quest.recurrence}</p></article></div><hr className="divider"/><h2>Completion history</h2>{quest.completionHistory.length ? <ul className="history-list">{quest.completionHistory.map((record) => <li key={record.id}>{new Date(record.completedAt).toLocaleString()} · +{record.xp} XP · +{record.gold} gold · +{record.attributeGain} {quest.category}</li>)}</ul> : <div className="empty-state"><strong>No victories recorded yet.</strong><p>Complete this quest to create its first Chronicle entry.</p></div>}</section><aside className="panel"><h2>{quest.status === "completed" ? "Reward claimed" : "Awaiting reward"}</h2><p className="muted">This quest strengthens {quest.category}.</p><div className="reward-stats"><div className="stat"><strong className="cyan">+{quest.xpReward}</strong><span className="muted">XP</span></div><div className="stat"><strong className="gold">+{quest.goldReward}</strong><span className="muted">Gold</span></div></div><Button disabled={quest.status === "completed" || complete.isPending} onClick={() => complete.mutate(quest.id)}>{quest.status === "completed" ? "Quest completed" : complete.isPending ? "Completing…" : "Complete quest"}</Button></aside></div>
    <Dialog.Root open={confirm} onOpenChange={setConfirm}><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="mobile-menu"><Dialog.Title>Delete this quest?</Dialog.Title><Dialog.Description className="muted">This permanently removes “{quest.title}” from the mock archive.</Dialog.Description><div className="form-actions"><Dialog.Close asChild><Button variant="secondary">Keep quest</Button></Dialog.Close><Button variant="danger" onClick={() => remove.mutate()} disabled={remove.isPending}>{remove.isPending ? "Deleting…" : "Delete quest"}</Button></div><Dialog.Close className="dialog-close" aria-label="Close"><X/></Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>
  </>;
}
