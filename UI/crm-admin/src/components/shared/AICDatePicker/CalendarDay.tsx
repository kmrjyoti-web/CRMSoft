'use client';

import { isSameDay } from './date-utils';
import type { CalendarHighlight, DateRange } from './types';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  highlights: CalendarHighlight[];
  onClick: (date: Date) => void;
  onFocus: (date: Date) => void;
}

export function CalendarDayCell({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  isRangeStart,
  isRangeEnd,
  isInRange,
  isDisabled,
  isFocused,
  highlights,
  onClick,
  onFocus,
}: CalendarDayProps) {
  const dayHighlights = highlights.filter((h) => isSameDay(new Date(h.date), date));
  const isHoliday = dayHighlights.some((h) => h.isHoliday);

  const baseClass = 'relative w-10 h-10 flex flex-col items-center justify-center text-sm transition-all rounded-full';

  const stateClasses = [
    !isCurrentMonth && 'text-gray-300',
    isCurrentMonth && !isSelected && !isDisabled && 'text-gray-700',
    isToday && !isSelected && 'font-bold ring-1 ring-blue-500',
    isSelected && 'bg-blue-600 text-white font-semibold',
    isRangeStart && 'bg-blue-600 text-white rounded-r-none',
    isRangeEnd && 'bg-blue-600 text-white rounded-l-none',
    isInRange && !isSelected && !isRangeStart && !isRangeEnd && 'bg-blue-50 rounded-none',
    isHoliday && !isSelected && 'text-red-500',
    isDisabled && 'opacity-30 cursor-not-allowed',
    !isSelected && !isDisabled && 'hover:bg-gray-100 cursor-pointer',
    isFocused && 'ring-2 ring-blue-400 ring-offset-1',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      tabIndex={isFocused ? 0 : -1}
      onClick={() => !isDisabled && onClick(date)}
      onFocus={() => onFocus(date)}
      disabled={isDisabled}
      className={`${baseClass} ${stateClasses}`}
      title={dayHighlights.length > 0 ? dayHighlights.map((h) => h.title).join(', ') : undefined}
      aria-label={`${date.getDate()} ${date.toLocaleString('en', { month: 'long' })} ${date.getFullYear()}${
        dayHighlights.length > 0 ? `, ${dayHighlights.map((h) => h.title).join(', ')}` : ''
      }`}
    >
      <span>{date.getDate()}</span>

      {/* Holiday/Event dots */}
      {dayHighlights.length > 0 && (
        <div className="flex gap-0.5 absolute -bottom-0.5">
          {dayHighlights.slice(0, 3).map((h, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: h.color }}
            />
          ))}
        </div>
      )}
    </button>
  );
}
