"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { applyQuestCompletion } from "@/lib/game-engine";
import { achievementQueryKey, gameQueryKey } from "@/lib/query/game-query";
import { mockQuestService } from "@/services/mock/game-service";
import type { CompletionReward, GameSnapshot } from "@/types/domain";

export function useCompleteQuest(options?: { onReward?: (reward: CompletionReward) => void }) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (questId: string) => mockQuestService.complete(questId),
    onMutate: async (questId) => {
      await client.cancelQueries({ queryKey: gameQueryKey });
      const previous = client.getQueryData<GameSnapshot>(gameQueryKey);
      if (previous) {
        const optimistic = applyQuestCompletion(previous, questId, new Date().toISOString(), `optimistic-${questId}`);
        client.setQueryData(gameQueryKey, optimistic.snapshot);
      }
      return { previous };
    },
    onSuccess: (reward) => {
      client.setQueryData(gameQueryKey, reward.snapshot);
      client.setQueryData(achievementQueryKey, reward.snapshot.achievements);
      options?.onReward?.(reward);
      toast.success(`Quest complete · +${reward.xp} XP · +${reward.gold} gold · +${reward.attributeGain} ${reward.attribute}`);
      for (const achievement of reward.unlockedAchievements) toast.success(`Achievement unlocked: ${achievement.name}`);
    },
    onError: (error, _questId, context) => {
      if (context?.previous) client.setQueryData(gameQueryKey, context.previous);
      toast.error(error instanceof Error ? error.message : "Quest completion failed and was rolled back.");
    },
  });
}
