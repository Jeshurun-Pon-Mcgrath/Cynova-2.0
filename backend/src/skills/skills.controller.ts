import { Controller, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../common/types/authenticated-user.js";
import { SkillsService } from "./skills.service.js";
@ApiTags("skills")
@ApiBearerAuth()
@Controller("skills")
export class SkillsController {
  constructor(private readonly skills: SkillsService) {}
  @Get() list(@CurrentUser() user: AuthenticatedUser) {
    return this.skills.list(user.id);
  }
  @Post(":skillId/upgrade") upgrade(
    @CurrentUser() user: AuthenticatedUser,
    @Param("skillId", ParseUUIDPipe) id: string,
  ) {
    return this.skills.upgrade(user.id, id);
  }
}
