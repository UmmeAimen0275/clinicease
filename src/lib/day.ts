// Start and end of "today" in Pakistan time (UTC+5), as real moments
export function todayRangePK() {
  const pk = new Date(Date.now() + 5 * 3600_000);
  const y = pk.getUTCFullYear(), m = pk.getUTCMonth(), d = pk.getUTCDate();
  return {
    start: new Date(Date.UTC(y, m, d, -5)),
    end: new Date(Date.UTC(y, m, d + 1, -5)),
  };
}