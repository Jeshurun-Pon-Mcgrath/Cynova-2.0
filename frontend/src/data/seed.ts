import type { Achievement, ActivityEvent, GameSnapshot, Quest, Reward, SkillNode } from "@/types/domain";

const now = new Date("2026-09-12T12:00:00.000Z");
const todayKey = now.toISOString().slice(0, 10);
const due = (hour: number, dayOffset = 0) => new Date(Date.UTC(2026, 8, 13 + dayOffset, hour)).toISOString();
const completion = (questId: string, xp: number, gold: number, attributeGain: number) => ({ id: `seed-${questId}`, questId, completedAt: `${todayKey}T08:00:00.000Z`, xp, gold, attributeGain });

export const quests: Quest[] = [
  { id: "q1", title: "Complete two DSA problems", description: "Build pattern recognition with two focused problems.", category: "Intellect", difficulty: "Challenging", xpReward: 90, goldReward: 35, dueAt: due(19), recurrence: "None", estimatedMinutes: 50, status: "active", completionHistory: [], tags: ["focus", "coding"] },
  { id: "q2", title: "Review operating systems notes", description: "Review scheduling and deadlock notes.", category: "Intellect", difficulty: "Standard", xpReward: 55, goldReward: 22, dueAt: due(17), recurrence: "None", estimatedMinutes: 30, status: "completed", completionHistory: [completion("q2", 55, 22, 2)], tags: ["study"] },
  { id: "q3", title: "30-minute strength workout", description: "Complete today's push and pull circuit.", category: "Strength", difficulty: "Standard", xpReward: 60, goldReward: 25, dueAt: due(18), recurrence: "Weekly", estimatedMinutes: 30, status: "active", completionHistory: [], tags: ["fitness"] },
  { id: "q4", title: "Drink 2 litres of water", description: "Keep your vitality meter charged.", category: "Vitality", difficulty: "Easy", xpReward: 30, goldReward: 12, dueAt: due(20), recurrence: "Daily", estimatedMinutes: 5, status: "completed", completionHistory: [completion("q4", 30, 12, 1)], tags: ["health"] },
  { id: "q5", title: "Present project update clearly", description: "Share the build, blockers, and next milestone.", category: "Charisma", difficulty: "Challenging", xpReward: 85, goldReward: 34, dueAt: due(16), recurrence: "None", estimatedMinutes: 20, status: "active", completionHistory: [], tags: ["work"] },
  { id: "q6", title: "Design one portfolio section", description: "Create and refine a single case-study section.", category: "Creativity", difficulty: "Standard", xpReward: 65, goldReward: 26, dueAt: due(21), recurrence: "None", estimatedMinutes: 45, status: "active", completionHistory: [], tags: ["creative"] },
  { id: "q7", title: "Plan tomorrow before sleeping", description: "Pick tomorrow's three most valuable quests.", category: "Discipline", difficulty: "Easy", xpReward: 30, goldReward: 12, dueAt: due(22), recurrence: "Daily", estimatedMinutes: 10, status: "completed", completionHistory: [completion("q7", 30, 12, 1)], tags: ["planning"] },
];

export const rewards: Reward[] = [
  { id: "r1", name: "Moonlit Realm", description: "A calm indigo realm theme.", category: "Themes", rarity: "Rare", cost: 650, owned: false },
  { id: "r2", name: "Solar Flare Core", description: "A gold core forged for long streaks.", category: "Core Skins", rarity: "Epic", cost: 1100, owned: false },
  { id: "r3", name: "Aetherbound Frame", description: "An animated cyan character frame.", category: "Avatar Frames", rarity: "Rare", cost: 480, owned: true },
  { id: "r4", name: "The Unbroken", description: "A title for disciplined heroes.", category: "Titles", rarity: "Legendary", cost: 1800, owned: false },
  { id: "r5", name: "Streak Shield", description: "Protect one missed day.", category: "Streak Shields", rarity: "Common", cost: 250, owned: false },
];

export const achievements: Achievement[] = [
  { id: "a1", name: "First Step", description: "Complete your first quest.", progress: 1, target: 1, unlockedAt: "2026-08-12" },
  { id: "a2", name: "Seven-Day Flame", description: "Maintain a seven-day streak.", progress: 7, target: 7, unlockedAt: "2026-08-19" },
  { id: "a3", name: "Deep Work Adept", description: "Complete 25 focus quests.", progress: 25, target: 25, unlockedAt: "2026-09-04" },
  { id: "a4", name: "Iron Will", description: "Complete 30 Strength quests.", progress: 18, target: 30 },
  { id: "a5", name: "Quest Century", description: "Complete 100 quests.", progress: 86, target: 100 },
  { id: "a6", name: "Balanced Hero", description: "Reach 60 in every attribute.", progress: 4, target: 6 },
];

export const activities: ActivityEvent[] = [
  { id: "e1", text: "Completed Morning revision", at: new Date(now.getTime() - 12 * 60_000).toISOString(), kind: "quest" },
  { id: "e2", text: "Unlocked Deep Work Adept", at: new Date(now.getTime() - 86_400_000).toISOString(), kind: "achievement" },
  { id: "e3", text: "Reached level 12", at: new Date(now.getTime() - 3 * 86_400_000).toISOString(), kind: "level" },
];

export const skills: SkillNode[] = [
  { id: "focused-mind", name: "Focused Mind", description: "+8% Intellect XP from focused quests.", level: 3, maxLevel: 5, requiredLevel: 5 },
  { id: "memory-palace", name: "Memory Palace", description: "Review streaks grant a consistency bonus.", level: 2, maxLevel: 4, requiredLevel: 8 },
  { id: "deep-work", name: "Deep Work", description: "Long focus sessions gain bonus mastery.", level: 4, maxLevel: 5, requiredLevel: 10 },
  { id: "flow-state", name: "Flow State", description: "Unlock a focused daily challenge.", level: 0, maxLevel: 3, requiredLevel: 12, requires: { skillId: "deep-work", level: 4 } },
  { id: "arcane-recall", name: "Arcane Recall", description: "Revisit completed learning quests.", level: 0, maxLevel: 3, requiredLevel: 15 },
  { id: "polymath", name: "Polymath", description: "Cross-attribute quests gain more XP.", level: 0, maxLevel: 1, requiredLevel: 18, requires: { skillId: "focused-mind", level: 5 } },
];

export const initialGameState: GameSnapshot = {
  user: { id: "user-arin", email: "arin@example.com", name: "Arin" },
  demoAuthenticated: true,
  player: {
    userId: "user-arin", name: "Arin", archetype: "Scholar", level: 12,
    focusAreas: ["Intellect", "Creativity", "Discipline"], dailyQuestTarget: 5,
    attributes: { Intellect: 78, Strength: 52, Vitality: 66, Charisma: 48, Creativity: 71, Discipline: 82 },
    equipped: { frame: "Aetherbound Frame", title: "Deep Work Adept", coreSkin: "Cyan Nova", theme: "Default Realm" },
  },
  progression: { currentXp: 840, nextLevelXp: 1100, gold: 1260, level: 12, skillPoints: 3, completedToday: 3, weeklyConsistency: 86 },
  streak: { days: 18, securedToday: false, best: 24 },
  quests,
  rewards,
  inventory: [{ id: "i-r3", rewardId: "r3", equipped: true, acquiredAt: "2026-09-04T10:00:00.000Z" }],
  achievements,
  activities,
  skills,
};

export const player = initialGameState.player;
export const progression = initialGameState.progression;
export const streak = initialGameState.streak;
