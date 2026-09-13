"use client";

import { useQuery } from "@tanstack/react-query";
import { initialGameState } from "@/data/seed";
import { achievementService, gameService } from "@/services";

export const gameQueryKey = ["game"] as const;
export const achievementQueryKey = ["achievements"] as const;
export function useGameQuery() { return useQuery({ queryKey: gameQueryKey, queryFn: () => gameService.getSnapshot(), initialData: initialGameState, staleTime: 15_000 }); }
export function useAchievementsQuery() { return useQuery({ queryKey: achievementQueryKey, queryFn: () => achievementService.list(), initialData: initialGameState.achievements }); }
