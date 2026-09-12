import { describe, expect, it } from "vitest";
import { initialGameState } from "@/data/seed";
import { applyQuestCompletion, calculateQuestReward, levelRequirement } from "./game-engine";

describe("RPG engine", () => {
  it("uses an increasing non-linear level curve", () => {
    expect(levelRequirement(12)).toBeGreaterThan(levelRequirement(6));
    expect(levelRequirement(12) - levelRequirement(11)).toBeGreaterThan(levelRequirement(3) - levelRequirement(2));
  });

  it("safely carries XP through multiple levels", () => {
    const state = structuredClone(initialGameState);
    state.progression.level = 1; state.player.level = 1; state.progression.currentXp = levelRequirement(1) - 5; state.progression.nextLevelXp = levelRequirement(1); state.quests[0].xpReward = 5000;
    const result = applyQuestCompletion(state, "q1", "2026-09-12T10:00:00.000Z", "overflow");
    expect(result.levelsGained).toBeGreaterThan(2);
    expect(result.snapshot.progression.currentXp).toBeLessThan(result.snapshot.progression.nextLevelXp);
    expect(result.snapshot.player.level).toBe(result.snapshot.progression.level);
  });

  it("updates attribute, streak, achievements, completion count and Chronicle atomically", () => {
    const state = structuredClone(initialGameState);
    const before = state.player.attributes.Strength;
    const quest = state.quests.find((item) => item.id === "q3")!;
    const result = applyQuestCompletion(state, quest.id, "2026-09-12T10:00:00.000Z", "atomic");
    expect(result.snapshot.player.attributes.Strength).toBe(before + result.attributeGain);
    expect(result.snapshot.streak.securedToday).toBe(true);
    expect(result.snapshot.progression.completedToday).toBe(state.progression.completedToday + 1);
    expect(result.snapshot.quests.find((item) => item.id === quest.id)?.completionHistory).toHaveLength(1);
    expect(result.snapshot.achievements.find((item) => item.id === "a4")?.progress).toBe(19);
    expect(result.snapshot.activities[0].text).toContain("Completed 30-minute strength workout");
  });

  it("uses category, difficulty and duration in reward calculation", () => {
    const easy = calculateQuestReward({ category: "Vitality", difficulty: "Easy", estimatedMinutes: 10 });
    const epic = calculateQuestReward({ category: "Charisma", difficulty: "Epic", estimatedMinutes: 60 });
    expect(epic.xp).toBeGreaterThan(easy.xp);
    expect(epic.gold).toBeGreaterThan(easy.gold);
    expect(epic.attributeGain).toBe(5);
  });
});
