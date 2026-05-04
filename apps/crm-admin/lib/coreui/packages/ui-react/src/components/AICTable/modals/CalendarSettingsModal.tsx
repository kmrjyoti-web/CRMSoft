import { useState, useMemo } from 'react';
import { Calendar, HelpCircle } from 'lucide-react';
import type { CalendarSettings, ColumnDef } from '../types';

export function CalendarSettingsModal({
  isOpen,
  onClose,
  onSave,
  data,
  columns,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: CalendarSettings) => void;
  data: any[];
  columns?: ColumnDef[];
}) {
  // Build label map from columns
  const labelMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (columns) {
      columns.forEach(c => { map[c.id] = c.label; });
    }
    return map;
  }, [columns]);

  const getLabel = (fieldId: string) =>
    labelMap[fieldId] || fieldId.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  // Detect date fields from data — fields where values look like dates
  const dateFields = useMemo(() => {
    if (!data.length) return [];
    const allKeys = columns?.length
      ? columns.map(c => c.id)
      : Array.from(new Set(data.flatMap(item => Object.keys(item))));

    return allKeys.filter(key => {
      // Check first few non-null values to see if they are date-like
      const samples = data.slice(0, 20).map(row => row[key]).filter(Boolean);
      if (samples.length === 0) return false;
      // Match ISO dates, common date formats, or Date objects
      return samples.some(val => {
        if (val instanceof Date) return true;
        if (typeof val !== 'string') return false;
        // ISO format: 2024-01-15T... or 2024-01-15 or date-like strings
        if (/^\d{4}-\d{2}-\d{2}/.test(val)) return true;
        if (/^\d{2}\/\d{2}\/\d{4}/.test(val)) return true;
        // Try parsing — valid dates parse to a valid timestamp
        const parsed = Date.parse(val);
        return !isNaN(parsed) && val.length >= 8;
      });
    });
  }, [data, columns]);

  // All fields for label selection
  const allFields = useMemo(() => {
    if (columns?.length) return columns.map(c => c.id).filter(f => f !== 'id');
    return Array.from(new Set(data.flatMap(item => Object.keys(item)))).filter(f => f !== 'id');
  }, [columns, data]);

  const [dateField, setDateField] = useState(dateFields[0] || '');
  const [labelField, setLabelField] = useState(allFields[0] || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#d95322]" />
            <h2 className="text-lg font-semibold text-gray-900">Calendar View - Settings</h2>
          </div>
          <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
            <HelpCircle size={16} className="mr-1" /> Help
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Date Field Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date Field <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Choose which date field to use for placing items on the calendar
            </p>
            {dateFields.length > 0 ? (
              <div className="space-y-2">
                {dateFields.map(field => (
                  <label
                    key={field}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                      dateField === field
                        ? 'border-[#d95322] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dateField"
                      value={field}
                      checked={dateField === field}
                      onChange={() => setDateField(field)}
                      className="text-[#d95322] focus:ring-[#d95322]"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{getLabel(field)}</div>
                      <div className="text-xs text-gray-400 font-mono">{field}</div>
                    </div>
                    <Calendar size={14} className="text-gray-400" />
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar size={24} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">No date fields detected in data</p>
                <p className="text-xs text-gray-400 mt-1">Ensure your data contains date columns</p>
              </div>
            )}
          </div>

          {/* Label Field Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Label Field
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Choose which field to show as the item label on calendar days
            </p>
            <select
              value={labelField}
              onChange={e => setLabelField(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d95322] focus:border-[#d95322]"
            >
              {allFields.map(field => (
                <option key={field} value={field}>{getLabel(field)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (dateField) {
                onSave({ dateField, labelField });
              }
            }}
            disabled={!dateField}
            className="px-4 py-2 text-sm font-medium text-white bg-[#d95322] rounded-md hover:bg-[#c24a1e] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
