import { BadRequestException, Injectable } from "@nestjs/common";
import type {
  OnboardingDto,
  UpdatePreferencesDto,
  UpdateProfileDto,
} from "./profile.dto.js";
import { PrismaService } from "../database/prisma.service.js";
import { GameService } from "../game/game.service.js";

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly game: GameService,
  ) {}
  async get(userId: string) {
    return this.prisma.playerProfile.findUniqueOrThrow({ where: { userId } });
  }
  async update(userId: string, dto: UpdateProfileDto) {
    if (dto.timezone) this.assertTimezone(dto.timezone);
    await this.prisma.$transaction(async (tx) => {
      await tx.playerProfile.update({
        where: { userId },
        data: { displayName: dto.name?.trim(), timezone: dto.timezone },
      });
      if (dto.name)
        await tx.activityEvent.create({
          data: { userId, kind: "CHARACTER", text: "Updated player name" },
        });
    });
    return this.game.snapshot(userId);
  }
  async onboarding(userId: string, dto: OnboardingDto) {
    this.assertTimezone(dto.timezone);
    if (new Set(dto.focusAreas).size !== 3)
      throw new BadRequestException("Focus areas must be unique.");
    await this.prisma.$transaction(async (tx) => {
      await tx.playerProfile.update({
        where: { userId },
        data: {
          displayName: dto.name.trim(),
          archetype: dto.archetype,
          focusAreas: dto.focusAreas,
          dailyQuestTarget: dto.dailyQuestTarget,
          timezone: dto.timezone,
          onboardingDone: true,
        },
      });
      await tx.activityEvent.create({
        data: {
          userId,
          kind: "CHARACTER",
          text: `${dto.name.trim()} completed onboarding`,
        },
      });
    });
    return this.game.snapshot(userId);
  }
  preferences(userId: string) {
    return this.prisma.userPreference.findUniqueOrThrow({ where: { userId } });
  }
  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    await this.prisma.userPreference.update({ where: { userId }, data: dto });
    return this.preferences(userId);
  }
  private assertTimezone(timezone: string) {
    try {
      new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
    } catch {
      throw new BadRequestException("Timezone must be a valid IANA timezone.");
    }
  }
}
