import { useState } from 'react';
import { Search, Plus, HelpCircle, X } from 'lucide-react';
import type { KanbanSettings } from '../types';

/* ── helpers ─────────────────────────────────────────────── */

function detectCategoricalFields(data: any[], allFields: string[]): string[] {
  return allFields.filter(f => {
    const val = data.find(d => d[f] !== undefined && d[f] !== null)?.[f];
    return (
      typeof val === 'string' &&
      !f.toLowerCase().includes('date') &&
      !f.toLowerCase().includes('email') &&
      !f.toLowerCase().includes('phone') &&
      !f.toLowerCase().includes('url') &&
      !f.toLowerCase().includes('description') &&
      !f.toLowerCase().includes('note')
    );
  });
}

function detectNumericFields(data: any[], allFields: string[]): string[] {
  return allFields.filter(f => {
    const val = data.find(d => d[f] !== undefined && d[f] !== null)?.[f];
    return typeof val === 'number';
  });
}

function toLabel(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

function toCategoryLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ── component ───────────────────────────────────────────── */

export function KanbanSettingsModal({
  isOpen,
  onClose,
  onSave,
  data,
  categoryOptions,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: KanbanSettings) => void;
  data: any[];
  categoryOptions?: Record<string, string[]>;
}) {
  // ── compute fields BEFORE useState so detected values become defaults ──
  const allFields = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  ).filter(f => f !== 'id');

  const categoricalFields = detectCategoricalFields(data, allFields);
  const numericFields = detectNumericFields(data, allFields);

  // ── state ─────────────────────────────────────────────────────────────
  const [name, setName] = useState('Kanban View Name');
  const [categorizeBy, setCategorizeBy] = useState<string>(
    () => categoricalFields[0] ?? ''
  );
  const [aggregateBy, setAggregateBy] = useState<string>(
    () => numericFields[0] ?? ''
  );
  const [headerStyle, setHeaderStyle] = useState<'Mono Color' | 'Multi Color'>('Multi Color');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    () => categoryOptions?.[categoricalFields[0] ?? ''] ?? []
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Available predefined categories for the current categorizeBy field
  const currentCategoryOptions = categoryOptions?.[categorizeBy];

  const handleCategorizeByChange = (field: string) => {
    setCategorizeBy(field);
    // Reset categories to all when field changes
    const opts = categoryOptions?.[field];
    setSelectedCategories(opts ?? []);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleAllCategories = () => {
    if (!currentCategoryOptions) return;
    if (selectedCategories.length === currentCategoryOptions.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...currentCategoryOptions]);
    }
  };

  // For the field picker — first field is "primary" (locked), rest selectable
  const primaryField = allFields[0] ?? '';
  const [selectedFields, setSelectedFields] = useState<string[]>(() =>
    allFields.slice(0, 3)
  );
  const [availableFields, setAvailableFields] = useState<string[]>(() =>
    allFields.filter(f => !allFields.slice(0, 3).includes(f))
  );

  const filteredAvailable = availableFields.filter(f =>
    f.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMoveToSelected = (field: string) => {
    setAvailableFields(prev => prev.filter(f => f !== field));
    setSelectedFields(prev => [...prev, field]);
  };

  const handleMoveToAvailable = (field: string) => {
    if (field === primaryField) return;
    setSelectedFields(prev => prev.filter(f => f !== field));
    setAvailableFields(prev => [...prev, field].sort());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-[620px] max-w-full flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Kanban View — Settings</h2>
          <div className="flex items-center gap-3">
            <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
              <HelpCircle size={15} className="mr-1" /> Help
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">

          {/* View Name */}
          <div className="flex items-center gap-3">
            <label className="w-36 shrink-0 text-sm text-gray-600 text-right">View Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d95322] focus:border-[#d95322]"
            />
          </div>

          {/* Categorize By */}
          <div className="flex items-center gap-3">
            <label className="w-36 shrink-0 text-sm text-gray-600 text-right flex items-center justify-end gap-1">
              Categorize By <HelpCircle size={13} className="text-gray-400" />
            </label>
            <select
              value={categorizeBy}
              onChange={e => handleCategorizeByChange(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d95322] focus:border-[#d95322]"
            >
              {categoricalFields.length === 0 && (
                <option value="">— No categorical fields detected —</option>
              )}
              {categoricalFields.map(f => (
                <option key={f} value={f}>{toLabel(f)}</option>
              ))}
            </select>
          </div>

          {/* Category Columns Selection — only when predefined options exist */}
          {currentCategoryOptions && currentCategoryOptions.length > 0 && (
            <div className="flex gap-3">
              <label className="w-36 shrink-0 text-sm text-gray-600 text-right pt-1 flex items-start justify-end gap-1">
                Columns <HelpCircle size={13} className="text-gray-400 mt-0.5" />
              </label>
              <div className="flex-1">
                <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto p-2 space-y-1">
                  <label className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 rounded border-b border-gray-100 pb-2 mb-1">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === currentCategoryOptions.length}
                      onChange={toggleAllCategories}
                      className="rounded text-[#d95322] focus:ring-[#d95322]"
                    />
                    Select All
                  </label>
                  {currentCategoryOptions.map(cat => (
                    <label key={cat} className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 cursor-pointer hover:bg-orange-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="rounded text-[#d95322] focus:ring-[#d95322]"
                      />
                      {toCategoryLabel(cat)}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{selectedCategories.length} of {currentCategoryOptions.length} columns selected</p>
              </div>
            </div>
          )}

          {/* Aggregate By */}
          <div className="flex items-center gap-3">
            <label className="w-36 shrink-0 text-sm text-gray-600 text-right flex items-center justify-end gap-1">
              Aggregate By <HelpCircle size={13} className="text-gray-400" />
            </label>
            <select
              value={aggregateBy}
              onChange={e => setAggregateBy(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d95322] focus:border-[#d95322]"
            >
              <option value="">— None —</option>
              {numericFields.map(f => (
                <option key={f} value={f}>{toLabel(f)}</option>
              ))}
            </select>
          </div>

          {/* Header Style */}
          <div className="flex items-center gap-3">
            <label className="w-36 shrink-0 text-sm text-gray-600 text-right">Header Style</label>
            <select
              value={headerStyle}
              onChange={e => setHeaderStyle(e.target.value as any)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d95322] focus:border-[#d95322]"
            >
              <option>Mono Color</option>
              <option>Multi Color</option>
            </select>
          </div>

          {/* Field Picker */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Card Fields</h3>
            <div className="flex gap-4">
              {/* Available */}
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Available</label>
                <div className="border border-gray-200 rounded-md h-52 flex flex-col">
                  <div className="px-2 py-1.5 border-b border-gray-100">
                    <div className="relative">
                      <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search fields…"
                        className="w-full pl-6 pr-2 py-1 text-sm border-none focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-1">
                    {filteredAvailable.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">No fields available</p>
                    )}
                    {filteredAvailable.map(field => (
                      <div
                        key={field}
                        onClick={() => handleMoveToSelected(field)}
                        className="px-2 py-1.5 text-sm text-gray-700 hover:bg-orange-50 cursor-pointer rounded flex justify-between items-center group"
                      >
                        {toLabel(field)}
                        <Plus size={13} className="opacity-0 group-hover:opacity-100 text-[#d95322]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected */}
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Selected</label>
                <div className="border border-gray-200 rounded-md h-52 overflow-y-auto p-1">
                  {selectedFields.map(field => (
                    <div
                      key={field}
                      onClick={() => handleMoveToAvailable(field)}
                      className={`px-2 py-1.5 text-sm rounded flex justify-between items-center group ${
                        field === primaryField
                          ? 'text-gray-500 cursor-default'
                          : 'text-gray-700 hover:bg-red-50 cursor-pointer'
                      }`}
                    >
                      <span>
                        {toLabel(field)}
                        {field === primaryField && (
                          <span className="text-[#d95322] ml-1 text-xs">*</span>
                        )}
                      </span>
                      {field !== primaryField && (
                        <X size={13} className="opacity-0 group-hover:opacity-100 text-red-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ name, categorizeBy, aggregateBy, headerStyle, selectedFields, selectedCategories: currentCategoryOptions ? selectedCategories : undefined })}
            disabled={!categorizeBy}
            className="px-4 py-2 text-sm font-medium text-white bg-[#d95322] rounded-md hover:bg-[#c24a1e] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
