import {
  format as fnsFormat,
  parse,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  addMonths,
  addDays,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  isBefore,
  isAfter,
  getDaysInMonth,
  getDay,
} from 'date-fns';
import type { DateRange, PresetItem } from './types';

// ── Indian Date Formatting ──────────────────────────────

export function formatDate(date: Date, fmt: string = 'DD/MM/YYYY'): string {
  const map: Record<string, string> = {
    'DD/MM/YYYY': 'dd/MM/yyyy',
    'DD-MMM-YYYY': 'dd-MMM-yyyy',
    'YYYY-MM-DD': 'yyyy-MM-dd',
    'DD/MM/YYYY HH:mm': 'dd/MM/yyyy HH:mm',
    'DD/MM/YYYY hh:mm a': 'dd/MM/yyyy hh:mm a',
  };
  return fnsFormat(date, map[fmt] || fmt);
}

export function formatRange(start: Date, end: Date): string {
  if (isSameDay(start, end)) {
    return fnsFormat(start, 'd MMM, yyyy');
  }
  if (isSameMonth(start, end)) {
    return `${fnsFormat(start, 'd')} – ${fnsFormat(end, 'd MMM, yyyy')}`;
  }
  return `${fnsFormat(start, 'd MMM, yyyy')} – ${fnsFormat(end, 'd MMM, yyyy')}`;
}

export function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  // Try ISO first
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d;
  // Try DD/MM/YYYY
  try {
    return parse(value, 'dd/MM/yyyy', new Date());
  } catch {
    return null;
  }
}

// ── Calendar Grid Generation ────────────────────────────

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getCalendarDays(month: Date): CalendarDay[] {
  const today = new Date();
  const firstDay = startOfMonth(month);
  const daysInMonth = getDaysInMonth(month);

  // Get the starting day of week (Monday-based: 0=Mon, 6=Sun)
  let startDow = getDay(firstDay) - 1;
  if (startDow < 0) startDow = 6; // Sunday wraps to end

  const days: CalendarDay[] = [];

  // Fill previous month days
  for (let i = startDow - 1; i >= 0; i--) {
    const date = addDays(firstDay, -(i + 1));
    days.push({ date, isCurrentMonth: false, isToday: isSameDay(date, today) });
  }

  // Current month days
  for (let i = 0; i < daysInMonth; i++) {
    const date = addDays(firstDay, i);
    days.push({ date, isCurrentMonth: true, isToday: isSameDay(date, today) });
  }

  // Fill remaining days to complete 6 rows (42 cells)
  const remaining = 42 - days.length;
  const lastDay = addDays(firstDay, daysInMonth - 1);
  for (let i = 1; i <= remaining; i++) {
    const date = addDays(lastDay, i);
    days.push({ date, isCurrentMonth: false, isToday: isSameDay(date, today) });
  }

  return days;
}

// ── Presets ──────────────────────────────────────────────

export function getPresets(financialYearStart: number = 4): PresetItem[] {
  return [
    {
      label: 'Today',
      getValue: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }),
    },
    {
      label: 'Yesterday',
      getValue: () => {
        const y = subDays(new Date(), 1);
        return { start: startOfDay(y), end: endOfDay(y) };
      },
    },
    {
      label: 'This Week',
      getValue: () => ({
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: endOfWeek(new Date(), { weekStartsOn: 1 }),
      }),
    },
    {
      label: 'Last Week',
      getValue: () => ({
        start: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
        end: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
      }),
    },
    {
      label: 'This Month',
      getValue: () => ({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
      }),
    },
    {
      label: 'Last Month',
      getValue: () => ({
        start: startOfMonth(subMonths(new Date(), 1)),
        end: endOfMonth(subMonths(new Date(), 1)),
      }),
    },
    {
      label: 'This Year',
      getValue: () => ({
        start: startOfYear(new Date()),
        end: endOfYear(new Date()),
      }),
    },
    {
      label: 'Last Year',
      getValue: () => ({
        start: startOfYear(subYears(new Date(), 1)),
        end: endOfYear(subYears(new Date(), 1)),
      }),
    },
    {
      label: 'This FY',
      getValue: () => {
        const now = new Date();
        const month = now.getMonth();
        const fyMonth = financialYearStart - 1; // 0-indexed
        const fyStart = month >= fyMonth
          ? new Date(now.getFullYear(), fyMonth, 1)
          : new Date(now.getFullYear() - 1, fyMonth, 1);
        const fyEnd = new Date(fyStart.getFullYear() + 1, fyMonth - 1 < 0 ? 11 : fyMonth - 1, 0);
        // Last day of month before FY start month next year
        return { start: fyStart, end: new Date(fyStart.getFullYear() + 1, fyMonth, 0) };
      },
    },
    {
      label: 'Last FY',
      getValue: () => {
        const now = new Date();
        const month = now.getMonth();
        const fyMonth = financialYearStart - 1;
        const fyStart = month >= fyMonth
          ? new Date(now.getFullYear() - 1, fyMonth, 1)
          : new Date(now.getFullYear() - 2, fyMonth, 1);
        return { start: fyStart, end: new Date(fyStart.getFullYear() + 1, fyMonth, 0) };
      },
    },
    {
      label: 'All Time',
      getValue: () => ({ start: new Date(2020, 0, 1), end: endOfDay(new Date()) }),
    },
  ];
}

// ── Helpers ──────────────────────────────────────────────

export function isDateInRange(date: Date, range: DateRange | null): boolean {
  if (!range) return false;
  return isWithinInterval(date, { start: startOfDay(range.start), end: endOfDay(range.end) });
}

export function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[],
  disabledDays?: number[],
): boolean {
  if (minDate && isBefore(date, startOfDay(minDate))) return true;
  if (maxDate && isAfter(date, endOfDay(maxDate))) return true;
  if (disabledDays?.includes(getDay(date))) return true;
  if (disabledDates?.some((d) => isSameDay(d, date))) return true;
  return false;
}

export { isSameDay, isSameMonth, addMonths, subMonths as subMonth, startOfMonth, fnsFormat as dateFnsFormat };
