export const ATTRIBUTES = ["Intellect", "Strength", "Vitality", "Charisma", "Creativity", "Discipline"] as const;
export type Attribute = (typeof ATTRIBUTES)[number];
export type Archetype = "Scholar" | "Vanguard" | "Pathfinder" | "Alchemist";
export type Difficulty = "Easy" | "Standard" | "Challenging" | "Epic";
export type QuestStatus = "active" | "completed" | "overdue";
export type QuestRecurrence = "None" | "Daily" | "Weekly";
export type RewardRarity = "Common" | "Rare" | "Epic" | "Legendary";
export type RewardCategory = "Themes" | "Core Skins" | "Avatar Frames" | "Titles" | "Streak Shields";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface PlayerProfile {
  userId: string;
  name: string;
  archetype: Archetype;
  level: number;
  focusAreas: Attribute[];
  dailyQuestTarget: number;
  attributes: Record<Attribute, number>;
  equipped: { frame: string; title: string; coreSkin: string; theme: string };
}

export interface Progression {
  currentXp: number;
  nextLevelXp: number;
  gold: number;
  level: number;
  skillPoints: number;
  completedToday: number;
  weeklyConsistency: number;
}

export interface Streak {
  days: number;
  securedToday: boolean;
  best: number;
  lastSecuredDate?: string;
}

export interface QuestCompletion {
  id: string;
  questId: string;
  completedAt: string;
  xp: number;
  gold: number;
  attributeGain: number;
}

export interface Quest {
  id: string;
  title: string;
  description?: string;
  category: Attribute;
  difficulty: Difficulty;
  xpReward: number;
  goldReward: number;
  dueAt: string;
  recurrence: QuestRecurrence;
  estimatedMinutes: number;
  status: QuestStatus;
  completionHistory: QuestCompletion[];
  tags: string[];
}

export type QuestInput = Pick<Quest, "title" | "description" | "category" | "difficulty" | "dueAt" | "recurrence" | "estimatedMinutes" | "tags">;

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: RewardCategory;
  rarity: RewardRarity;
  cost: number;
  owned: boolean;
}

export interface InventoryItem {
  id: string;
  rewardId: string;
  equipped: boolean;
  acquiredAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  unlockedAt?: string;
}

export interface ActivityEvent {
  id: string;
  text: string;
  at: string;
  kind: "quest" | "reward" | "level" | "achievement" | "character";
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  requiredLevel: number;
  requires?: { skillId: string; level: number };
}

export interface UserPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  sound: boolean;
  graphics: "low" | "high";
}

export interface GameSnapshot {
  user: User | null;
  demoAuthenticated: boolean;
  player: PlayerProfile;
  progression: Progression;
  streak: Streak;
  quests: Quest[];
  rewards: Reward[];
  inventory: InventoryItem[];
  achievements: Achievement[];
  activities: ActivityEvent[];
  skills: SkillNode[];
}

export interface CompletionReward {
  questId: string;
  xp: number;
  gold: number;
  attribute: Attribute;
  attributeGain: number;
  previousLevel: number;
  newLevel: number;
  levelsGained: number;
  unlockedAchievements: Achievement[];
  snapshot: GameSnapshot;
}
