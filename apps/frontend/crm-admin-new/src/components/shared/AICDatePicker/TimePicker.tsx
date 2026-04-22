'use client';

import { useState, useCallback, useEffect } from 'react';

interface TimePickerProps {
  value: { hour: number; minute: number };
  onChange: (val: { hour: number; minute: number }) => void;
  format?: '12h' | '24h';
}

export function TimePicker({ value, onChange, format: fmt = '12h' }: TimePickerProps) {
  const is12h = fmt === '12h';
  const [amPm, setAmPm] = useState<'AM' | 'PM'>(value.hour >= 12 ? 'PM' : 'AM');

  const displayHour = is12h
    ? value.hour === 0
      ? 12
      : value.hour > 12
        ? value.hour - 12
        : value.hour
    : value.hour;

  const handleHourChange = useCallback(
    (h: number) => {
      let hour = h;
      if (is12h) {
        if (amPm === 'PM' && h < 12) hour = h + 12;
        if (amPm === 'AM' && h === 12) hour = 0;
      }
      onChange({ hour: Math.max(0, Math.min(23, hour)), minute: value.minute });
    },
    [is12h, amPm, value.minute, onChange],
  );

  const handleMinuteChange = useCallback(
    (m: number) => {
      onChange({ hour: value.hour, minute: Math.max(0, Math.min(59, m)) });
    },
    [value.hour, onChange],
  );

  const toggleAmPm = useCallback(() => {
    const newAmPm = amPm === 'AM' ? 'PM' : 'AM';
    setAmPm(newAmPm);
    let hour = value.hour;
    if (newAmPm === 'PM' && hour < 12) hour += 12;
    if (newAmPm === 'AM' && hour >= 12) hour -= 12;
    onChange({ hour, minute: value.minute });
  }, [amPm, value, onChange]);

  useEffect(() => {
    setAmPm(value.hour >= 12 ? 'PM' : 'AM');
  }, [value.hour]);

  return (
    <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
      <input
        type="number"
        min={is12h ? 1 : 0}
        max={is12h ? 12 : 23}
        value={String(displayHour).padStart(2, '0')}
        onChange={(e) => handleHourChange(parseInt(e.target.value) || 0)}
        className="w-8 text-center text-sm bg-transparent outline-none font-medium"
        aria-label="Hour"
      />
      <span className="text-gray-400 font-medium">:</span>
      <input
        type="number"
        min={0}
        max={59}
        value={String(value.minute).padStart(2, '0')}
        onChange={(e) => handleMinuteChange(parseInt(e.target.value) || 0)}
        className="w-8 text-center text-sm bg-transparent outline-none font-medium"
        aria-label="Minute"
      />
      {is12h && (
        <button
          type="button"
          onClick={toggleAmPm}
          className="ml-1 text-xs px-2 py-0.5 bg-white border border-gray-200 rounded font-medium hover:bg-gray-100 transition"
        >
          {amPm}
        </button>
      )}
    </div>
  );
}
