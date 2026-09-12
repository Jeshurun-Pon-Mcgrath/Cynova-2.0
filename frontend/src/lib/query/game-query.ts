"use client";

import { useQuery } from "@tanstack/react-query";
import { initialGameState } from "@/data/seed";
import { mockAchievementService, mockGameService } from "@/services/mock/game-service";

export const gameQueryKey = ["game"] as const;
export const achievementQueryKey = ["achievements"] as const;
export function useGameQuery() { return useQuery({ queryKey: gameQueryKey, queryFn: () => mockGameService.getSnapshot(), initialData: initialGameState, staleTime: 15_000 }); }
export function useAchievementsQuery() { return useQuery({ queryKey: achievementQueryKey, queryFn: () => mockAchievementService.list(), initialData: initialGameState.achievements }); }
