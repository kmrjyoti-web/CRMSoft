import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

export type DateRangePreset = "7d" | "30d" | "90d" | "thisMonth" | "lastMonth" | "custom";

export interface DateRange {
  dateFrom: string;
  dateTo: string;
}

export function getDateRange(preset: DateRangePreset): DateRange {
  const today = new Date();
  const fmt = (d: Date) => format(d, "yyyy-MM-dd");

  switch (preset) {
    case "7d":
      return { dateFrom: fmt(subDays(today, 7)), dateTo: fmt(today) };
    case "30d":
      return { dateFrom: fmt(subDays(today, 30)), dateTo: fmt(today) };
    case "90d":
      return { dateFrom: fmt(subDays(today, 90)), dateTo: fmt(today) };
    case "thisMonth":
      return { dateFrom: fmt(startOfMonth(today)), dateTo: fmt(endOfMonth(today)) };
    case "lastMonth": {
      const last = subMonths(today, 1);
      return { dateFrom: fmt(startOfMonth(last)), dateTo: fmt(endOfMonth(last)) };
    }
    case "custom":
    default:
      return { dateFrom: fmt(subDays(today, 30)), dateTo: fmt(today) };
  }
}
