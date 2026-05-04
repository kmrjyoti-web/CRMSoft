import { formatDistanceToNow, format as fnsFormat } from "date-fns";

// ── Relative Time ───────────────────────────────────────
// relativeTime(date) → "2 hours ago"

export function relativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

// ── Format Date ─────────────────────────────────────────
// formatDate(date) → "28 Feb 2026"
// formatDate(date, "dd/MM/yyyy") → "28/02/2026"

export function formatDate(date: string | Date, fmt = "dd MMM yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return fnsFormat(d, fmt);
}
