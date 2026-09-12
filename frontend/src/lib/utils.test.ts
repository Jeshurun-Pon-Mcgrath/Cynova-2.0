import { describe, expect, it } from "vitest";
import { calculateReward, xpPercent } from "./utils";
describe("progression utilities",()=>{it("clamps XP percentage",()=>{expect(xpPercent(840,1000)).toBe(84);expect(xpPercent(1200,1000)).toBe(100);expect(xpPercent(-1,1000)).toBe(0)});it("scales rewards by difficulty and duration",()=>{expect(calculateReward("Challenging",60).xp).toBeGreaterThan(calculateReward("Easy",15).xp);expect(calculateReward("Standard",30)).toEqual({xp:55,gold:22})})})
