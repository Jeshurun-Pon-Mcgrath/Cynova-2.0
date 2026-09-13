import {
  Archetype,
  Attribute,
  Difficulty,
  QuestStatus,
  Recurrence,
  RewardCategory,
  Rarity,
} from "../../../generated/prisma/enums.js";

export const enumLabel = <T extends string>(value: T) =>
  value
    .toLowerCase()
    .replace(/(^|_)(\w)/g, (_match, _separator, character: string) =>
      character.toUpperCase(),
    );
export const toAttribute = (value: string) =>
  Attribute[value.toUpperCase() as keyof typeof Attribute];
export const toArchetype = (value: string) =>
  Archetype[value.toUpperCase() as keyof typeof Archetype];
export const toDifficulty = (value: string) =>
  Difficulty[value.toUpperCase() as keyof typeof Difficulty];
export const toRecurrence = (value: string) =>
  Recurrence[value.toUpperCase() as keyof typeof Recurrence];
export const statusLabel = (value: QuestStatus) => value.toLowerCase();
export const categoryLabel = (value: RewardCategory) =>
  ({
    THEME: "Themes",
    CORE_SKIN: "Core Skins",
    AVATAR_FRAME: "Avatar Frames",
    TITLE: "Titles",
    STREAK_SHIELD: "Streak Shields",
  })[value];
export const rarityLabel = (value: Rarity) => enumLabel(value);
