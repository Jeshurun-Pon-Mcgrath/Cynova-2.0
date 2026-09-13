import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  QuestStatus,
  Recurrence,
} from "../../generated/prisma/client.js";
import { PrismaService } from "../database/prisma.service.js";
import { GameService } from "../game/game.service.js";
import {
  applyXp,
  calculateQuestReward,
} from "../progression/progression.engine.js";
import type {
  CreateQuestDto,
  QuestQueryDto,
  UpdateQuestDto,
} from "./quest.dto.js";

@Injectable()
export class QuestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly game: GameService,
  ) {}

  async list(userId: string, query: QuestQueryDto) {
    const where: Prisma.QuestWhereInput = { userId, deletedAt: null };
    if (query.search)
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.difficulty) where.difficulty = query.difficulty;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const [items, total] = await Promise.all([
      this.prisma.quest.findMany({
        where,
        include: { completions: true },
        orderBy: { [query.sort]: query.direction },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.quest.count({ where }),
    ]);
    return { items, page, pageSize, total };
  }
  async get(userId: string, id: string) {
    const quest = await this.prisma.quest.findFirst({
      where: { id, userId, deletedAt: null },
      include: { completions: true },
    });
    if (!quest) throw new NotFoundException("Quest was not found.");
    return quest;
  }
  async create(userId: string, dto: CreateQuestDto) {
    const reward = calculateQuestReward(
      dto.category,
      dto.difficulty,
      dto.estimatedMinutes,
    );
    return this.prisma.quest.create({
      data: {
        userId,
        ...dto,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        tags: dto.tags.map((tag) => tag.trim().toLowerCase()),
        dueAt: new Date(dto.dueAt),
        xpReward: reward.xp,
        goldReward: reward.gold,
      },
    });
  }
  async update(userId: string, id: string, dto: UpdateQuestDto) {
    const existing = await this.get(userId, id);
    const merged = {
      category: dto.category ?? existing.category,
      difficulty: dto.difficulty ?? existing.difficulty,
      estimatedMinutes: dto.estimatedMinutes ?? existing.estimatedMinutes,
    };
    const reward = calculateQuestReward(
      merged.category,
      merged.difficulty,
      merged.estimatedMinutes,
    );
    return this.prisma.quest.update({
      where: { id },
      data: {
        ...dto,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        tags: dto.tags?.map((tag) => tag.trim().toLowerCase()),
        xpReward: reward.xp,
        goldReward: reward.gold,
      },
    });
  }
  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.prisma.quest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  async duplicate(userId: string, id: string) {
    const source = await this.get(userId, id);
    const reward = calculateQuestReward(
      source.category,
      source.difficulty,
      source.estimatedMinutes,
    );
    return this.prisma.quest.create({
      data: {
        userId,
        title: `${source.title.slice(0, 94)} copy`,
        description: source.description,
        category: source.category,
        difficulty: source.difficulty,
        dueAt: new Date(source.dueAt.getTime() + 86_400_000),
        recurrence: source.recurrence,
        estimatedMinutes: source.estimatedMinutes,
        tags: source.tags,
        xpReward: reward.xp,
        goldReward: reward.gold,
      },
    });
  }
  completions(userId: string, questId: string) {
    return this.prisma.questCompletion.findMany({
      where: { userId, questId, quest: { userId } },
      orderBy: { completedAt: "desc" },
    });
  }

  async complete(userId: string, questId: string, idempotencyKey: string) {
    if (
      !idempotencyKey ||
      idempotencyKey.length < 8 ||
      idempotencyKey.length > 100
    )
      throw new BadRequestException(
        "A valid Idempotency-Key header is required.",
      );
    const prior = await this.prisma.questCompletion.findUnique({
      where: { userId_idempotencyKey: { userId, idempotencyKey } },
    });
    if (prior) return this.completionResponse(userId, prior);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const result = await this.prisma.$transaction(
          async (tx) => {
            const quest = await tx.quest.findFirst({
              where: { id: questId, userId, deletedAt: null },
            });
            if (!quest) throw new NotFoundException("Quest was not found.");
            if (
              quest.status === QuestStatus.COMPLETED &&
              quest.recurrence === Recurrence.NONE
            )
              throw new ConflictException("This quest is already complete.");
            const profile = await tx.playerProfile.findUniqueOrThrow({
              where: { userId },
            });
            const attribute = await tx.playerAttribute.findUniqueOrThrow({
              where: {
                userId_attribute: { userId, attribute: quest.category },
              },
            });
            const reward = calculateQuestReward(
              quest.category,
              quest.difficulty,
              quest.estimatedMinutes,
            );
            const progression = applyXp(
              profile.level,
              profile.currentXp,
              reward.xp,
            );
            const localDay = this.game.localDate(profile.timezone);
            const streak = await tx.streak.findUniqueOrThrow({
              where: { userId },
            });
            const previousDay = streak.lastQualifyingDate;
            const dayDiff = previousDay
              ? Math.round(
                  (localDay.getTime() - previousDay.getTime()) / 86_400_000,
                )
              : null;
            const currentDays =
              dayDiff === 0
                ? streak.currentDays
                : dayDiff === 1
                  ? streak.currentDays + 1
                  : 1;
            await tx.playerProfile.update({
              where: { userId },
              data: {
                level: progression.newLevel,
                currentXp: progression.currentXp,
                lifetimeXp: { increment: reward.xp },
                gold: { increment: reward.gold },
                skillPoints: { increment: progression.crossed.length },
              },
            });
            await tx.playerAttribute.update({
              where: {
                userId_attribute: { userId, attribute: quest.category },
              },
              data: {
                value: Math.min(100, attribute.value + reward.attributeGain),
                xp: { increment: reward.xp },
              },
            });
            await tx.streak.update({
              where: { userId },
              data: {
                currentDays,
                longestDays: Math.max(streak.longestDays, currentDays),
                lastQualifyingDate: localDay,
              },
            });
            await tx.dailyActivity.upsert({
              where: { userId_localDate: { userId, localDate: localDay } },
              create: {
                userId,
                localDate: localDay,
                completionCount: 1,
                xp: reward.xp,
                gold: reward.gold,
              },
              update: {
                completionCount: { increment: 1 },
                xp: { increment: reward.xp },
                gold: { increment: reward.gold },
              },
            });
            const nextDue =
              quest.recurrence === Recurrence.DAILY
                ? new Date(quest.dueAt.getTime() + 86_400_000)
                : quest.recurrence === Recurrence.WEEKLY
                  ? new Date(quest.dueAt.getTime() + 604_800_000)
                  : quest.dueAt;
            await tx.quest.update({
              where: { id: quest.id },
              data: {
                status:
                  quest.recurrence === Recurrence.NONE
                    ? QuestStatus.COMPLETED
                    : QuestStatus.ACTIVE,
                dueAt: nextDue,
              },
            });
            const completion = await tx.questCompletion.create({
              data: {
                questId,
                userId,
                xpAwarded: reward.xp,
                goldAwarded: reward.gold,
                attribute: quest.category,
                attributeGain: reward.attributeGain,
                resultingLevel: progression.newLevel,
                idempotencyKey,
                metadata: {
                  previousLevel: progression.previousLevel,
                  crossed: progression.crossed,
                  unlockedAchievements: [],
                },
              },
            });
            await tx.activityEvent.create({
              data: {
                userId,
                kind: "QUEST",
                text: `Completed ${quest.title} · +${reward.xp} XP`,
                metadata: { questId, completionId: completion.id },
              },
            });
            for (const level of progression.crossed)
              await tx.activityEvent.create({
                data: {
                  userId,
                  kind: "LEVEL",
                  text: `Reached level ${level}`,
                  metadata: { completionId: completion.id },
                },
              });
            const unlockedAchievementIds = await this.evaluateAchievements(
              tx,
              userId,
              currentDays,
            );
            const metadata = {
              previousLevel: progression.previousLevel,
              crossed: progression.crossed,
              unlockedAchievementIds,
            };
            await tx.questCompletion.update({
              where: { id: completion.id },
              data: { metadata },
            });
            return { ...completion, metadata };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
        return this.completionResponse(userId, result);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          const replay = await this.prisma.questCompletion.findUnique({
            where: { userId_idempotencyKey: { userId, idempotencyKey } },
          });
          if (replay) return this.completionResponse(userId, replay);
        }
        if (!(
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034" &&
          attempt < 2
        ))
          throw error;
      }
    }
    throw new ConflictException(
      "Quest completion conflicted. Retry with the same idempotency key.",
    );
  }

  private async completionResponse(
    userId: string,
    completion: {
      questId: string;
      xpAwarded: number;
      goldAwarded: number;
      attribute: string;
      attributeGain: number;
      resultingLevel: number;
      metadata: unknown;
    },
  ) {
    const metadata = (completion.metadata ?? {}) as {
      previousLevel?: number;
      crossed?: number[];
      unlockedAchievementIds?: string[];
    };
    const snapshot = await this.game.snapshot(userId);
    const unlocked = new Set(metadata.unlockedAchievementIds ?? []);
    return {
      questId: completion.questId,
      xp: completion.xpAwarded,
      gold: completion.goldAwarded,
      attribute: completion.attribute
        .toLowerCase()
        .replace(/^./, (letter) => letter.toUpperCase()),
      attributeGain: completion.attributeGain,
      previousLevel: metadata.previousLevel ?? completion.resultingLevel,
      newLevel: completion.resultingLevel,
      levelsGained: metadata.crossed?.length ?? 0,
      unlockedAchievements: snapshot.achievements.filter((achievement) =>
        unlocked.has(achievement.id),
      ),
      snapshot,
    };
  }
  private async evaluateAchievements(
    tx: Prisma.TransactionClient,
    userId: string,
    streakDays: number,
  ) {
    const unlocked: string[] = [];
    const questCount = await tx.questCompletion.count({ where: { userId } });
    const definitions = await tx.achievement.findMany();
    for (const achievement of definitions) {
      const progress =
        achievement.requirementType === "STREAK" ? streakDays : questCount;
      const existing = await tx.userAchievement.findUnique({
        where: {
          userId_achievementId: { userId, achievementId: achievement.id },
        },
      });
      const unlock = progress >= achievement.threshold && !existing?.unlockedAt;
      await tx.userAchievement.upsert({
        where: {
          userId_achievementId: { userId, achievementId: achievement.id },
        },
        create: {
          userId,
          achievementId: achievement.id,
          progress: Math.min(progress, achievement.threshold),
          unlockedAt: unlock ? new Date() : null,
        },
        update: {
          progress: Math.min(progress, achievement.threshold),
          unlockedAt: unlock ? new Date() : undefined,
        },
      });
      if (unlock) {
        unlocked.push(achievement.id);
        await tx.activityEvent.create({
          data: {
            userId,
            kind: "ACHIEVEMENT",
            text: `Unlocked ${achievement.name}`,
            metadata: { achievementId: achievement.id },
          },
        });
      }
    }
    return unlocked;
  }
}
