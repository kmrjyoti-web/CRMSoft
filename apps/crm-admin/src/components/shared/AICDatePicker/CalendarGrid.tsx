'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { addMonths, isSameDay, isSameMonth, startOfMonth } from './date-utils';
import { getCalendarDays, isDateInRange, isDateDisabled } from './date-utils';
import { CalendarDayCell } from './CalendarDay';
import { Icon } from '@/components/ui';
import type { CalendarHighlight, DateRange } from './types';
import { format, addDays, subDays } from 'date-fns';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

interface CalendarGridProps {
  /** The currently viewed month */
  viewMonth: Date;
  onViewMonthChange: (month: Date) => void;
  /** Single selected date */
  selectedDate?: Date | null;
  /** Range selection */
  selectedRange?: DateRange | null;
  /** Hovered date (for range preview) */
  hoverDate?: Date | null;
  onHoverDate?: (date: Date | null) => void;
  /** Callbacks */
  onDateClick: (date: Date) => void;
  /** Highlights */
  highlights: CalendarHighlight[];
  /** Validation */
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDays?: number[];
  /** Show dual calendar (desktop) */
  dual?: boolean;
}

export function CalendarGrid({
  viewMonth,
  onViewMonthChange,
  selectedDate,
  selectedRange,
  hoverDate,
  onHoverDate,
  onDateClick,
  highlights,
  minDate,
  maxDate,
  disabledDates,
  disabledDays,
  dual = false,
}: CalendarGridProps) {
  const [focusedDate, setFocusedDate] = useState<Date>(selectedDate ?? new Date());
  const gridRef = useRef<HTMLDivElement>(null);

  const months = dual ? [viewMonth, addMonths(viewMonth, 1)] : [viewMonth];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let next: Date | null = null;
      switch (e.key) {
        case 'ArrowLeft':
          next = subDays(focusedDate, 1);
          break;
        case 'ArrowRight':
          next = addDays(focusedDate, 1);
          break;
        case 'ArrowUp':
          next = subDays(focusedDate, 7);
          break;
        case 'ArrowDown':
          next = addDays(focusedDate, 7);
          break;
        case 'PageUp':
          next = e.shiftKey
            ? new Date(focusedDate.getFullYear() - 1, focusedDate.getMonth(), focusedDate.getDate())
            : addMonths(focusedDate, -1);
          break;
        case 'PageDown':
          next = e.shiftKey
            ? new Date(focusedDate.getFullYear() + 1, focusedDate.getMonth(), focusedDate.getDate())
            : addMonths(focusedDate, 1);
          break;
        case 'Home':
          next = startOfMonth(focusedDate);
          break;
        case 'End':
          next = new Date(focusedDate.getFullYear(), focusedDate.getMonth() + 1, 0);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!isDateDisabled(focusedDate, minDate, maxDate, disabledDates, disabledDays)) {
            onDateClick(focusedDate);
          }
          return;
        case 't':
          next = new Date();
          break;
        default:
          return;
      }
      if (next) {
        e.preventDefault();
        setFocusedDate(next);
        // Auto-navigate months if needed
        if (!isSameMonth(next, viewMonth) && (!dual || !isSameMonth(next, addMonths(viewMonth, 1)))) {
          onViewMonthChange(startOfMonth(next));
        }
      }
    },
    [focusedDate, viewMonth, dual, minDate, maxDate, disabledDates, disabledDays, onDateClick, onViewMonthChange],
  );

  return (
    <div className="flex gap-4" onKeyDown={handleKeyDown} ref={gridRef}>
      {months.map((month, idx) => (
        <div key={format(month, 'yyyy-MM')} className="flex-1 min-w-[280px]">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            {idx === 0 ? (
              <button
                type="button"
                onClick={() => onViewMonthChange(addMonths(viewMonth, -1))}
                className="p-1 rounded hover:bg-gray-100 transition"
                aria-label="Previous month"
              >
                <Icon name="chevron-left" size={18} />
              </button>
            ) : (
              <div className="w-7" />
            )}
            <span className="text-sm font-semibold text-gray-800">
              {format(month, 'MMMM yyyy')}
            </span>
            {idx === months.length - 1 ? (
              <button
                type="button"
                onClick={() => onViewMonthChange(addMonths(viewMonth, 1))}
                className="p-1 rounded hover:bg-gray-100 transition"
                aria-label="Next month"
              >
                <Icon name="chevron-right" size={18} />
              </button>
            ) : (
              <div className="w-7" />
            )}
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div
            className="grid grid-cols-7 gap-y-0.5"
            role="grid"
            aria-label={format(month, 'MMMM yyyy')}
            onMouseLeave={() => onHoverDate?.(null)}
          >
            {getCalendarDays(month).map((day, i) => {
              const disabled = isDateDisabled(day.date, minDate, maxDate, disabledDates, disabledDays);
              const selected = selectedDate ? isSameDay(day.date, selectedDate) : false;
              const rangeStart = selectedRange ? isSameDay(day.date, selectedRange.start) : false;
              const rangeEnd = selectedRange ? isSameDay(day.date, selectedRange.end) : false;

              // For hover preview during range selection
              let inRange = selectedRange ? isDateInRange(day.date, selectedRange) : false;
              if (!inRange && hoverDate && selectedDate && !selectedRange) {
                const previewStart = selectedDate < hoverDate ? selectedDate : hoverDate;
                const previewEnd = selectedDate < hoverDate ? hoverDate : selectedDate;
                inRange = isDateInRange(day.date, { start: previewStart, end: previewEnd });
              }

              return (
                <div
                  key={i}
                  onMouseEnter={() => onHoverDate?.(day.date)}
                  className="flex justify-center"
                >
                  <CalendarDayCell
                    date={day.date}
                    isCurrentMonth={day.isCurrentMonth}
                    isToday={day.isToday}
                    isSelected={selected}
                    isRangeStart={rangeStart}
                    isRangeEnd={rangeEnd}
                    isInRange={inRange}
                    isDisabled={disabled}
                    isFocused={isSameDay(day.date, focusedDate)}
                    highlights={highlights}
                    onClick={onDateClick}
                    onFocus={setFocusedDate}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
