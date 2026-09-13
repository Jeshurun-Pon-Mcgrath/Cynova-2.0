"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { gameQueryKey, useGameQuery } from "@/lib/query/game-query";
import { inventoryService } from "@/services";

export function InventoryView() {
  const client = useQueryClient();
  const { data: game } = useGameQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const update = useMutation({
    mutationFn: ({ id, equipped }: { id: string; equipped: boolean }) =>
      equipped ? inventoryService.unequip(id) : inventoryService.equip(id),
    onSuccess: (snapshot) => {
      client.setQueryData(gameQueryKey, snapshot);
      setSelectedId(null);
      toast.success("Character equipment updated.");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Equipment could not be updated.",
      ),
  });
  const items = game.inventory
    .map((entry) => ({
      ...entry,
      reward: game.rewards.find((reward) => reward.id === entry.rewardId)!,
    }))
    .filter((entry) => entry.reward);
  const selected = items.find((item) => item.id === selectedId);
  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Inventory</span>
          <h1>Your earned relics.</h1>
          <p>Equip cosmetics that tell the story of your progress.</p>
        </div>
      </div>
      {items.length ? (
        <div className="content-grid">
          {items.map((item) => (
            <article className="panel inventory-card" key={item.id}>
              <span className={`rarity ${item.reward.rarity}`}>
                {item.reward.rarity} · {item.reward.category}
              </span>
              <h2>{item.reward.name}</h2>
              <p>{item.reward.description}</p>
              <div className="card-actions">
                <span>
                  {item.equipped && (
                    <>
                      <CheckCircle2 className="green" /> Equipped
                    </>
                  )}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedId(item.id)}
                >
                  Details
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel empty-state">
          <strong>No relics yet.</strong>
          <p>Visit Rewards to spend the gold your quests have earned.</p>
        </div>
      )}
      <Dialog.Root
        open={!!selected}
        onOpenChange={(open) => !open && setSelectedId(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="mobile-menu">
            <Dialog.Title>{selected?.reward.name}</Dialog.Title>
            <Dialog.Description className="muted">
              {selected?.reward.description}
            </Dialog.Description>
            <p>
              <span className={`rarity ${selected?.reward.rarity}`}>
                {selected?.reward.rarity} · {selected?.reward.category}
              </span>
            </p>
            <p>
              {selected?.equipped
                ? "Currently equipped on your character."
                : "Owned and ready to equip."}
            </p>
            <Button
              disabled={update.isPending}
              onClick={() =>
                selected &&
                update.mutate({ id: selected.id, equipped: selected.equipped })
              }
            >
              {update.isPending
                ? "Updating…"
                : selected?.equipped
                  ? "Unequip"
                  : "Equip"}
            </Button>
            <Dialog.Close
              className="dialog-close"
              aria-label="Close item details"
            >
              <X />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
