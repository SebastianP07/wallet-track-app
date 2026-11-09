// Every date the app shows reads DD/MM/YY, and DD/MM/YY HH:mm (24-hour) when it carries a time, in both
// languages. public/offline.js cannot import this, so it repeats the same format by hand.

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

const BOGOTA_PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Bogota",
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// A calendar date as the API sends it (YYYY-MM-DD). It is read as written, so no time zone can move its day.
export function formatDate(date: string): string {
  const match = CALENDAR_DATE.exec(date);
  if (!match) {
    return date;
  }
  const [, year, month, day] = match;
  return `${day}/${month}/${year?.slice(2)}`;
}

// A moment in time, shown as the clock in Bogotá reads it.
export function formatDateTime(timestamp: string | number | Date): string {
  const parts = Object.fromEntries(
    BOGOTA_PARTS.formatToParts(new Date(timestamp)).map(({ type, value }) => [type, value]),
  );
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}
