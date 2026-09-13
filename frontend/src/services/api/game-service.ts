import type {
  AchievementService,
  AuthService,
  GameService,
  InventoryService,
  PlayerService,
  PreferenceService,
  QuestService,
  RewardService,
  SkillService,
} from "@/services/contracts";
import type {
  Achievement,
  CompletionReward,
  GameSnapshot,
  Quest,
  QuestInput,
  User,
  UserPreferences,
} from "@/types/domain";
import { apiRequest, setAccessToken } from "./client";

const apiEnum = (value: string) => value.replace(/\s+/g, "_").toUpperCase();
const label = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
type ApiQuest = Omit<
  Quest,
  "category" | "difficulty" | "recurrence" | "status" | "completionHistory"
> & {
  category: string;
  difficulty: string;
  recurrence: string;
  status: string;
  completions?: Array<{
    id: string;
    questId: string;
    completedAt: string;
    xpAwarded: number;
    goldAwarded: number;
    attributeGain: number;
  }>;
  completionHistory?: Quest["completionHistory"];
};
const mapQuest = (quest: ApiQuest): Quest => ({
  ...quest,
  category: label(quest.category) as Quest["category"],
  difficulty: label(quest.difficulty) as Quest["difficulty"],
  recurrence: label(quest.recurrence) as Quest["recurrence"],
  status: quest.status.toLowerCase() as Quest["status"],
  completionHistory:
    quest.completionHistory ??
    quest.completions?.map((completion) => ({
      id: completion.id,
      questId: completion.questId,
      completedAt: completion.completedAt,
      xp: completion.xpAwarded,
      gold: completion.goldAwarded,
      attributeGain: completion.attributeGain,
    })) ??
    [],
});
const questBody = (input: QuestInput) => ({
  ...input,
  category: apiEnum(input.category),
  difficulty: apiEnum(input.difficulty),
  recurrence: apiEnum(input.recurrence),
});

export const apiAuthService: AuthService = {
  async signIn(email, password) {
    const result = await apiRequest<{ user: User; accessToken: string }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
    );
    setAccessToken(result.accessToken);
    return result.user;
  },
  async register(name, email, password) {
    const result = await apiRequest<{ user: User; accessToken: string }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify({ name, email, password }) },
    );
    setAccessToken(result.accessToken);
    return result.user;
  },
  async enterDemo() {
    throw new Error(
      "The production API does not expose a public demo login. Use a real development account.",
    );
  },
  async forgotPassword(email) {
    await apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  async logout() {
    await apiRequest("/auth/logout", { method: "POST" });
    setAccessToken(null);
  },
};
export const apiGameService: GameService = {
  getSnapshot: () => apiRequest<GameSnapshot>("/dashboard"),
};
export const apiQuestService: QuestService = {
  async list() {
    const result = await apiRequest<{ items: ApiQuest[] }>(
      "/quests?pageSize=100",
    );
    return result.items.map(mapQuest);
  },
  async get(id) {
    try {
      return mapQuest(await apiRequest<ApiQuest>(`/quests/${id}`));
    } catch (error) {
      if (error instanceof Error && "status" in error && error.status === 404)
        return null;
      throw error;
    }
  },
  async create(input) {
    return mapQuest(
      await apiRequest<ApiQuest>("/quests", {
        method: "POST",
        body: JSON.stringify(questBody(input)),
      }),
    );
  },
  async update(id, input) {
    return mapQuest(
      await apiRequest<ApiQuest>(`/quests/${id}`, {
        method: "PATCH",
        body: JSON.stringify(questBody(input)),
      }),
    );
  },
  async duplicate(id) {
    return mapQuest(
      await apiRequest<ApiQuest>(`/quests/${id}/duplicate`, { method: "POST" }),
    );
  },
  remove: (id) => apiRequest<void>(`/quests/${id}`, { method: "DELETE" }),
  complete: (id) =>
    apiRequest<CompletionReward>(`/quests/${id}/complete`, {
      method: "POST",
      headers: { "idempotency-key": crypto.randomUUID() },
    }),
};
export const apiPlayerService: PlayerService = {
  completeOnboarding: (input) =>
    apiRequest<GameSnapshot>("/profile/onboarding", {
      method: "PUT",
      body: JSON.stringify({
        ...input,
        archetype: apiEnum(input.archetype),
        focusAreas: input.focusAreas.map(apiEnum),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    }),
  updateName: (name) =>
    apiRequest<GameSnapshot>("/profile", {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),
};
export const apiRewardService: RewardService = {
  async list() {
    const snapshot = await apiGameService.getSnapshot();
    return snapshot.rewards;
  },
  purchase: (id) =>
    apiRequest<GameSnapshot>(`/rewards/${id}/purchase`, { method: "POST" }),
};
export const apiInventoryService: InventoryService = {
  equip: (id) =>
    apiRequest<GameSnapshot>(`/inventory/${id}/equip`, { method: "POST" }),
  unequip: (id) =>
    apiRequest<GameSnapshot>(`/inventory/${id}/unequip`, { method: "POST" }),
};
export const apiAchievementService: AchievementService = {
  list: () => apiRequest<Achievement[]>("/achievements"),
};
export const apiSkillService: SkillService = {
  upgrade: (id) =>
    apiRequest<GameSnapshot>(`/skills/${id}/upgrade`, { method: "POST" }),
};
type ApiPreferences = Omit<UserPreferences, "graphics"> & { graphics: string };
const mapPreferences = (preferences: ApiPreferences): UserPreferences => ({
  reducedMotion: preferences.reducedMotion,
  highContrast: preferences.highContrast,
  sound: preferences.sound,
  graphics: preferences.graphics.toLowerCase() as UserPreferences["graphics"],
});
export const apiPreferenceService: PreferenceService = {
  async get() {
    return mapPreferences(await apiRequest<ApiPreferences>("/preferences"));
  },
  async update(preferences) {
    const body = preferences.graphics
      ? { ...preferences, graphics: apiEnum(preferences.graphics) }
      : preferences;
    return mapPreferences(
      await apiRequest<ApiPreferences>("/preferences", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    );
  },
};
