import { Module } from "@nestjs/common";
import { GameModule } from "../game/game.module.js";
import { QuestsController } from "./quests.controller.js";
import { QuestsService } from "./quests.service.js";
@Module({
  imports: [GameModule],
  controllers: [QuestsController],
  providers: [QuestsService],
})
export class QuestsModule {}
