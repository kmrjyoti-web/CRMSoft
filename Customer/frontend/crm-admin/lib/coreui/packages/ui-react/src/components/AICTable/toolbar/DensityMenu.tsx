import React from 'react';
import { AlignJustify, Menu, LayoutGrid } from 'lucide-react';
import type { AICTableFullDensity } from '../types';

export function DensityMenu({
  density,
  setDensity,
  paginationMode,
  setPaginationMode,
  fillBlankRows,
  setFillBlankRows,
  isOpen,
  setIsOpen,
}: {
  density: AICTableFullDensity;
  setDensity: (d: AICTableFullDensity) => void;
  paginationMode: 'infinite' | 'paginated';
  setPaginationMode: (m: 'infinite' | 'paginated') => void;
  fillBlankRows: boolean;
  setFillBlankRows: (v: boolean) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  return (
    <div className="relative ml-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md border border-gray-300 flex items-center"
        title="Display Density"
      >
        <AlignJustify size={14} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-30 p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setDensity('comfortable'); setIsOpen(false); }}
              className={`flex items-center justify-center px-3 py-2 text-sm border rounded-md ${density === 'comfortable' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <AlignJustify size={16} className="mr-2" /> Comfortable
            </button>
            <button
              onClick={() => { setDensity('cozy'); setIsOpen(false); }}
              className={`flex items-center justify-center px-3 py-2 text-sm border rounded-md ${density === 'cozy' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <Menu size={16} className="mr-2" /> Cozy
            </button>
            <button
              onClick={() => { setDensity('compact'); setIsOpen(false); }}
              className={`flex items-center justify-center px-3 py-2 text-sm border rounded-md ${density === 'compact' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={16} className="mr-2" /> Compact
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={paginationMode === 'paginated'}
                onChange={(e) => setPaginationMode(e.target.checked ? 'paginated' : 'infinite')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Enable Pagination</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={fillBlankRows}
                onChange={(e) => setFillBlankRows(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Fill empty rows</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
