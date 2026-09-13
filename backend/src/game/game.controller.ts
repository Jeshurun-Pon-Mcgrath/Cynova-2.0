import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../common/types/authenticated-user.js";
import { PrismaService } from "../database/prisma.service.js";
import { GameService } from "./game.service.js";

class PageDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 25;
}
@ApiTags("dashboard")
@ApiBearerAuth()
@Controller()
export class GameController {
  constructor(
    private readonly game: GameService,
    private readonly prisma: PrismaService,
  ) {}
  @Get("dashboard") dashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.game.snapshot(user.id);
  }
  @Get("progression") async progression(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const snapshot = await this.game.snapshot(user.id);
    return snapshot.progression;
  }
  @Get("progression/attributes") async attributes(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const snapshot = await this.game.snapshot(user.id);
    return snapshot.player.attributes;
  }
  @Get("streaks/current") async streak(@CurrentUser() user: AuthenticatedUser) {
    const snapshot = await this.game.snapshot(user.id);
    return snapshot.streak;
  }
  @Get("achievements") async achievements(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const snapshot = await this.game.snapshot(user.id);
    return snapshot.achievements;
  }
  @Get("activities") activities(
    @CurrentUser() user: AuthenticatedUser,
    @Query() page: PageDto,
  ) {
    return this.prisma.activityEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip: (page.page - 1) * page.pageSize,
      take: page.pageSize,
    });
  }
  @Get("history/calendar") history(
    @CurrentUser() user: AuthenticatedUser,
    @Query() page: PageDto,
  ) {
    return this.prisma.dailyActivity.findMany({
      where: { userId: user.id },
      orderBy: { localDate: "desc" },
      skip: (page.page - 1) * page.pageSize,
      take: page.pageSize,
    });
  }
}
