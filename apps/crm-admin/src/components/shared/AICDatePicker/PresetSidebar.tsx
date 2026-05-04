'use client';

import { useMemo } from 'react';
import { getPresets, isSameDay } from './date-utils';
import type { DateRange, PresetItem } from './types';

interface PresetSidebarProps {
  selectedRange?: DateRange | null;
  onSelect: (range: DateRange) => void;
  financialYearStart?: number;
  compact?: boolean;
}

export function PresetSidebar({ selectedRange, onSelect, financialYearStart, compact }: PresetSidebarProps) {
  const presets = useMemo(() => getPresets(financialYearStart), [financialYearStart]);

  const isActive = (preset: PresetItem) => {
    if (!selectedRange) return false;
    const range = preset.getValue();
    return isSameDay(range.start, selectedRange.start) && isSameDay(range.end, selectedRange.end);
  };

  if (compact) {
    return (
      <div className="flex gap-1.5 overflow-x-auto py-2 px-1 no-scrollbar">
        {presets.slice(0, 6).map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onSelect(p.getValue())}
            className={`whitespace-nowrap text-xs px-2.5 py-1.5 rounded-full border transition ${
              isActive(p)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-[140px] border-r border-gray-200 pr-3 space-y-0.5">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
        Presets
      </div>
      {presets.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => onSelect(p.getValue())}
          className={`w-full text-left text-sm px-2 py-1.5 rounded transition ${
            isActive(p)
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
