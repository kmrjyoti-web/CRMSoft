// ── Indian Rupee Formatter ──────────────────────────────
// Uses Indian numbering system: last 3, then groups of 2
// formatINR(100000) → "₹1,00,000"
// formatINR(1234567.89) → "₹12,34,567.89"

export function formatINR(amount: number): string {
  const [intPart, decPart] = Math.abs(amount).toFixed(2).split(".");
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const formatted = rest
    ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
    : lastThree;
  const sign = amount < 0 ? "-" : "";
  return `${sign}₹${formatted}${decPart !== "00" ? "." + decPart : ""}`;
}
