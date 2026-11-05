const COMPACT = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

// "$16.2M" and "-$1.2K", for axes and labels too narrow for every peso. The tables keep the exact value.
// No space, or Recharts breaks a label across two lines at it.
export function formatCompactCOP(pesos: number): string {
  return `${pesos < 0 ? "-" : ""}$${COMPACT.format(Math.abs(pesos))}`;
}

// A share to read beside the backend's amounts, never a total. A sliver is not rounded away to nothing.
export function formatShare(part: number, whole: number): string {
  if (part === 0 || whole === 0) {
    return "0%";
  }
  const percent = Math.round((part / whole) * 100);
  if (percent === 0) {
    return "<1%";
  }
  return percent === 100 && part !== whole ? ">99%" : `${percent}%`;
}
