import {
  mockAchievementService,
  mockAuthService,
  mockGameService,
  mockInventoryService,
  mockPlayerService,
  mockPreferenceService,
  mockQuestService,
  mockRewardService,
  mockSkillService,
} from "./mock/game-service";
import {
  apiAchievementService,
  apiAuthService,
  apiGameService,
  apiInventoryService,
  apiPlayerService,
  apiPreferenceService,
  apiQuestService,
  apiRewardService,
  apiSkillService,
} from "./api/game-service";

const useMock =
  process.env.NODE_ENV === "test" ||
  process.env.NEXT_PUBLIC_ENABLE_MOCK_API === "true";
export const authService = useMock ? mockAuthService : apiAuthService;
export const gameService = useMock ? mockGameService : apiGameService;
export const questService = useMock ? mockQuestService : apiQuestService;
export const playerService = useMock ? mockPlayerService : apiPlayerService;
export const rewardService = useMock ? mockRewardService : apiRewardService;
export const inventoryService = useMock
  ? mockInventoryService
  : apiInventoryService;
export const achievementService = useMock
  ? mockAchievementService
  : apiAchievementService;
export const skillService = useMock ? mockSkillService : apiSkillService;
export const preferenceService = useMock
  ? mockPreferenceService
  : apiPreferenceService;
