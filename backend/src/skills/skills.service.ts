import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../database/prisma.service.js";
import { GameService } from "../game/game.service.js";

@Injectable()
export class SkillsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly game: GameService,
  ) {}
  async list(userId: string) {
    const snapshot = await this.game.snapshot(userId);
    return snapshot.skills;
  }
  async upgrade(userId: string, skillId: string) {
    await this.prisma.$transaction(
      async (tx) => {
        const [skill, profile, current] = await Promise.all([
          tx.skillNode.findUnique({ where: { id: skillId } }),
          tx.playerProfile.findUniqueOrThrow({ where: { userId } }),
          tx.userSkill.findUnique({
            where: { userId_skillId: { userId, skillId } },
          }),
        ]);
        if (!skill) throw new NotFoundException("Skill was not found.");
        const level = current?.level ?? 0;
        if (profile.level < skill.requiredPlayerLevel)
          throw new ConflictException("Player level requirement is not met.");
        if (level >= skill.maxLevel)
          throw new ConflictException("This skill is already mastered.");
        if (skill.prerequisiteId) {
          const prerequisite = await tx.userSkill.findUnique({
            where: {
              userId_skillId: { userId, skillId: skill.prerequisiteId },
            },
          });
          if ((prerequisite?.level ?? 0) < (skill.prerequisiteLevel ?? 1))
            throw new ConflictException("Skill prerequisite is not met.");
        }
        const debit = await tx.playerProfile.updateMany({
          where: { userId, skillPoints: { gte: skill.costPerLevel } },
          data: { skillPoints: { decrement: skill.costPerLevel } },
        });
        if (debit.count !== 1)
          throw new ConflictException("Not enough skill points.");
        await tx.userSkill.upsert({
          where: { userId_skillId: { userId, skillId } },
          create: { userId, skillId, level: 1, unlockedAt: new Date() },
          update: {
            level: { increment: 1 },
            unlockedAt: current?.unlockedAt ?? new Date(),
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return this.game.snapshot(userId);
  }
}
