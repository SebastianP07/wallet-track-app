const YEAR_MONTH = /^[2-9][0-9]{3}-(0[1-9]|1[0-2])$/;
const FIRST_MONTH = "2000-01";
const LAST_MONTH = "9999-12";
const TIME_ZONE = "America/Bogota";

function format(year: number, month: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

function parts(yearMonth: string): [year: number, month: number] {
  const [year, month] = yearMonth.split("-").map(Number);
  return [year ?? 0, month ?? 1];
}

export function currentYearMonth(now: Date): string {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => formatted.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}`;
}

export function parseYearMonth(value: unknown): string | null {
  return typeof value === "string" && YEAR_MONTH.test(value) ? value : null;
}

export function shiftYearMonth(yearMonth: string, months: number): string {
  const [year, month] = parts(yearMonth);
  const index = year * 12 + (month - 1) + months;
  return format(Math.floor(index / 12), (index % 12) + 1);
}

export function hasPreviousMonth(yearMonth: string): boolean {
  return yearMonth > FIRST_MONTH;
}

export function hasNextMonth(yearMonth: string): boolean {
  return yearMonth < LAST_MONTH;
}

export function monthName(yearMonth: string): string {
  const [year, month] = parts(yearMonth);
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

export function yearOf(yearMonth: string): string {
  return yearMonth.slice(0, 4);
}
