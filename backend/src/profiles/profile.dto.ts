import { ApiProperty, PartialType } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";
import {
  Archetype,
  Attribute,
  GraphicsQuality,
} from "../../generated/prisma/enums.js";

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(2, 40)
  name?: string;
  @ApiProperty({ required: false, example: "Asia/Kolkata" })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  timezone?: string;
}
export class OnboardingDto {
  @ApiProperty() @IsString() @Length(2, 40) name: string;
  @ApiProperty({ enum: Archetype }) @IsEnum(Archetype) archetype: Archetype;
  @ApiProperty({ enum: Attribute, isArray: true })
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsEnum(Attribute, { each: true })
  focusAreas: Attribute[];
  @ApiProperty({ minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  dailyQuestTarget: number;
  @ApiProperty({ example: "Asia/Kolkata" })
  @IsString()
  @Length(1, 100)
  timezone: string;
}
export class PreferencesDto {
  @ApiProperty() @IsBoolean() reducedMotion: boolean;
  @ApiProperty() @IsBoolean() highContrast: boolean;
  @ApiProperty() @IsBoolean() sound: boolean;
  @ApiProperty({ enum: GraphicsQuality })
  @IsEnum(GraphicsQuality)
  graphics: GraphicsQuality;
}
export class UpdatePreferencesDto extends PartialType(PreferencesDto) {}
