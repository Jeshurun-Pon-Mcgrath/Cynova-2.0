import { Attribute, Difficulty } from "../../generated/prisma/enums.js";

const difficultyMultiplier: Record<Difficulty, number> = {
  EASY: 0.8,
  STANDARD: 1,
  CHALLENGING: 1.45,
  EPIC: 2,
};
const categoryMultiplier: Record<Attribute, number> = {
  INTELLECT: 1,
  STRENGTH: 1.05,
  VITALITY: 0.95,
  CHARISMA: 1.1,
  CREATIVITY: 1.05,
  DISCIPLINE: 1,
};
const gains: Record<Difficulty, number> = {
  EASY: 1,
  STANDARD: 2,
  CHALLENGING: 3,
  EPIC: 5,
};

export function levelRequirement(level: number) {
  if (!Number.isSafeInteger(level) || level < 1 || level > 10_000)
    throw new RangeError("Invalid level");
  return Math.round((200 + 48 * Math.pow(level, 1.18)) / 10) * 10;
}

export function calculateQuestReward(
  category: Attribute,
  difficulty: Difficulty,
  estimatedMinutes: number,
) {
  if (
    !Number.isSafeInteger(estimatedMinutes) ||
    estimatedMinutes < 5 ||
    estimatedMinutes > 1_440
  )
    throw new RangeError("Invalid duration");
  const rawXp =
    (20 + estimatedMinutes * 1.15) *
    difficultyMultiplier[difficulty] *
    categoryMultiplier[category];
  const xp = Math.max(20, Math.round(rawXp / 5) * 5);
  return {
    xp,
    gold: Math.max(8, Math.round(xp * 0.4)),
    attributeGain: gains[difficulty],
  };
}

export function applyXp(
  currentLevel: number,
  currentXp: number,
  earnedXp: number,
) {
  if (
    ![currentLevel, currentXp, earnedXp].every(Number.isSafeInteger) ||
    currentLevel < 1 ||
    currentXp < 0 ||
    earnedXp < 0
  )
    throw new RangeError("Invalid progression input");
  let level = currentLevel;
  let xp = currentXp + earnedXp;
  const crossed: number[] = [];
  while (xp >= levelRequirement(level)) {
    xp -= levelRequirement(level);
    level += 1;
    crossed.push(level);
  }
  return {
    previousLevel: currentLevel,
    newLevel: level,
    currentXp: xp,
    nextLevelXp: levelRequirement(level),
    crossed,
  };
}
