// Typed dates read DD/MM/YY, like every displayed date, while forms and the API keep YYYY-MM-DD.
// A two-digit year always means 20YY, so the field covers 2000-01-01 to 2099-12-31.

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TYPED_DATE = /^(\d{2})\/(\d{2})\/(\d{2})$/;
const LONG_TYPED_DATE = /^\s*(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\s*$/;
const LONG_ISO_DATE = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})\s*$/;

export const FIRST_TYPED_DATE = "2000-01-01";
export const LAST_TYPED_DATE = "2099-12-31";

function pad(value: number | string): string {
  return String(value).padStart(2, "0");
}

function daysIn(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isRealDay(year: number, month: number, day: number): boolean {
  return month >= 1 && month <= 12 && day >= 1 && day <= daysIn(year, month);
}

// True only for a YYYY-MM-DD that names a day the calendar has (no 2026-02-31).
export function isCalendarDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  return match ? isRealDay(Number(match[1]), Number(match[2]), Number(match[3])) : false;
}

// A full year typed or pasted (09/11/2026, 2026-11-09) becomes DD/MM/YY. A year outside 2000-2099 is
// dropped rather than cut to a wrong 20YY, so the field stays incomplete until a year is typed.
function fromLongDate(raw: string): string | null {
  const typed = LONG_TYPED_DATE.exec(raw);
  const iso = LONG_ISO_DATE.exec(raw);
  const [day, month, year] = typed ? [typed[1], typed[2], typed[3]] : iso ? [iso[3], iso[2], iso[1]] : [];
  if (!day || !month || !year) {
    return null;
  }
  const dayMonth = `${pad(day)}/${pad(month)}`;
  return year.startsWith("20") ? `${dayMonth}/${year.slice(2)}` : dayMonth;
}

// What the text field shows while typing: digits only, slashes added as soon as the next part starts,
// at most DD/MM/YY. A one-digit day or month closed with a typed separator ("9/") is padded to "09".
export function maskDateInput(raw: string): string {
  const long = fromLongDate(raw);
  if (long) {
    return long;
  }
  const segments = raw.split(/\D+/);
  const digits = segments
    .map((segment, index) => (segment.length === 1 && index < segments.length - 1 && index < 2 ? `0${segment}` : segment))
    .join("")
    .slice(0, 6);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6)].filter(Boolean).join("/");
}

// DD/MM/YY to YYYY-MM-DD, or null while the text is partial or names an impossible day (31/02/26, 00/11/26).
export function parseDateInput(text: string): string | null {
  const match = TYPED_DATE.exec(maskDateInput(text));
  if (!match) {
    return null;
  }
  const [day, month, year] = [Number(match[1]), Number(match[2]), 2000 + Number(match[3])];
  return isRealDay(year, month, day) ? `${year}-${pad(month)}-${pad(day)}` : null;
}

// YYYY-MM-DD to DD/MM/YY. Anything else (empty, a year outside 2000-2099 that YY cannot hold, or text the
// user is still typing) is shown as it is.
export function toDateInput(value: string): string {
  const match = ISO_DATE.exec(value);
  return match?.[1]?.startsWith("20") ? `${match[3]}/${match[2]}/${match[1].slice(2)}` : value;
}

// The form value for what the field shows: the ISO date once it reads as one, else the text itself, so
// the schema can tell an empty field from one holding something that is not a date.
export function dateFormValue(text: string): string {
  return parseDateInput(text) ?? text;
}
