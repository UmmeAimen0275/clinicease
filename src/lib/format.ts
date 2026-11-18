// Shared helpers. We show ALL times in Pakistan time, so the server
// (Vercel, UTC) and the browser always agree on what "10:00 AM" means.
const TZ = "Asia/Karachi";

export const formatDay = (d: Date | string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TZ,
  }).format(new Date(d));

export const formatTime = (d: Date | string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  }).format(new Date(d));

// "Dr. Ayesha Khan" -> "AK" (for the avatar circle)
export const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();