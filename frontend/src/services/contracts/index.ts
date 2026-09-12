import type { Achievement, Archetype, Attribute, CompletionReward, GameSnapshot, Quest, QuestInput, Reward, User } from "@/types/domain";

export interface AuthService {
  signIn(email: string, password: string): Promise<User>;
  register(name: string, email: string, password: string): Promise<User>;
  enterDemo(): Promise<User>;
}
export interface GameService { getSnapshot(): Promise<GameSnapshot> }
export interface QuestService {
  list(): Promise<Quest[]>;
  get(id: string): Promise<Quest | null>;
  create(input: QuestInput): Promise<Quest>;
  update(id: string, input: QuestInput): Promise<Quest>;
  duplicate(id: string): Promise<Quest>;
  remove(id: string): Promise<void>;
  complete(id: string): Promise<CompletionReward>;
}
export interface PlayerService {
  completeOnboarding(input: { name: string; archetype: Archetype; focusAreas: Attribute[]; dailyQuestTarget: number }): Promise<GameSnapshot>;
  updateName(name: string): Promise<GameSnapshot>;
}
export interface RewardService { list(): Promise<Reward[]>; purchase(id: string): Promise<GameSnapshot> }
export interface InventoryService { equip(id: string): Promise<GameSnapshot>; unequip(id: string): Promise<GameSnapshot> }
export interface AchievementService { list(): Promise<Achievement[]> }
export interface SkillService { upgrade(id: string): Promise<GameSnapshot> }
