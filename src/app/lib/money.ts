import { formatMoney } from "../components/transport/shared/transportFormat";

export { formatMoney };

/** DATA-2: amounts are only ever added up within one currency. */
export function sumByCurrency(items: Array<{ amount: number; currency?: string | null }>): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const item of items) {
    const code = (item.currency || "USD").toUpperCase();
    totals[code] = (totals[code] ?? 0) + (Number.isFinite(item.amount) ? item.amount : 0);
  }
  return totals;
}

/** "$1,200.00 · LKR 90,000.00", or a zero in the default currency when there is nothing. */
export function formatTotals(totals: Record<string, number>): string {
  const entries = Object.entries(totals);
  if (entries.length === 0) return formatMoney(0, "USD");
  return entries.map(([code, amount]) => formatMoney(amount, code)).join(" · ");
}
