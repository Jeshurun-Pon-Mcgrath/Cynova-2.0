import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../common/types/authenticated-user.js";
import { CreateQuestDto, QuestQueryDto, UpdateQuestDto } from "./quest.dto.js";
import { QuestsService } from "./quests.service.js";

@ApiTags("quests")
@ApiBearerAuth()
@Controller("quests")
export class QuestsController {
  constructor(private readonly quests: QuestsService) {}
  @Get() list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QuestQueryDto,
  ) {
    return this.quests.list(user.id, query);
  }
  @Post() create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateQuestDto,
  ) {
    return this.quests.create(user.id, dto);
  }
  @Get(":questId") get(
    @CurrentUser() user: AuthenticatedUser,
    @Param("questId", ParseUUIDPipe) id: string,
  ) {
    return this.quests.get(user.id, id);
  }
  @Patch(":questId") update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("questId", ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuestDto,
  ) {
    return this.quests.update(user.id, id, dto);
  }
  @HttpCode(204) @Delete(":questId") remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("questId", ParseUUIDPipe) id: string,
  ) {
    return this.quests.remove(user.id, id);
  }
  @Post(":questId/duplicate") duplicate(
    @CurrentUser() user: AuthenticatedUser,
    @Param("questId", ParseUUIDPipe) id: string,
  ) {
    return this.quests.duplicate(user.id, id);
  }
  @Post(":questId/complete") complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param("questId", ParseUUIDPipe) id: string,
    @Headers("idempotency-key") key: string,
  ) {
    return this.quests.complete(user.id, id, key);
  }
  @Get(":questId/completions") completions(
    @CurrentUser() user: AuthenticatedUser,
    @Param("questId", ParseUUIDPipe) id: string,
  ) {
    return this.quests.completions(user.id, id);
  }
}
