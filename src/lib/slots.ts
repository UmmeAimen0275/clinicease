// Builds the next 7 days of hourly slots for one doctor.
const PK_OFFSET = 5; // Pakistan is UTC+5 (no daylight saving)

export type SlotDay = {
  dayIso: string; // noon of that day, used only for the label
  slots: { iso: string; taken: boolean }[];
};

export function getSlots(
  workStart: number,
  workEnd: number,
  takenDates: Date[],
  days = 7
): SlotDay[] {
  const now = Date.now();
  // "Today" in Pakistan
  const pk = new Date(now + PK_OFFSET * 3600_000);
  const y = pk.getUTCFullYear();
  const m = pk.getUTCMonth();
  const d = pk.getUTCDate();

  const takenSet = new Set(takenDates.map((t) => t.getTime()));
  const result: SlotDay[] = [];

  for (let i = 0; i < days; i++) {
    const slots: SlotDay["slots"] = [];
    for (let h = workStart; h < workEnd; h++) {
      // h o'clock Pakistan time, converted to a real moment (UTC)
      const start = new Date(Date.UTC(y, m, d + i, h - PK_OFFSET));
      if (start.getTime() <= now) continue; // skip the past
      slots.push({ iso: start.toISOString(), taken: takenSet.has(start.getTime()) });
    }
    const dayIso = new Date(Date.UTC(y, m, d + i, 12 - PK_OFFSET)).toISOString();
    result.push({ dayIso, slots });
  }
  return result;
}