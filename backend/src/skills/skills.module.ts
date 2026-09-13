import { Module } from "@nestjs/common";
import { GameModule } from "../game/game.module.js";
import { SkillsController } from "./skills.controller.js";
import { SkillsService } from "./skills.service.js";
@Module({
  imports: [GameModule],
  controllers: [SkillsController],
  providers: [SkillsService],
})
export class SkillsModule {}
