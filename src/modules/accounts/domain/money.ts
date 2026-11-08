import type { ValidationKey } from "@/shared/i18n/validation-key";

const GROUPED = /^[0-9]{1,3}(?:([.,\s])[0-9]{3})(?:\1[0-9]{3})*$/;
const PLAIN = /^[0-9]+$/;
const MINUS = /^[-−]/;

export type CopParseResult = { ok: true; value: number } | { ok: false; error: ValidationKey };

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+$)/g, ".");
}

// "$ 1.234.567" and "-$ 1.234.567": whole pesos with Colombian separators.
export function formatCOP(pesos: number): string {
  const sign = pesos < 0 ? "-" : "";
  return `${sign}$ ${groupThousands(Math.abs(pesos).toString())}`;
}

// The value an editor starts with: "-1.234.567".
export function formatCopInput(pesos: number): string {
  return `${pesos < 0 ? "-" : ""}${groupThousands(Math.abs(pesos).toString())}`;
}

// Reads whole pesos as a person types them. Separators are allowed only where thousands go, so
// "1.500" is 1500 while "1.5" and "1.234,56" are refused as decimals rather than guessed at.
export function parseCopInput(input: string): CopParseResult {
  const trimmed = input.trim();
  const negative = MINUS.test(trimmed);
  const unsigned = trimmed.replace(MINUS, "").replace(/^\$\s*/, "");
  if (!PLAIN.test(unsigned) && !GROUPED.test(unsigned)) {
    return { ok: false, error: "wholePesos" };
  }
  const magnitude = Number(unsigned.replace(/[.,\s]/g, ""));
  if (!Number.isSafeInteger(magnitude)) {
    return { ok: false, error: "amountTooLarge" };
  }
  return { ok: true, value: negative && magnitude !== 0 ? -magnitude : magnitude };
}

// For phone keypads with no minus key.
export function flipCopInputSign(input: string): string {
  const trimmed = input.trim();
  return MINUS.test(trimmed) ? trimmed.replace(MINUS, "") : `-${trimmed}`;
}
