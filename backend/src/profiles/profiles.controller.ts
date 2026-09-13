import { Body, Controller, Get, Patch, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../common/types/authenticated-user.js";
import {
  OnboardingDto,
  UpdatePreferencesDto,
  UpdateProfileDto,
} from "./profile.dto.js";
import { ProfilesService } from "./profiles.service.js";

@ApiTags("profile")
@ApiBearerAuth()
@Controller()
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}
  @Get("profile") get(@CurrentUser() user: AuthenticatedUser) {
    return this.profiles.get(user.id);
  }
  @Patch("profile") update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profiles.update(user.id, dto);
  }
  @Put("profile/onboarding") onboarding(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: OnboardingDto,
  ) {
    return this.profiles.onboarding(user.id, dto);
  }
  @Get("preferences") preferences(@CurrentUser() user: AuthenticatedUser) {
    return this.profiles.preferences(user.id);
  }
  @Patch("preferences") updatePreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.profiles.updatePreferences(user.id, dto);
  }
}
