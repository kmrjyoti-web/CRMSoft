import React from 'react';
import { Search } from 'lucide-react';
import type { ColumnFilterType, FilterValue } from '../types';

export interface FilterItemProps {
  columnId: string;
  label: string;
  filterType: ColumnFilterType;
  options?: { value: string; label: string }[];
  value: FilterValue | undefined;
  onChange: (columnId: string, value: FilterValue | undefined) => void;
}

export function FilterItem({
  columnId,
  label,
  filterType,
  options = [],
  value,
  onChange,
}: FilterItemProps) {
  const isChecked = value !== undefined;

  const handleCheck = (checked: boolean) => {
    if (!checked) {
      onChange(columnId, undefined);
      return;
    }
    // Initialize with default value based on type
    switch (filterType) {
      case 'text':
        onChange(columnId, { type: 'text', value: '' });
        break;
      case 'number':
        onChange(columnId, { type: 'number' });
        break;
      case 'date':
        onChange(columnId, { type: 'date' });
        break;
      case 'master':
        onChange(columnId, { type: 'master', selected: [] });
        break;
      case 'boolean':
        onChange(columnId, { type: 'boolean', value: true });
        break;
    }
  };

  return (
    <div className="mb-2">
      <label className="flex items-center space-x-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => handleCheck(e.target.checked)}
          className="rounded border-gray-300 text-[#d95322] focus:ring-[#d95322] accent-[#d95322]"
        />
        <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
      </label>

      {/* Text filter */}
      {isChecked && filterType === 'text' && value?.type === 'text' && (
        <div className="ml-6 mt-2 text-sm text-gray-600">
          <input
            type="text"
            placeholder={`Search ${label}...`}
            value={value.value}
            onChange={(e) => onChange(columnId, { type: 'text', value: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#d95322]"
          />
        </div>
      )}

      {/* Number range filter */}
      {isChecked && filterType === 'number' && value?.type === 'number' && (
        <div className="ml-6 mt-2 space-y-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
          <div className="flex flex-col space-y-1">
            <label className="text-xs text-gray-500">Min Value</label>
            <input
              type="number"
              placeholder="0"
              value={value.min ?? ''}
              onChange={(e) => onChange(columnId, {
                type: 'number',
                min: e.target.value ? Number(e.target.value) : undefined,
                max: value.max,
              })}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#d95322]"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-xs text-gray-500">Max Value</label>
            <input
              type="number"
              placeholder="100000"
              value={value.max ?? ''}
              onChange={(e) => onChange(columnId, {
                type: 'number',
                min: value.min,
                max: e.target.value ? Number(e.target.value) : undefined,
              })}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#d95322]"
            />
          </div>
        </div>
      )}

      {/* Date range filter */}
      {isChecked && filterType === 'date' && value?.type === 'date' && (
        <div className="ml-6 mt-2 space-y-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
          <div className="flex flex-col space-y-1">
            <label className="text-xs text-gray-500">From</label>
            <input
              type="date"
              value={value.from ?? ''}
              onChange={(e) => onChange(columnId, { type: 'date', from: e.target.value || undefined, to: value.to })}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#d95322]"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-xs text-gray-500">To</label>
            <input
              type="date"
              value={value.to ?? ''}
              onChange={(e) => onChange(columnId, { type: 'date', from: value.from, to: e.target.value || undefined })}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#d95322]"
            />
          </div>
        </div>
      )}

      {/* Master / Categorical filter */}
      {isChecked && filterType === 'master' && value?.type === 'master' && (
        <MasterFilter
          options={options}
          selected={value.selected}
          onChange={(selected) => onChange(columnId, { type: 'master', selected })}
        />
      )}

      {/* Boolean filter */}
      {isChecked && filterType === 'boolean' && value?.type === 'boolean' && (
        <div className="ml-6 mt-2 space-y-1 text-sm text-gray-600">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name={`bool_${columnId}`}
              checked={value.value === true}
              onChange={() => onChange(columnId, { type: 'boolean', value: true })}
              className="text-[#d95322] focus:ring-[#d95322] accent-[#d95322]"
            />
            <span className="text-xs">Yes</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name={`bool_${columnId}`}
              checked={value.value === false}
              onChange={() => onChange(columnId, { type: 'boolean', value: false })}
              className="text-[#d95322] focus:ring-[#d95322] accent-[#d95322]"
            />
            <span className="text-xs">No</span>
          </label>
        </div>
      )}
    </div>
  );
}

// ── Master Filter Sub-component ──────────────────────────

function MasterFilter({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const [search, setSearch] = React.useState('');

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggleOption = (val: string) => {
    onChange(
      selected.includes(val)
        ? selected.filter((s) => s !== val)
        : [...selected, val],
    );
  };

  return (
    <div className="ml-6 mt-2 space-y-1 max-h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
      <div className="relative mb-2">
        <Search size={12} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-6 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#d95322]"
        />
      </div>
      {filtered.map((opt) => (
        <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(opt.value)}
            onChange={() => toggleOption(opt.value)}
            className="rounded border-gray-300 text-[#d95322] focus:ring-[#d95322] accent-[#d95322]"
          />
          <span className="text-xs text-gray-600">{opt.label}</span>
        </label>
      ))}
      {filtered.length === 0 && (
        <p className="text-xs text-gray-400 italic">No options found</p>
      )}
    </div>
  );
}
