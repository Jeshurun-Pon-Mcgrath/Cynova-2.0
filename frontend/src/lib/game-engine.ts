import type { Achievement, CompletionReward, Difficulty, GameSnapshot, QuestInput } from "@/types/domain";

const difficultyMultiplier: Record<Difficulty, number> = { Easy: 0.8, Standard: 1, Challenging: 1.45, Epic: 2 };
const categoryMultiplier: Record<QuestInput["category"], number> = { Intellect: 1, Strength: 1.05, Vitality: 0.95, Charisma: 1.1, Creativity: 1.05, Discipline: 1 };
const attributeGain: Record<Difficulty, number> = { Easy: 1, Standard: 2, Challenging: 3, Epic: 5 };

export function levelRequirement(level: number) {
  return Math.round((200 + 48 * Math.pow(Math.max(1, level), 1.18)) / 10) * 10;
}

export function calculateQuestReward(input: Pick<QuestInput, "category" | "difficulty" | "estimatedMinutes">) {
  const rawXp = (20 + input.estimatedMinutes * 1.15) * difficultyMultiplier[input.difficulty] * categoryMultiplier[input.category];
  const xp = Math.max(20, Math.round(rawXp / 5) * 5);
  return { xp, gold: Math.max(8, Math.round(xp * 0.4)), attributeGain: attributeGain[input.difficulty] };
}

function updateAchievements(snapshot: GameSnapshot, category: QuestInput["category"], now: string) {
  const strengthGain = category === "Strength" ? 1 : 0;
  const balancedCount = Object.values(snapshot.player.attributes).filter((value) => value >= 60).length;
  const updates: Record<string, number> = {
    a1: 1,
    a2: snapshot.streak.days,
    a4: (snapshot.achievements.find((item) => item.id === "a4")?.progress ?? 0) + strengthGain,
    a5: (snapshot.achievements.find((item) => item.id === "a5")?.progress ?? 0) + 1,
    a6: balancedCount,
  };
  const unlocked: Achievement[] = [];
  const achievements = snapshot.achievements.map((item) => {
    const progress = Math.min(item.target, updates[item.id] ?? item.progress);
    const newlyUnlocked = !item.unlockedAt && progress >= item.target;
    const next = { ...item, progress, unlockedAt: newlyUnlocked ? now : item.unlockedAt };
    if (newlyUnlocked) unlocked.push(next);
    return next;
  });
  return { achievements, unlocked };
}

export function applyQuestCompletion(source: GameSnapshot, questId: string, now = new Date().toISOString(), completionId = `completion-${Date.now()}`): CompletionReward {
  const snapshot = structuredClone(source);
  const index = snapshot.quests.findIndex((quest) => quest.id === questId);
  if (index < 0) throw new Error("Quest not found.");
  const quest = snapshot.quests[index];
  if (quest.status === "completed") throw new Error("This quest is already complete.");

  const gain = attributeGain[quest.difficulty];
  quest.status = "completed";
  quest.completionHistory.push({ id: completionId, questId, completedAt: now, xp: quest.xpReward, gold: quest.goldReward, attributeGain: gain });
  snapshot.player.attributes[quest.category] = Math.min(100, snapshot.player.attributes[quest.category] + gain);
  snapshot.progression.gold += quest.goldReward;
  snapshot.progression.completedToday += 1;
  snapshot.streak.securedToday = true;
  snapshot.streak.lastSecuredDate = now.slice(0, 10);

  const previousLevel = snapshot.progression.level;
  let xp = snapshot.progression.currentXp + quest.xpReward;
  let level = previousLevel;
  let requirement = levelRequirement(level);
  while (xp >= requirement) {
    xp -= requirement;
    level += 1;
    snapshot.progression.skillPoints += 1;
    requirement = levelRequirement(level);
  }
  snapshot.progression.currentXp = xp;
  snapshot.progression.level = level;
  snapshot.progression.nextLevelXp = requirement;
  snapshot.player.level = level;

  const achievementResult = updateAchievements(snapshot, quest.category, now);
  snapshot.achievements = achievementResult.achievements;
  snapshot.activities.unshift({ id: `activity-${completionId}`, text: `Completed ${quest.title} · +${quest.xpReward} XP`, at: now, kind: "quest" });
  if (level > previousLevel) snapshot.activities.unshift({ id: `level-${completionId}`, text: `Reached level ${level}`, at: now, kind: "level" });
  for (const achievement of achievementResult.unlocked) snapshot.activities.unshift({ id: `achievement-${achievement.id}-${completionId}`, text: `Unlocked ${achievement.name}`, at: now, kind: "achievement" });

  return {
    questId,
    xp: quest.xpReward,
    gold: quest.goldReward,
    attribute: quest.category,
    attributeGain: gain,
    previousLevel,
    newLevel: level,
    levelsGained: level - previousLevel,
    unlockedAchievements: achievementResult.unlocked,
    snapshot,
  };
}
