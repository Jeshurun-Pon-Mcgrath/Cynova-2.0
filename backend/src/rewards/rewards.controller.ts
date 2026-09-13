import { Controller, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../common/types/authenticated-user.js";
import { RewardsService } from "./rewards.service.js";

@ApiTags("rewards and inventory")
@ApiBearerAuth()
@Controller()
export class RewardsController {
  constructor(private readonly rewards: RewardsService) {}
  @Get("rewards") list(@CurrentUser() user: AuthenticatedUser) {
    return this.rewards.list(user.id);
  }
  @Get("rewards/:rewardId") get(
    @CurrentUser() user: AuthenticatedUser,
    @Param("rewardId", ParseUUIDPipe) id: string,
  ) {
    return this.rewards.get(user.id, id);
  }
  @Post("rewards/:rewardId/purchase") purchase(
    @CurrentUser() user: AuthenticatedUser,
    @Param("rewardId", ParseUUIDPipe) id: string,
  ) {
    return this.rewards.purchase(user.id, id);
  }
  @Get("inventory") inventory(@CurrentUser() user: AuthenticatedUser) {
    return this.rewards.inventory(user.id);
  }
  @Post("inventory/:inventoryItemId/equip") equip(
    @CurrentUser() user: AuthenticatedUser,
    @Param("inventoryItemId", ParseUUIDPipe) id: string,
  ) {
    return this.rewards.equip(user.id, id);
  }
  @Post("inventory/:inventoryItemId/unequip") unequip(
    @CurrentUser() user: AuthenticatedUser,
    @Param("inventoryItemId", ParseUUIDPipe) id: string,
  ) {
    return this.rewards.unequip(user.id, id);
  }
}
