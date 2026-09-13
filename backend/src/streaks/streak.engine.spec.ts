import { localDate, nextStreak } from "./streak.engine.js";

describe("streak engine", () => {
  it("uses the player's IANA timezone for the calendar date", () => {
    const instant = new Date("2026-09-13T20:00:00.000Z");
    expect(localDate(instant, "Asia/Kolkata")).toBe("2026-09-14");
    expect(localDate(instant, "America/New_York")).toBe("2026-09-13");
  });

  it("increments at most once per local date", () => {
    expect(nextStreak(4, "2026-09-12", "2026-09-13")).toEqual({
      days: 5,
      changed: true,
    });
    expect(nextStreak(5, "2026-09-13", "2026-09-13")).toEqual({
      days: 5,
      changed: false,
    });
  });

  it("resets after a missed local date", () => {
    expect(nextStreak(12, "2026-09-10", "2026-09-13")).toEqual({
      days: 1,
      changed: true,
    });
  });
});
