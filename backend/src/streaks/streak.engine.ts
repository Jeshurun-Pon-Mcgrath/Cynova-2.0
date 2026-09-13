export function localDate(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function nextStreak(
  currentDays: number,
  lastDate: string | null,
  today: string,
) {
  if (!lastDate) return { days: 1, changed: true };
  if (lastDate === today) return { days: currentDays, changed: false };
  const day = 86_400_000;
  const difference = Math.round(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${lastDate}T00:00:00Z`)) /
      day,
  );
  return { days: difference === 1 ? currentDays + 1 : 1, changed: true };
}
