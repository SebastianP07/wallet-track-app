// @vitest-environment node
import { describe, expect, it } from "vitest";

import { kpiGroups, mismatchTone } from "./kpi-tiles";
import { MESSAGES } from "@/shared/i18n/messages";

const kpis = {
  currentTotal: 14_000_000,
  toPay: 1_000_000,
  toReceive: 1_042_060,
  surplus: 14_042_060,
  incoming: 5_000_000,
  outgoing: 4_914_549,
  balance: 85_451,
};

describe("mismatchTone", () => {
  it("is neutral while the opening balance is unknown", () => {
    expect(mismatchTone(null)).toBe("neutral");
    expect(mismatchTone(undefined)).toBe("neutral");
  });

  it("squares at zero and asks to be seen otherwise, whatever the sign", () => {
    expect(mismatchTone(0)).toBe("squared");
    expect(mismatchTone(1)).toBe("mismatch");
    expect(mismatchTone(-1)).toBe("mismatch");
  });
});

describe("kpiGroups", () => {
  it("starts the month's balance with its opening and ends it with the check", () => {
    const [, month] = kpiGroups(
      { ...kpis, openingBalance: 13_956_609, expectedClose: 14_042_060, mismatch: 0 },
      MESSAGES.es,
    );

    expect(month.tiles.map((tile) => tile.label)).toEqual([
      "Inicio del mes",
      "Llega",
      "Se va",
      "Balance",
      "Cierre esperado",
      "Descuadre",
    ]);
    expect(month.tiles.at(-1)).toMatchObject({ value: 0, tone: "squared" });
  });

  it("shows no expected close or mismatch without an opening balance", () => {
    const [, month] = kpiGroups(
      { ...kpis, openingBalance: null, expectedClose: null, mismatch: null },
      MESSAGES.es,
    );

    expect(month.tiles.filter((tile) => tile.value === null).map((tile) => tile.id)).toEqual([
      "openingBalance",
      "expectedClose",
      "mismatch",
    ]);
    expect(month.tiles.at(-1)).toMatchObject({ tone: "neutral", hint: MESSAGES.es.dashboard.kpis.mismatchUnknownHint });
  });

  it("highlights a mismatch", () => {
    const [, month] = kpiGroups(
      { ...kpis, openingBalance: 24_165_723, expectedClose: 24_251_174, mismatch: -10_209_114 },
      MESSAGES.es,
    );

    expect(month.tiles.at(-1)).toMatchObject({ value: -10_209_114, tone: "mismatch" });
  });
});
