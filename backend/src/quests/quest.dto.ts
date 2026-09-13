import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";
import {
  Attribute,
  Difficulty,
  QuestStatus,
  Recurrence,
} from "../../generated/prisma/enums.js";

export class CreateQuestDto {
  @ApiProperty() @IsString() @Length(2, 100) title: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;
  @ApiProperty({ enum: Attribute }) @IsEnum(Attribute) category: Attribute;
  @ApiProperty({ enum: Difficulty }) @IsEnum(Difficulty) difficulty: Difficulty;
  @ApiProperty() @IsDateString() dueAt: string;
  @ApiProperty({ enum: Recurrence }) @IsEnum(Recurrence) recurrence: Recurrence;
  @ApiProperty({ minimum: 5, maximum: 1440 })
  @IsInt()
  @Min(5)
  @Max(1440)
  estimatedMinutes: number;
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags: string[];
}
export class UpdateQuestDto extends PartialType(CreateQuestDto) {}
export class CompleteQuestDto {
  @ApiProperty() @IsString() @Length(8, 100) idempotencyKey: string;
}
export class QuestQueryDto {
  @IsOptional() @IsString() @Length(1, 100) search?: string;
  @IsOptional() @IsEnum(QuestStatus) status?: QuestStatus;
  @IsOptional() @IsEnum(Attribute) category?: Attribute;
  @IsOptional() @IsEnum(Difficulty) difficulty?: Difficulty;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 20;
  @IsOptional() @IsIn(["dueAt", "createdAt", "title"]) sort = "dueAt";
  @IsOptional() @IsIn(["asc", "desc"]) direction: "asc" | "desc" = "asc";
}
