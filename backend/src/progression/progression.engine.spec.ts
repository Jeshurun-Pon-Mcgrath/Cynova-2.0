import { Attribute, Difficulty } from "../../generated/prisma/enums.js";
import {
  applyXp,
  calculateQuestReward,
  levelRequirement,
} from "./progression.engine.js";

describe("progression engine", () => {
  it("calculates rewards from server-owned inputs", () => {
    expect(
      calculateQuestReward(Attribute.INTELLECT, Difficulty.STANDARD, 30),
    ).toEqual({
      xp: 55,
      gold: 22,
      attributeGain: 2,
    });
  });

  it("crosses multiple levels and retains remaining XP", () => {
    const first = levelRequirement(1);
    const second = levelRequirement(2);
    expect(applyXp(1, 0, first + second + 17)).toEqual({
      previousLevel: 1,
      newLevel: 3,
      currentXp: 17,
      nextLevelXp: levelRequirement(3),
      crossed: [2, 3],
    });
  });

  it("rejects invalid duration and progression values", () => {
    expect(() =>
      calculateQuestReward(Attribute.STRENGTH, Difficulty.EASY, 0),
    ).toThrow(RangeError);
    expect(() => applyXp(0, 0, 10)).toThrow(RangeError);
  });
});
