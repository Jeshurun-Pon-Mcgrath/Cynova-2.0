import { Module } from "@nestjs/common";
import { GameModule } from "../game/game.module.js";
import { RewardsController } from "./rewards.controller.js";
import { RewardsService } from "./rewards.service.js";
@Module({
  imports: [GameModule],
  controllers: [RewardsController],
  providers: [RewardsService],
})
export class RewardsModule {}
