import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Difficulty } from "@/types/domain";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function xpPercent(current: number, next: number) { return next <= 0 ? 0 : Math.min(100, Math.max(0, Math.round((current / next) * 100))); }
const multipliers: Record<Difficulty, number> = { Easy: 0.8, Standard: 1, Challenging: 1.45, Epic: 2 };
export function calculateReward(difficulty: Difficulty, minutes: number) {
  const xp = Math.max(20, Math.round(((20 + minutes * 1.15) * multipliers[difficulty]) / 5) * 5);
  return { xp, gold: Math.max(8, Math.round(xp * 0.4)) };
}
