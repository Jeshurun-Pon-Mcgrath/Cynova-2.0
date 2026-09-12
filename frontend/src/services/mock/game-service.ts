import { initialGameState } from "@/data/seed";
import { applyQuestCompletion, calculateQuestReward } from "@/lib/game-engine";
import type { GameSnapshot, Quest } from "@/types/domain";
import type { AchievementService, AuthService, GameService, InventoryService, PlayerService, QuestService, RewardService, SkillService } from "@/services/contracts";

let gameState = structuredClone(initialGameState);
let failNextCompletion = false;
let mockLatency = 300;
let idCounter = 100;
const wait = (factor = 1) => new Promise((resolve) => setTimeout(resolve, mockLatency * factor));
const copy = <T,>(value: T): T => structuredClone(value);
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

export function resetMockState(snapshot: GameSnapshot = initialGameState) { gameState = copy(snapshot); failNextCompletion = false; idCounter = 100; }
export function setMockLatency(milliseconds: number) { mockLatency = milliseconds; }
export function simulateNextCompletionFailure() { failNextCompletion = true; }
export function getMockSnapshot() { return copy(gameState); }

export const mockGameService: GameService = { async getSnapshot() { await wait(.8); return copy(gameState); } };

export const mockAuthService: AuthService = {
  async signIn(email, password) { await wait(); if (password.length < 8) throw new Error("Password is too short."); gameState.user = { id: "user-arin", email, name: gameState.player.name }; gameState.demoAuthenticated = true; return copy(gameState.user); },
  async register(name, email, password) { await wait(); if (password.length < 8) throw new Error("Password is too short."); const user = { id: nextId("user"), email, name }; gameState.user = user; gameState.player = { ...gameState.player, userId: user.id, name }; gameState.demoAuthenticated = true; return copy(user); },
  async enterDemo() { await wait(.5); gameState.demoAuthenticated = true; if (!gameState.user) gameState.user = { id: "user-arin", email: "arin@example.com", name: gameState.player.name }; return copy(gameState.user); },
};

export const mockQuestService: QuestService = {
  async list() { await wait(); return copy(gameState.quests); },
  async get(id) { await wait(.7); return copy(gameState.quests.find((quest) => quest.id === id) ?? null); },
  async create(input) {
    await wait();
    const reward = calculateQuestReward(input);
    const quest: Quest = { ...copy(input), id: nextId("quest"), xpReward: reward.xp, goldReward: reward.gold, status: "active", completionHistory: [] };
    gameState.quests.unshift(quest);
    return copy(quest);
  },
  async update(id, input) {
    await wait();
    const index = gameState.quests.findIndex((quest) => quest.id === id);
    if (index < 0) throw new Error("Quest not found.");
    const reward = calculateQuestReward(input);
    gameState.quests[index] = { ...gameState.quests[index], ...copy(input), xpReward: reward.xp, goldReward: reward.gold };
    return copy(gameState.quests[index]);
  },
  async duplicate(id) {
    await wait();
    const source = gameState.quests.find((quest) => quest.id === id);
    if (!source) throw new Error("Quest not found.");
    const title = `${source.title.slice(0, 70)} copy`;
    const duplicate: Quest = { ...copy(source), id: nextId("quest"), title, status: "active", completionHistory: [], dueAt: new Date(Date.parse(source.dueAt) + 86_400_000).toISOString() };
    gameState.quests.unshift(duplicate);
    return copy(duplicate);
  },
  async remove(id) {
    await wait();
    const next = gameState.quests.filter((quest) => quest.id !== id);
    if (next.length === gameState.quests.length) throw new Error("Quest not found.");
    gameState.quests = next;
  },
  async complete(id) {
    await wait(1.4);
    if (failNextCompletion) { failNextCompletion = false; throw new Error("The realm link flickered. Every optimistic reward was rolled back."); }
    const result = applyQuestCompletion(gameState, id, new Date().toISOString(), nextId("completion"));
    gameState = result.snapshot;
    return copy(result);
  },
};

export const mockPlayerService: PlayerService = {
  async completeOnboarding(input) { await wait(); gameState.player = { ...gameState.player, ...copy(input) }; if (gameState.user) gameState.user.name = input.name; gameState.activities.unshift({ id: nextId("activity"), text: `${input.name} awakened as a ${input.archetype}`, at: new Date().toISOString(), kind: "character" }); return copy(gameState); },
  async updateName(name) { await wait(.6); gameState.player.name = name; if (gameState.user) gameState.user.name = name; return copy(gameState); },
};

export const mockRewardService: RewardService = {
  async list() { await wait(); return copy(gameState.rewards); },
  async purchase(id) {
    await wait();
    const reward = gameState.rewards.find((item) => item.id === id);
    if (!reward) throw new Error("Reward not found.");
    if (reward.owned) throw new Error("This reward is already in your inventory.");
    if (reward.cost > gameState.progression.gold) throw new Error("You need more gold for this reward.");
    reward.owned = true;
    gameState.progression.gold -= reward.cost;
    gameState.inventory.push({ id: nextId("inventory"), rewardId: reward.id, equipped: false, acquiredAt: new Date().toISOString() });
    gameState.activities.unshift({ id: nextId("activity"), text: `Purchased ${reward.name}`, at: new Date().toISOString(), kind: "reward" });
    return copy(gameState);
  },
};

function equipmentValue(category: string, name: string) {
  if (category === "Avatar Frames") return { frame: name };
  if (category === "Core Skins") return { coreSkin: name };
  if (category === "Titles") return { title: name };
  if (category === "Themes") return { theme: name };
  return {};
}
function unequippedValue(category: string) {
  if (category === "Avatar Frames") return { frame: "Unframed" };
  if (category === "Core Skins") return { coreSkin: "Cyan Nova" };
  if (category === "Titles") return { title: "Adventurer" };
  if (category === "Themes") return { theme: "Default Realm" };
  return {};
}

export const mockInventoryService: InventoryService = {
  async equip(id) {
    await wait(.7);
    const item = gameState.inventory.find((entry) => entry.id === id);
    if (!item) throw new Error("Inventory item not found.");
    const reward = gameState.rewards.find((entry) => entry.id === item.rewardId);
    if (!reward) throw new Error("Reward data is unavailable.");
    for (const entry of gameState.inventory) {
      const entryReward = gameState.rewards.find((candidate) => candidate.id === entry.rewardId);
      if (entryReward?.category === reward.category) entry.equipped = false;
    }
    item.equipped = true;
    gameState.player.equipped = { ...gameState.player.equipped, ...equipmentValue(reward.category, reward.name) };
    return copy(gameState);
  },
  async unequip(id) {
    await wait(.7);
    const item = gameState.inventory.find((entry) => entry.id === id);
    if (!item) throw new Error("Inventory item not found.");
    item.equipped = false;
    const reward = gameState.rewards.find((entry) => entry.id === item.rewardId);
    if (reward) gameState.player.equipped = { ...gameState.player.equipped, ...unequippedValue(reward.category) };
    return copy(gameState);
  },
};

export const mockAchievementService: AchievementService = { async list() { await wait(.8); return copy(gameState.achievements); } };

export const mockSkillService: SkillService = {
  async upgrade(id) {
    await wait(.7);
    const skill = gameState.skills.find((item) => item.id === id);
    if (!skill) throw new Error("Skill not found.");
    const requirement = skill.requires ? gameState.skills.find((item) => item.id === skill.requires?.skillId) : undefined;
    if (gameState.progression.level < skill.requiredLevel || (skill.requires && (!requirement || requirement.level < skill.requires.level))) throw new Error("This skill's requirements are not yet met.");
    if (skill.level >= skill.maxLevel) throw new Error("This skill is already mastered.");
    if (gameState.progression.skillPoints < 1) throw new Error("No skill points are available.");
    skill.level += 1;
    gameState.progression.skillPoints -= 1;
    return copy(gameState);
  },
};
