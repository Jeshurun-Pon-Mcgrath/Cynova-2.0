import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { initialGameState } from "@/data/seed";
import { getMockSnapshot, mockInventoryService, mockPlayerService, mockQuestService, mockRewardService, resetMockState, setMockLatency, simulateNextCompletionFailure } from "./game-service";

const questInput = { title: "Write integration tests", description: "Protect the realm from regressions.", category: "Discipline" as const, difficulty: "Standard" as const, dueAt: "2030-01-01T12:00:00.000Z", recurrence: "None" as const, estimatedMinutes: 40, tags: ["testing"] };

describe("shared mock game state", () => {
  beforeEach(() => { resetMockState(); setMockLatency(0); });
  afterAll(() => setMockLatency(300));

  it("creates, updates, duplicates and deletes real quest records", async () => {
    const created = await mockQuestService.create(questInput);
    expect((await mockQuestService.get(created.id))?.title).toBe(questInput.title);
    const updated = await mockQuestService.update(created.id, { ...questInput, title: "Write resilient integration tests" });
    expect(updated.title).toContain("resilient");
    const duplicate = await mockQuestService.duplicate(created.id);
    expect(duplicate.id).not.toBe(created.id);
    expect((await mockQuestService.list()).some((item) => item.id === duplicate.id)).toBe(true);
    await mockQuestService.remove(created.id);
    expect(await mockQuestService.get(created.id)).toBeNull();
  });

  it("rolls back the complete state on a simulated failure", async () => {
    const before = getMockSnapshot();
    simulateNextCompletionFailure();
    await expect(mockQuestService.complete("q1")).rejects.toThrow("rolled back");
    expect(getMockSnapshot()).toEqual(before);
  });

  it("rejects insufficient-gold and already-owned purchases", async () => {
    await expect(mockRewardService.purchase("r4")).rejects.toThrow("more gold");
    await expect(mockRewardService.purchase("r3")).rejects.toThrow("already");
  });

  it("purchases, equips, unequips, and synchronizes character equipment", async () => {
    const purchased = await mockRewardService.purchase("r1");
    const item = purchased.inventory.find((entry) => entry.rewardId === "r1")!;
    const equipped = await mockInventoryService.equip(item.id);
    expect(equipped.inventory.find((entry) => entry.id === item.id)?.equipped).toBe(true);
    expect(equipped.player.equipped.theme).toBe("Moonlit Realm");
    const unequipped = await mockInventoryService.unequip(item.id);
    expect(unequipped.inventory.find((entry) => entry.id === item.id)?.equipped).toBe(false);
    expect(unequipped.player.equipped.theme).toBe("Default Realm");
  });

  it("synchronizes onboarding identity and preferences with the player", async () => {
    const snapshot = await mockPlayerService.completeOnboarding({ name: "Lyra", archetype: "Pathfinder", focusAreas: ["Vitality", "Creativity", "Discipline"], dailyQuestTarget: 4 });
    expect(snapshot.player).toMatchObject({ name: "Lyra", archetype: "Pathfinder", dailyQuestTarget: 4 });
    expect(snapshot.player.focusAreas).toEqual(["Vitality", "Creativity", "Discipline"]);
    expect(snapshot.user?.name).toBe("Lyra");
  });

  it("completes against the same central snapshot", async () => {
    const result = await mockQuestService.complete("q1");
    expect(result.snapshot.progression.gold).toBe(initialGameState.progression.gold + result.gold);
    expect(result.snapshot.quests.find((item) => item.id === "q1")?.status).toBe("completed");
  });
});
