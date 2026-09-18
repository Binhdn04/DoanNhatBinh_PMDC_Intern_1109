/** Reporting weeks are ISO Monday-Sunday.  Intl keeps deployment timezone data authoritative. */
export function reportingPeriods(start: string, end: string, timezone: string) {
  const startDate = new Date(`${start}T00:00:00Z`);
  const endDate = new Date(`${end}T00:00:00Z`);
  const monday = new Date(startDate);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  const rows: { weekStart: string; weekEnd: string; dueAt: Date }[] = [];
  for (
    let week = new Date(monday);
    week <= endDate;
    week.setUTCDate(week.getUTCDate() + 7)
  ) {
    const dueLocal = new Date(week);
    dueLocal.setUTCDate(dueLocal.getUTCDate() + 7);
    rows.push({
      weekStart: iso(week),
      weekEnd: iso(addDays(week, 6)),
      dueAt: localMidnightUtc(iso(dueLocal), timezone),
    });
  }
  return rows;
}
export function iso(date: Date) {
  return date.toISOString().slice(0, 10);
}
export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
export function localMidnightUtc(date: string, timezone: string) {
  // Convert the requested local date midnight to UTC; repeat once for DST offsets.
  let guess = Date.parse(`${date}T00:00:00Z`);
  for (let i = 0; i < 2; i++) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date(guess));
    const get = (kind: string) =>
      parts.find((p) => p.type === kind)?.value ?? "00";
    const seen = Date.parse(
      `${get("year")}-${get("month")}-${get("day")}T${
        get("hour") === "24" ? "00" : get("hour")
      }:${get("minute")}:00Z`,
    );
    guess += Date.parse(`${date}T00:00:00Z`) - seen;
  }
  return new Date(guess);
}

export function deadlineInstant(date: string, timezone: string) {
  return localMidnightUtc(
    iso(addDays(new Date(`${date}T00:00:00Z`), 1)),
    timezone,
  );
}
