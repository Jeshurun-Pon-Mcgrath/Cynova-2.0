import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../database/prisma.service.js";
import { GameService } from "../game/game.service.js";

const slotFor = (category: string) =>
  ({
    THEME: "theme",
    CORE_SKIN: "coreSkin",
    AVATAR_FRAME: "frame",
    TITLE: "title",
    STREAK_SHIELD: "shield",
  })[category] ?? category.toLowerCase();
@Injectable()
export class RewardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly game: GameService,
  ) {}
  list(userId: string) {
    return this.prisma.reward.findMany({
      where: { available: true },
      include: { inventory: { where: { userId } } },
      orderBy: { price: "asc" },
    });
  }
  async get(userId: string, id: string) {
    const reward = await this.prisma.reward.findFirst({
      where: { id, available: true },
      include: { inventory: { where: { userId } } },
    });
    if (!reward) throw new NotFoundException("Reward was not found.");
    return reward;
  }
  async purchase(userId: string, rewardId: string) {
    await this.prisma.$transaction(
      async (tx) => {
        const reward = await tx.reward.findFirst({
          where: { id: rewardId, available: true },
        });
        if (!reward) throw new NotFoundException("Reward was not found.");
        const existing = await tx.inventoryItem.findUnique({
          where: { userId_rewardId: { userId, rewardId } },
        });
        if (existing && !reward.stackable)
          throw new ConflictException("This reward is already owned.");
        const debit = await tx.playerProfile.updateMany({
          where: { userId, gold: { gte: reward.price } },
          data: { gold: { decrement: reward.price } },
        });
        if (debit.count !== 1)
          throw new ConflictException("You need more gold for this reward.");
        await tx.inventoryItem.create({
          data: { userId, rewardId, slot: slotFor(reward.category) },
        });
        await tx.activityEvent.create({
          data: {
            userId,
            kind: "REWARD",
            text: `Purchased ${reward.name}`,
            metadata: { rewardId },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return this.game.snapshot(userId);
  }
  async inventory(userId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { acquiredAt: "desc" },
    });
  }
  async equip(userId: string, id: string) {
    await this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findFirst({
        where: { id, userId },
        include: { reward: true },
      });
      if (!item) throw new NotFoundException("Inventory item was not found.");
      if (item.slot)
        await tx.inventoryItem.updateMany({
          where: { userId, slot: item.slot, equipped: true },
          data: { equipped: false },
        });
      await tx.inventoryItem.update({
        where: { id },
        data: { equipped: true },
      });
      await tx.activityEvent.create({
        data: {
          userId,
          kind: "CHARACTER",
          text: `Equipped ${item.reward.name}`,
        },
      });
    });
    return this.game.snapshot(userId);
  }
  async unequip(userId: string, id: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, userId },
    });
    if (!item) throw new NotFoundException("Inventory item was not found.");
    await this.prisma.inventoryItem.update({
      where: { id },
      data: { equipped: false },
    });
    return this.game.snapshot(userId);
  }
}
