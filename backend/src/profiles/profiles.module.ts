import { Module } from "@nestjs/common";
import { GameModule } from "../game/game.module.js";
import { ProfilesController } from "./profiles.controller.js";
import { ProfilesService } from "./profiles.service.js";
@Module({
  imports: [GameModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
