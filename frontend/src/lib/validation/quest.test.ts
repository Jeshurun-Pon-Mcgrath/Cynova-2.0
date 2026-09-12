import { describe, expect, it } from "vitest";
import { questSchema } from "./quest";

const valid = { title: "Create a reliable quest", description: "", category: "Intellect", difficulty: "Easy", dueAt: "2030-01-01T12:00", estimatedMinutes: 30, recurrence: "None", tags: "focus" };
describe("quest schema", () => {
  it("rejects empty and long titles", () => { expect(questSchema.safeParse({ ...valid, title: "" }).success).toBe(false); expect(questSchema.safeParse({ ...valid, title: "x".repeat(81) }).success).toBe(false); });
  it("rejects invalid and past dates", () => { expect(questSchema.safeParse({ ...valid, dueAt: "not-a-date" }).success).toBe(false); expect(questSchema.safeParse({ ...valid, dueAt: "2020-01-01T12:00" }).success).toBe(false); });
});
