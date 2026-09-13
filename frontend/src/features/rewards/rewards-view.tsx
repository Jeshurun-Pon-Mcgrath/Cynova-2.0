"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Coins, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { gameQueryKey, useGameQuery } from "@/lib/query/game-query";
import { rewardService } from "@/services";
import type { Reward } from "@/types/domain";

export function RewardsView() {
  const client = useQueryClient(); const { data: game } = useGameQuery(); const [selected, setSelected] = useState<Reward | null>(null); const [category, setCategory] = useState("All");
  const purchase = useMutation({ mutationFn: (id: string) => rewardService.purchase(id), onSuccess: (snapshot) => { client.setQueryData(gameQueryKey, snapshot); toast.success(`${snapshot.rewards.find((item) => item.id === selected?.id)?.name} added to your inventory.`); setSelected(null); }, onError: (error) => toast.error(error instanceof Error ? error.message : "Purchase failed.") });
  const shown = category === "All" ? game.rewards : game.rewards.filter((item) => item.category === category);
  return <><div className="page-head"><div><span className="eyebrow">Rewards</span><h1>Let your realm reflect the journey.</h1><p>Spend earned gold on cosmetics and practical streak protection.</p></div><span className="hud-pill"><Coins/>{game.progression.gold.toLocaleString()} gold</span></div><div className="toolbar"><label className="sr-only" htmlFor="reward-category">Reward category</label><select id="reward-category" value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{["Themes", "Core Skins", "Avatar Frames", "Titles", "Streak Shields"].map((value) => <option key={value}>{value}</option>)}</select></div><div className="content-grid">{shown.map((item) => <article className="panel reward-card" key={item.id}><span className={`rarity ${item.rarity}`}>{item.rarity} · {item.category}</span><h2>{item.name}</h2><p>{item.description}</p><div className="card-actions"><span className="price"><Coins/> {item.cost}</span><Button size="sm" variant={item.owned ? "secondary" : "primary"} onClick={() => setSelected(item)}>{item.owned ? "Owned details" : "Preview"}</Button></div></article>)}</div><Dialog.Root open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="mobile-menu"><Dialog.Title className="display">{selected?.name}</Dialog.Title><Dialog.Description className="muted">{selected?.description}</Dialog.Description><div className="core-mini" aria-hidden="true"/><p className="price">{selected?.cost} gold · Balance {game.progression.gold}</p><Button disabled={selected?.owned || purchase.isPending || (!!selected && selected.cost > game.progression.gold)} onClick={() => selected && purchase.mutate(selected.id)}>{purchase.isPending ? "Unlocking…" : selected?.owned ? "Already owned" : selected && selected.cost > game.progression.gold ? "Insufficient gold" : "Confirm purchase"}</Button><Dialog.Close className="dialog-close" aria-label="Close preview"><X/></Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root></>;
}
