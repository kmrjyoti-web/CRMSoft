import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { CalendarSettings, ColumnDef } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function CalendarView({
  data,
  settings,
  columns,
  onRowEdit,
}: {
  data: any[];
  settings?: CalendarSettings | null;
  columns?: ColumnDef[];
  onRowEdit?: (row: any) => void;
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Build label map from columns
  const labelMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (columns) columns.forEach(c => { map[c.id] = c.label; });
    return map;
  }, [columns]);

  const getFieldLabel = (fieldId: string) =>
    labelMap[fieldId] || fieldId.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  const dateField = settings?.dateField || 'date';
  const labelField = settings?.labelField || 'contactName';

  // Calculate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // 0=Sun
    const daysInMonth = lastDay.getDate();

    // Previous month overflow
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const days: { date: number; month: 'prev' | 'current' | 'next'; fullDate: Date }[] = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      days.push({ date: d, month: 'prev', fullDate: new Date(currentYear, currentMonth - 1, d) });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: d, month: 'current', fullDate: new Date(currentYear, currentMonth, d) });
    }

    // Fill remaining to complete 6 rows (42 cells) or 5 rows (35 cells)
    const totalCells = days.length <= 35 ? 35 : 42;
    let nextDay = 1;
    while (days.length < totalCells) {
      days.push({ date: nextDay, month: 'next', fullDate: new Date(currentYear, currentMonth + 1, nextDay) });
      nextDay++;
    }

    return days;
  }, [currentMonth, currentYear]);

  // Group data by date
  const dataByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    data.forEach(item => {
      const rawDate = item[dateField] || item.date || item.crDate;
      if (!rawDate) return;
      const parsed = new Date(rawDate);
      if (isNaN(parsed.getTime())) return;
      const key = `${parsed.getFullYear()}-${parsed.getMonth()}-${parsed.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [data, dateField]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // No settings — prompt to configure
  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Calendar size={48} className="mb-3 opacity-40" />
        <p className="text-lg font-medium text-gray-500">Configure Calendar View</p>
        <p className="text-sm mt-1">Click the Settings icon to select a date field</p>
      </div>
    );
  }

  const isToday = (day: { date: number; month: string; fullDate: Date }) =>
    day.month === 'current' &&
    day.date === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevMonth}
            className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 min-w-[180px] text-center">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
          <button
            onClick={goToToday}
            className="ml-2 px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Today
          </button>
        </div>
        <div className="text-xs text-gray-400">
          Date Field: <span className="font-medium text-gray-600">{getFieldLabel(dateField)}</span>
          {' · '}
          Label: <span className="font-medium text-gray-600">{getFieldLabel(labelField)}</span>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {DAYS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-0">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {calendarDays.map((day, i) => {
          const dateKey = `${day.fullDate.getFullYear()}-${day.fullDate.getMonth()}-${day.fullDate.getDate()}`;
          const dayItems = dataByDate[dateKey] || [];
          const isCurrent = day.month === 'current';
          const todayHighlight = isToday(day);

          return (
            <div
              key={i}
              className={`border-r border-b border-gray-200 p-1.5 min-h-[90px] ${
                !isCurrent ? 'bg-gray-50' : todayHighlight ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              <div className={`text-right text-sm mb-1 ${
                !isCurrent ? 'text-gray-300' : todayHighlight ? 'font-bold text-blue-600' : 'text-gray-700'
              }`}>
                {todayHighlight ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                    {day.date}
                  </span>
                ) : (
                  day.date
                )}
              </div>
              <div className="space-y-0.5">
                {dayItems.slice(0, 3).map((item: any) => {
                  const itemColor = item.color as string | undefined;
                  const bgStyle = itemColor
                    ? { backgroundColor: `${itemColor}18`, color: itemColor, borderLeft: `3px solid ${itemColor}` }
                    : undefined;
                  return (
                    <div
                      key={item.id || Math.random()}
                      className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer transition-colors ${
                        itemColor ? 'hover:opacity-80' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                      style={bgStyle}
                      title={String(item[labelField] || item.contactName || item.name || '—')}
                      onClick={() => onRowEdit?.(item)}
                    >
                      {item[labelField] || item.contactName || item.name || '—'}
                    </div>
                  );
                })}
                {dayItems.length > 3 && (
                  <div className="text-xs text-gray-400 pl-1">+{dayItems.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
