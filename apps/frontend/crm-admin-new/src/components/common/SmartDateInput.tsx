"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/ui/Icon";
import { useCompanyProfile } from "@/features/company-profile/hooks/useCompanyProfile";

// ══════════════════════════════════════════════════════════════
//  SmartDateInput — Shared date control with calendar +
//  smart number-to-date auto-parsing
// ══════════════════════════════════════════════════════════════
//
//  Typing shortcuts (assuming DD/MM/YYYY format, April 2026):
//    "5"      → 05/04/2026  (day only → current month/year)
//    "14"     → 14/04/2026  (2-digit day)
//    "54"     → 05/04/2026  (>31 → day=5, month=4)
//    "1405"   → 14/05/2026  (ddmm)
//    "140526" → 14/05/2026  (ddmmyy)
//    "14052026" → 14/05/2026 (ddmmyyyy)
//
//  For MM/DD/YYYY format the logic mirrors (md, mmdd, etc.)
//  For YYYY-MM-DD → yyyymmdd or mmdd etc.
//
// ══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export type CompanyDateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

export interface SmartDateInputProps {
  /** ISO date string (yyyy-mm-dd) or null */
  value?: string | null;
  /** Returns ISO date string (yyyy-mm-dd) or null */
  onChange?: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  required?: boolean;
  /** Minimum date (ISO string) */
  min?: string;
  /** Maximum date (ISO string) */
  max?: string;
  /** Override company date format */
  dateFormat?: CompanyDateFormat;
}

// ── Date utility helpers ─────────────────────────────────────

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toIso(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function isValidDate(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function formatDisplay(iso: string, fmt: CompanyDateFormat): string {
  if (!iso) return "";
  const [ys, ms, ds] = iso.split("-");
  const y = ys, m = ms, d = ds;
  switch (fmt) {
    case "DD/MM/YYYY":
      return `${d}/${m}/${y}`;
    case "MM/DD/YYYY":
      return `${m}/${d}/${y}`;
    case "YYYY-MM-DD":
      return `${y}-${m}-${d}`;
    default:
      return `${d}/${m}/${y}`;
  }
}

function parseIsoFromDisplay(text: string, fmt: CompanyDateFormat): string | null {
  // Try parsing formatted date with separators
  const sep = fmt === "YYYY-MM-DD" ? "-" : "/";
  const parts = text.split(sep).map((s) => parseInt(s, 10));
  if (parts.some(isNaN)) return null;

  let y: number, m: number, d: number;
  switch (fmt) {
    case "DD/MM/YYYY":
      [d, m, y] = parts;
      break;
    case "MM/DD/YYYY":
      [m, d, y] = parts;
      break;
    case "YYYY-MM-DD":
      [y, m, d] = parts;
      break;
    default:
      [d, m, y] = parts;
  }

  if (!isValidDate(y, m, d)) return null;
  return toIso(y, m, d);
}

// ── Smart number parsing ─────────────────────────────────────

/**
 * Parse a numeric string into a date.
 * The interpretation depends on the company date format.
 *
 * For DD/MM/YYYY:
 *   1 digit   → d, current month, current year
 *   2 digits  → dd (if ≤31) OR d+m (if >31)
 *   3 digits  → ambiguous: try dd+m first, then d+mm
 *   4 digits  → ddmm, current year
 *   6 digits  → ddmmyy
 *   8 digits  → ddmmyyyy
 *
 * For MM/DD/YYYY:
 *   1 digit   → d, current month, current year
 *   2 digits  → dd (if ≤31) OR m+d (if >31)
 *   3 digits  → try mm+d first, then m+dd
 *   4 digits  → mmdd, current year
 *   6 digits  → mmddyy
 *   8 digits  → mmddyyyy
 */
function parseSmartNumber(
  raw: string,
  fmt: CompanyDateFormat,
  refDate: Date,
): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  const curMonth = refDate.getMonth() + 1;
  const curYear = refDate.getFullYear();

  const tryBuild = (d: number, m: number, y: number): string | null => {
    if (isValidDate(y, m, d)) return toIso(y, m, d);
    return null;
  };

  const isDmFormat = fmt === "DD/MM/YYYY" || fmt === "YYYY-MM-DD";

  const len = digits.length;

  if (len === 1) {
    // Single digit → day, current month/year
    const d = parseInt(digits, 10);
    return tryBuild(d, curMonth, curYear);
  }

  if (len === 2) {
    const n = parseInt(digits, 10);
    // Try as day first
    if (n >= 1 && n <= 31) {
      const result = tryBuild(n, curMonth, curYear);
      if (result) return result;
    }
    // >31 or invalid day → split into two single digits
    const a = parseInt(digits[0], 10);
    const b = parseInt(digits[1], 10);
    if (isDmFormat) {
      // a=day, b=month
      return tryBuild(a, b, curYear);
    } else {
      // MM/DD: a=month, b=day
      return tryBuild(b, a, curYear);
    }
  }

  if (len === 3) {
    if (isDmFormat) {
      // Try dd+m
      const dd1 = parseInt(digits.substring(0, 2), 10);
      const m1 = parseInt(digits.substring(2), 10);
      const r1 = tryBuild(dd1, m1, curYear);
      if (r1) return r1;
      // Try d+mm
      const d2 = parseInt(digits.substring(0, 1), 10);
      const mm2 = parseInt(digits.substring(1), 10);
      return tryBuild(d2, mm2, curYear);
    } else {
      // MM/DD: try mm+d
      const mm1 = parseInt(digits.substring(0, 2), 10);
      const d1 = parseInt(digits.substring(2), 10);
      const r1 = tryBuild(d1, mm1, curYear);
      if (r1) return r1;
      // Try m+dd
      const m2 = parseInt(digits.substring(0, 1), 10);
      const dd2 = parseInt(digits.substring(1), 10);
      return tryBuild(dd2, m2, curYear);
    }
  }

  if (len === 4) {
    if (isDmFormat) {
      // ddmm
      const d = parseInt(digits.substring(0, 2), 10);
      const m = parseInt(digits.substring(2, 4), 10);
      return tryBuild(d, m, curYear);
    } else {
      // mmdd
      const m = parseInt(digits.substring(0, 2), 10);
      const d = parseInt(digits.substring(2, 4), 10);
      return tryBuild(d, m, curYear);
    }
  }

  if (len === 6) {
    if (isDmFormat) {
      const d = parseInt(digits.substring(0, 2), 10);
      const m = parseInt(digits.substring(2, 4), 10);
      const y = 2000 + parseInt(digits.substring(4, 6), 10);
      return tryBuild(d, m, y);
    } else {
      const m = parseInt(digits.substring(0, 2), 10);
      const d = parseInt(digits.substring(2, 4), 10);
      const y = 2000 + parseInt(digits.substring(4, 6), 10);
      return tryBuild(d, m, y);
    }
  }

  if (len === 8) {
    if (fmt === "YYYY-MM-DD") {
      const y = parseInt(digits.substring(0, 4), 10);
      const m = parseInt(digits.substring(4, 6), 10);
      const d = parseInt(digits.substring(6, 8), 10);
      return tryBuild(d, m, y);
    }
    if (isDmFormat) {
      const d = parseInt(digits.substring(0, 2), 10);
      const m = parseInt(digits.substring(2, 4), 10);
      const y = parseInt(digits.substring(4, 8), 10);
      return tryBuild(d, m, y);
    } else {
      const m = parseInt(digits.substring(0, 2), 10);
      const d = parseInt(digits.substring(2, 4), 10);
      const y = parseInt(digits.substring(4, 8), 10);
      return tryBuild(d, m, y);
    }
  }

  return null;
}

// ── Mini Calendar ────────────────────────────────────────────

interface MiniCalendarProps {
  value?: string | null;
  onChange: (iso: string) => void;
  min?: string;
  max?: string;
  startOfWeek?: number; // 0=Sun, 1=Mon
}

const WEEKDAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function MiniCalendar({ value, onChange, min, max, startOfWeek = 1 }: MiniCalendarProps) {
  const today = new Date();
  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());

  const minDate = min ? new Date(min + "T00:00:00") : null;
  const maxDate = max ? new Date(max + "T00:00:00") : null;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const offset = (firstDayOfWeek - startOfWeek + 7) % 7;

  // Ordered weekday headers
  const headers = Array.from({ length: 7 }, (_, i) => WEEKDAYS_SHORT[(startOfWeek + i) % 7]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Fill remaining row
  while (cells.length % 7 !== 0) cells.push(null);

  const isDisabled = (day: number) => {
    const dt = new Date(viewYear, viewMonth, day);
    if (minDate && dt < minDate) return true;
    if (maxDate && dt > maxDate) return true;
    return false;
  };

  const isToday = (day: number) =>
    viewYear === today.getFullYear() &&
    viewMonth === today.getMonth() &&
    day === today.getDate();

  const isSelected = (day: number) =>
    selectedDate &&
    viewYear === selectedDate.getFullYear() &&
    viewMonth === selectedDate.getMonth() &&
    day === selectedDate.getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="w-[260px] select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5">
        <button
          type="button"
          className="p-1 rounded hover:bg-[var(--color-bg-secondary)] transition-colors text-gray-500"
          onClick={prevMonth}
        >
          <Icon name="chevron-left" size={16} />
        </button>
        <span className="text-sm font-medium text-[var(--color-text)]">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          className="p-1 rounded hover:bg-[var(--color-bg-secondary)] transition-colors text-gray-500"
          onClick={nextMonth}
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-1">
        {headers.map((h) => (
          <div key={h} className="text-center text-[10px] font-semibold text-gray-400 py-1">
            {h}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 px-1 pb-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const disabled = isDisabled(day);
          const selected = isSelected(day);
          const todayMark = isToday(day);
          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              className={[
                "flex items-center justify-center h-8 w-full rounded-[var(--radius-md)] text-xs transition-colors",
                disabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "cursor-pointer hover:bg-[var(--color-bg-secondary)]",
                selected
                  ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]"
                  : "",
                todayMark && !selected
                  ? "font-bold text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                if (!disabled) {
                  onChange(toIso(viewYear, viewMonth + 1, day));
                }
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Today shortcut */}
      <div className="border-t border-gray-100 px-2 py-1.5 flex justify-center">
        <button
          type="button"
          className="text-xs text-[var(--color-primary)] hover:underline"
          onClick={() => {
            onChange(toIso(today.getFullYear(), today.getMonth() + 1, today.getDate()));
          }}
        >
          Today
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  SmartDateInput Component
// ══════════════════════════════════════════════════════════════

export const SmartDateInput = forwardRef<HTMLDivElement, SmartDateInputProps>(
  (props, ref) => {
    const {
      value,
      onChange,
      label,
      placeholder,
      error,
      errorMessage,
      disabled,
      required,
      min,
      max,
      dateFormat: dateFormatProp,
    } = props;

    // ── Company date format ──────────────────────────────
    const { data: companyProfile } = useCompanyProfile();
    const dateFormat: CompanyDateFormat = useMemo(() => {
      if (dateFormatProp) return dateFormatProp;
      const cp = companyProfile as any;
      const fmt = cp?.data?.dateFormat ?? cp?.dateFormat ?? "DD/MM/YYYY";
      return fmt as CompanyDateFormat;
    }, [companyProfile, dateFormatProp]);

    // ── State ────────────────────────────────────────────
    const [isEditing, setIsEditing] = useState(false);
    const [inputText, setInputText] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [previewIso, setPreviewIso] = useState<string | null>(null);
    const [dropdownPos, setDropdownPos] = useState<{
      top: number;
      left: number;
    } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);

    // ── Derived ──────────────────────────────────────────
    const hasValue = value != null && value !== "";
    const isFloating = isEditing || showCalendar || hasValue;

    const displayText = useMemo(() => {
      if (isEditing) return inputText;
      if (value) return formatDisplay(value, dateFormat);
      return "";
    }, [isEditing, inputText, value, dateFormat]);

    const formatHint = useMemo(() => {
      const sep = dateFormat === "YYYY-MM-DD" ? "-" : "/";
      return dateFormat.toLowerCase().split(/[-/]/).join(sep);
    }, [dateFormat]);

    // ── Smart parse on input change ──────────────────────

    const handleInputChange = useCallback(
      (text: string) => {
        setInputText(text);

        if (!text.trim()) {
          setPreviewIso(null);
          return;
        }

        const now = new Date();

        // First try: parse as formatted date with separators
        if (text.includes("/") || text.includes("-")) {
          const iso = parseIsoFromDisplay(text, dateFormat);
          setPreviewIso(iso);
          return;
        }

        // Second try: smart number parse
        const iso = parseSmartNumber(text, dateFormat, now);
        setPreviewIso(iso);
      },
      [dateFormat],
    );

    // ── Commit the current value ─────────────────────────

    const commitValue = useCallback(
      (iso: string | null) => {
        if (iso) {
          // Validate against min/max
          if (min && iso < min) return;
          if (max && iso > max) return;
          onChange?.(iso);
        }
        setIsEditing(false);
        setInputText("");
        setPreviewIso(null);
        setShowCalendar(false);
      },
      [onChange, min, max],
    );

    // ── Handlers ─────────────────────────────────────────

    const handleFocus = useCallback(() => {
      if (disabled) return;
      setIsEditing(true);
      setInputText("");
      setPreviewIso(null);
    }, [disabled]);

    const handleBlur = useCallback(() => {
      // Delay to allow calendar click to register
      setTimeout(() => {
        if (calendarRef.current?.contains(document.activeElement)) return;
        if (previewIso) {
          commitValue(previewIso);
        } else if (inputText.trim()) {
          // Invalid input — revert
          setIsEditing(false);
          setInputText("");
          setPreviewIso(null);
        } else {
          setIsEditing(false);
          setInputText("");
        }
      }, 150);
    }, [previewIso, inputText, commitValue]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (previewIso) {
            commitValue(previewIso);
          }
          inputRef.current?.blur();
        }
        if (e.key === "Escape") {
          setIsEditing(false);
          setInputText("");
          setPreviewIso(null);
          setShowCalendar(false);
          inputRef.current?.blur();
        }
      },
      [previewIso, commitValue],
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(null);
        setInputText("");
        setPreviewIso(null);
      },
      [onChange],
    );

    const handleCalendarToggle = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        setShowCalendar((prev) => !prev);
        setIsEditing(false);
      },
      [disabled],
    );

    const handleCalendarSelect = useCallback(
      (iso: string) => {
        commitValue(iso);
      },
      [commitValue],
    );

    // ── Effects ──────────────────────────────────────────

    // Calendar dropdown position
    useEffect(() => {
      if (!showCalendar || !containerRef.current) {
        setDropdownPos(null);
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    }, [showCalendar]);

    // Click outside → close calendar
    useEffect(() => {
      if (!showCalendar) return;
      const handler = (e: MouseEvent) => {
        const t = e.target as Node;
        if (containerRef.current?.contains(t)) return;
        if (calendarRef.current?.contains(t)) return;
        setShowCalendar(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [showCalendar]);

    // ── Styles ───────────────────────────────────────────

    const triggerCls = [
      "flex items-center gap-1.5 rounded-[var(--radius-md)] border h-8 px-3 transition-all cursor-text",
      "bg-[var(--color-bg)] text-[var(--color-text)]",
      disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "",
      error
        ? "border-[var(--color-danger)] focus-within:ring-2 focus-within:ring-[var(--color-danger)]/20"
        : isEditing || showCalendar
          ? "border-[var(--color-border-focus)] ring-2 ring-[var(--color-border-focus)]/20"
          : "border-[var(--color-border)] hover:border-gray-400",
    ]
      .filter(Boolean)
      .join(" ");

    const labelCls = label
      ? [
          "absolute bg-white px-1 pointer-events-none transition-all duration-200 truncate max-w-[80%]",
          isFloating
            ? [
                "z-[2] top-0 -translate-y-1/2 text-[11px] left-2",
                error
                  ? "text-red-500"
                  : isEditing || showCalendar
                    ? "text-[var(--color-primary)]"
                    : "text-gray-500",
              ].join(" ")
            : "z-[1] top-1/2 -translate-y-1/2 text-sm text-gray-400 left-9",
        ].join(" ")
      : "";

    // ── Render ───────────────────────────────────────────

    return (
      <div ref={ref}>
        <div ref={containerRef} className="relative">
          {/* Trigger */}
          <div
            className={triggerCls}
            onClick={() => !disabled && inputRef.current?.focus()}
          >
            {/* Calendar icon (clickable) */}
            <button
              type="button"
              className="flex-shrink-0 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
              onClick={handleCalendarToggle}
              tabIndex={-1}
              aria-label="Open calendar"
            >
              <Icon name="calendar" size={15} />
            </button>

            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent text-sm outline-none min-w-0 placeholder:text-[var(--color-text-tertiary)] tabular-nums"
              value={displayText}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={!label || isFloating ? placeholder ?? formatHint : ""}
              disabled={disabled}
              autoComplete="off"
              inputMode="numeric"
            />

            {/* Preview badge */}
            {isEditing && previewIso && (
              <span className="flex-shrink-0 text-[10px] font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                {formatDisplay(previewIso, dateFormat)}
              </span>
            )}

            {/* Invalid indicator */}
            {isEditing && inputText.trim() && !previewIso && (
              <span className="flex-shrink-0 text-[10px] text-red-400 whitespace-nowrap">
                invalid
              </span>
            )}

            {/* Clear */}
            {hasValue && !disabled && !isEditing && (
              <button
                type="button"
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={handleClear}
                tabIndex={-1}
                aria-label="Clear"
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>

          {/* Floating label */}
          {label && (
            <label className={labelCls}>
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}

          {/* Calendar popup (portal) */}
          {showCalendar &&
            !disabled &&
            dropdownPos &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                ref={calendarRef}
                className="fixed z-[9999] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg"
                style={{ top: dropdownPos.top, left: dropdownPos.left }}
              >
                <MiniCalendar
                  value={value}
                  onChange={handleCalendarSelect}
                  min={min}
                  max={max}
                />
              </div>,
              document.body,
            )}
        </div>

        {/* Error message */}
        {error && errorMessage && (
          <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  },
);
SmartDateInput.displayName = "SmartDateInput";
