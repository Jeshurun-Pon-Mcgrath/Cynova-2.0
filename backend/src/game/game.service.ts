import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import { levelRequirement } from "../progression/progression.engine.js";

const label = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
const categoryLabel: Record<string, string> = {
  THEME: "Themes",
  CORE_SKIN: "Core Skins",
  AVATAR_FRAME: "Avatar Frames",
  TITLE: "Titles",
  STREAK_SHIELD: "Streak Shields",
};
const kindLabel: Record<string, string> = {
  QUEST: "quest",
  REWARD: "reward",
  LEVEL: "level",
  ACHIEVEMENT: "achievement",
  CHARACTER: "character",
  AUTH: "character",
};

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async snapshot(userId: string) {
    const [
      user,
      quests,
      rewards,
      inventory,
      achievementRows,
      activities,
      skillRows,
      daily,
    ] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, attributes: true, streak: true },
      }),
      this.prisma.quest.findMany({
        where: { userId, deletedAt: null },
        include: { completions: { orderBy: { completedAt: "desc" } } },
        orderBy: { dueAt: "asc" },
      }),
      this.prisma.reward.findMany({
        where: { available: true },
        orderBy: [{ category: "asc" }, { price: "asc" }],
      }),
      this.prisma.inventoryItem.findMany({
        where: { userId },
        include: { reward: true },
        orderBy: { acquiredAt: "desc" },
      }),
      this.prisma.achievement.findMany({
        include: { users: { where: { userId } } },
        orderBy: { sortOrder: "asc" },
      }),
      this.prisma.activityEvent.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      this.prisma.skillNode.findMany({
        include: { users: { where: { userId } }, prerequisite: true },
        orderBy: { sortOrder: "asc" },
      }),
      this.prisma.dailyActivity.findMany({
        where: {
          userId,
          localDate: { gte: new Date(Date.now() - 6 * 86_400_000) },
        },
        orderBy: { localDate: "asc" },
      }),
    ]);
    if (!user?.profile || !user.streak)
      throw new NotFoundException("Player profile was not found.");
    const attributeEntries = user.attributes.map(
      (item) => [label(item.attribute), item.value] as const,
    );
    const attributes: Record<string, number> =
      Object.fromEntries(attributeEntries);
    const owned = new Set(inventory.map((item) => item.rewardId));
    const equipped = {
      frame: "Unframed",
      title: "Adventurer",
      coreSkin: "Cyan Nova",
      theme: "Default Realm",
    };
    for (const item of inventory.filter((entry) => entry.equipped)) {
      if (item.reward.category === "AVATAR_FRAME")
        equipped.frame = item.reward.name;
      if (item.reward.category === "TITLE") equipped.title = item.reward.name;
      if (item.reward.category === "CORE_SKIN")
        equipped.coreSkin = item.reward.name;
      if (item.reward.category === "THEME") equipped.theme = item.reward.name;
    }
    const localToday = this.localDate(user.profile.timezone);
    const todayMs = localToday.getTime();
    const today = daily.find((item) => item.localDate.getTime() === todayMs);
    const weeklyConsistency = Math.round(
      (daily.filter((item) => item.completionCount > 0).length / 7) * 100,
    );
    return {
      user: { id: user.id, email: user.email, name: user.profile.displayName },
      demoAuthenticated: false,
      player: {
        userId: user.id,
        name: user.profile.displayName,
        archetype: label(user.profile.archetype),
        level: user.profile.level,
        focusAreas: user.profile.focusAreas.map(label),
        dailyQuestTarget: user.profile.dailyQuestTarget,
        attributes,
        equipped,
      },
      progression: {
        currentXp: user.profile.currentXp,
        nextLevelXp: levelRequirement(user.profile.level),
        gold: user.profile.gold,
        level: user.profile.level,
        skillPoints: user.profile.skillPoints,
        completedToday: today?.completionCount ?? 0,
        weeklyConsistency,
      },
      streak: {
        days: user.streak.currentDays,
        securedToday: user.streak.lastQualifyingDate?.getTime() === todayMs,
        best: user.streak.longestDays,
        lastSecuredDate: user.streak.lastQualifyingDate
          ?.toISOString()
          .slice(0, 10),
      },
      quests: quests.map((quest) => ({
        id: quest.id,
        title: quest.title,
        description: quest.description ?? undefined,
        category: label(quest.category),
        difficulty: label(quest.difficulty),
        xpReward: quest.xpReward,
        goldReward: quest.goldReward,
        dueAt: quest.dueAt.toISOString(),
        recurrence: label(quest.recurrence),
        estimatedMinutes: quest.estimatedMinutes,
        status: quest.status.toLowerCase(),
        tags: quest.tags,
        completionHistory: quest.completions.map((completion) => ({
          id: completion.id,
          questId: completion.questId,
          completedAt: completion.completedAt.toISOString(),
          xp: completion.xpAwarded,
          gold: completion.goldAwarded,
          attributeGain: completion.attributeGain,
        })),
      })),
      rewards: rewards.map((reward) => ({
        id: reward.id,
        name: reward.name,
        description: reward.description,
        category: categoryLabel[reward.category],
        rarity: label(reward.rarity),
        cost: reward.price,
        owned: owned.has(reward.id),
      })),
      inventory: inventory.map((item) => ({
        id: item.id,
        rewardId: item.rewardId,
        equipped: item.equipped,
        acquiredAt: item.acquiredAt.toISOString(),
      })),
      achievements: achievementRows.map((achievement) => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        progress: achievement.users[0]?.progress ?? 0,
        target: achievement.threshold,
        unlockedAt: achievement.users[0]?.unlockedAt?.toISOString(),
      })),
      activities: activities.map((activity) => ({
        id: activity.id,
        text: activity.text,
        at: activity.createdAt.toISOString(),
        kind: kindLabel[activity.kind],
      })),
      skills: skillRows.map((skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        level: skill.users[0]?.level ?? 0,
        maxLevel: skill.maxLevel,
        requiredLevel: skill.requiredPlayerLevel,
        requires: skill.prerequisiteId
          ? {
              skillId: skill.prerequisiteId,
              level: skill.prerequisiteLevel ?? 1,
            }
          : undefined,
      })),
    };
  }
  localDate(timezone: string, now = new Date()) {
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    return new Date(`${date}T00:00:00.000Z`);
  }
}
