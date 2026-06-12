'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { startOfMonth, addMonths, isSameDay, formatDate, formatRange, parseDate } from './date-utils';
import { CalendarGrid } from './CalendarGrid';
import { PresetSidebar } from './PresetSidebar';
import { TimePicker } from './TimePicker';
import { useCalendarHighlights } from './useCalendarHighlights';
import { useMediaQuery } from './useMediaQuery';
import { Icon } from '@/components/ui';
import { format } from 'date-fns';
import type { AICDatePickerProps, DateRange, CalendarHighlight } from './types';

export function AICDatePicker({
  value,
  dateRange,
  onChange,
  onRangeChange,
  mode = 'single',
  label,
  placeholder,
  format: dateFormat = 'DD/MM/YYYY',
  timeFormat = '12h',
  showPresets = false,
  showTime = false,
  showHighlights = false,
  highlightTypes,
  minDate,
  maxDate,
  disabledDates,
  disabledDays,
  required,
  size = 'md',
  disabled = false,
  error,
  className = '',
  dropdownAlign = 'left',
  financialYearStart = 4,
}: AICDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const parsed = parseDate(value);
    return parsed ? startOfMonth(parsed) : startOfMonth(new Date());
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Range selection state
  const [rangeStart, setRangeStart] = useState<Date | null>(dateRange?.start ?? null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(dateRange?.end ?? null);
  const [selectingEnd, setSelectingEnd] = useState(false);

  // Time state
  const [time, setTime] = useState<{ hour: number; minute: number }>(() => {
    const d = parseDate(value);
    return d ? { hour: d.getHours(), minute: d.getMinutes() } : { hour: 8, minute: 0 };
  });
  const [endTime, setEndTime] = useState<{ hour: number; minute: number }>(() => {
    return dateRange?.end
      ? { hour: dateRange.end.getHours(), minute: dateRange.end.getMinutes() }
      : { hour: 17, minute: 0 };
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isRangeMode = mode === 'range';

  // Calendar highlights
  const highlightFrom = useMemo(() => addMonths(viewMonth, -1), [viewMonth]);
  const highlightTo = useMemo(() => addMonths(viewMonth, 3), [viewMonth]);
  const { data: highlights = [] } = useCalendarHighlights(
    highlightFrom,
    highlightTo,
    highlightTypes,
    showHighlights && isOpen,
  );

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  // Sync external value changes
  useEffect(() => {
    if (dateRange) {
      setRangeStart(dateRange.start);
      setRangeEnd(dateRange.end);
    }
  }, [dateRange]);

  const handleDateClick = useCallback(
    (date: Date) => {
      if (isRangeMode) {
        if (!selectingEnd || !rangeStart) {
          setRangeStart(date);
          setRangeEnd(null);
          setSelectingEnd(true);
        } else {
          const start = date < rangeStart ? date : rangeStart;
          const end = date < rangeStart ? rangeStart : date;
          setRangeStart(start);
          setRangeEnd(end);
          setSelectingEnd(false);
        }
      } else {
        // Single / datetime mode
        if (showTime || mode === 'datetime') {
          const d = new Date(date);
          d.setHours(time.hour, time.minute, 0, 0);
          onChange?.(d);
        } else {
          onChange?.(format(date, 'yyyy-MM-dd'));
        }
        setIsOpen(false);
      }
    },
    [isRangeMode, selectingEnd, rangeStart, showTime, mode, time, onChange],
  );

  const handlePresetSelect = useCallback(
    (range: DateRange) => {
      setRangeStart(range.start);
      setRangeEnd(range.end);
      setSelectingEnd(false);
      setViewMonth(startOfMonth(range.start));
    },
    [],
  );

  const handleApply = useCallback(() => {
    if (isRangeMode && rangeStart && rangeEnd) {
      const start = new Date(rangeStart);
      const end = new Date(rangeEnd);
      if (showTime) {
        start.setHours(time.hour, time.minute, 0, 0);
        end.setHours(endTime.hour, endTime.minute, 0, 0);
      }
      onRangeChange?.({ start, end });
    }
    setIsOpen(false);
  }, [isRangeMode, rangeStart, rangeEnd, showTime, time, endTime, onRangeChange]);

  const handleCancel = useCallback(() => {
    // Reset to external state
    if (dateRange) {
      setRangeStart(dateRange.start);
      setRangeEnd(dateRange.end);
    }
    setSelectingEnd(false);
    setIsOpen(false);
  }, [dateRange]);

  // Display value for trigger
  const displayValue = useMemo(() => {
    if (isRangeMode) {
      if (rangeStart && rangeEnd) return formatRange(rangeStart, rangeEnd);
      if (rangeStart) return formatDate(rangeStart, dateFormat) + ' – ...';
      return '';
    }
    const parsed = parseDate(value);
    if (!parsed) return '';
    if (showTime || mode === 'datetime') {
      return formatDate(parsed, 'DD/MM/YYYY') + ' ' + format(parsed, 'hh:mm a');
    }
    return formatDate(parsed, dateFormat);
  }, [value, isRangeMode, rangeStart, rangeEnd, dateFormat, showTime, mode]);

  const selectedRange: DateRange | null = rangeStart && rangeEnd ? { start: rangeStart, end: rangeEnd } : null;
  const selectedDate = !isRangeMode ? parseDate(value) : (selectingEnd ? rangeStart : null);

  const sizeClasses = {
    sm: 'h-8 text-xs px-2.5',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4',
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center gap-2 border rounded-lg bg-white transition
          ${sizeClasses[size]}
          ${error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}
          focus:outline-none focus:ring-2
        `}
      >
        <Icon name="calendar" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="text-gray-400 flex-shrink-0" />
        <span className={`flex-1 text-left truncate ${displayValue ? 'text-gray-800' : 'text-gray-400'}`}>
          {displayValue || placeholder || (isRangeMode ? 'Select date range' : 'Select date')}
        </span>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={14}
          className="text-gray-400 flex-shrink-0"
        />
      </button>

      {/* Error */}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          {isMobile && (
            <div className="fixed inset-0 bg-black/30 z-40" onClick={handleCancel} />
          )}

          <div
            className={`
              ${isMobile
                ? 'fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up'
                : `absolute z-50 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 ${dropdownAlign === 'right' ? 'right-0' : 'left-0'}`}
            `}
            style={!isMobile ? { minWidth: isRangeMode && showPresets ? 700 : isRangeMode ? 580 : 320 } : undefined}
          >
            {/* Mobile drag handle */}
            {isMobile && (
              <div className="flex justify-center py-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
            )}

            <div className={`p-4 ${!isMobile && isRangeMode && showPresets ? 'flex gap-4' : ''}`}>
              {/* Preset sidebar (desktop) */}
              {showPresets && isRangeMode && !isMobile && (
                <PresetSidebar
                  selectedRange={selectedRange}
                  onSelect={handlePresetSelect}
                  financialYearStart={financialYearStart}
                />
              )}

              <div className="flex-1">
                {/* Mobile compact presets */}
                {showPresets && isRangeMode && isMobile && (
                  <PresetSidebar
                    selectedRange={selectedRange}
                    onSelect={handlePresetSelect}
                    financialYearStart={financialYearStart}
                    compact
                  />
                )}

                {/* Calendar Grid */}
                <CalendarGrid
                  viewMonth={viewMonth}
                  onViewMonthChange={setViewMonth}
                  selectedDate={selectedDate}
                  selectedRange={selectedRange}
                  hoverDate={hoverDate}
                  onHoverDate={isRangeMode ? setHoverDate : undefined}
                  onDateClick={handleDateClick}
                  highlights={highlights}
                  minDate={minDate}
                  maxDate={maxDate}
                  disabledDates={disabledDates}
                  disabledDays={disabledDays}
                  dual={isRangeMode && !isMobile}
                />

                {/* Time Picker Row */}
                {(showTime || mode === 'datetime') && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {isRangeMode ? 'Start:' : 'Time:'}
                      </span>
                      <TimePicker value={time} onChange={setTime} format={timeFormat} />
                    </div>
                    {isRangeMode && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">End:</span>
                        <TimePicker value={endTime} onChange={setEndTime} format={timeFormat} />
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons (range mode) */}
                {isRangeMode && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {rangeStart && rangeEnd && formatRange(rangeStart, rangeEnd)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleApply}
                        disabled={!rangeStart || !rangeEnd}
                        className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
