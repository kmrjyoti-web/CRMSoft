import React from 'react';
import { Search, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FilterSection } from './FilterSection';
import { FilterItem } from './FilterItem';
import type { TableFilterConfig, FilterValues } from '../types';

export interface FilterSidebarProps {
  isOpen: boolean;
  filterConfig?: TableFilterConfig;
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onApply: (values: FilterValues) => void;
  onClear: () => void;
  onCreate?: () => void;
  title?: string;
}

export function FilterSidebar({
  isOpen,
  filterConfig,
  values,
  onChange,
  onApply,
  onClear,
  onCreate,
  title = 'Filter Contacts by',
}: FilterSidebarProps) {
  const [filterSearch, setFilterSearch] = React.useState('');

  const activeCount = Object.keys(values).length;

  const handleFilterItemChange = (columnId: string, value: any) => {
    if (value === undefined) {
      const next = { ...values };
      delete next[columnId];
      onChange(next);
    } else {
      onChange({ ...values, [columnId]: value });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="flex-shrink-0 bg-white border-r border-gray-200 flex flex-col"
        >
          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">{title}</h2>
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={onCreate}
                className="flex-shrink-0 p-1.5 text-white bg-[#f26b3a] rounded-md hover:bg-[#e05a29] transition-colors flex items-center justify-center"
                title="Create Record"
              >
                <Plus size={16} />
              </button>
            </div>

            {filterConfig ? (
              filterConfig.sections.map((section) => {
                // Filter items by search text
                const filteredItems = filterSearch
                  ? section.filters.filter((f) =>
                      f.label.toLowerCase().includes(filterSearch.toLowerCase()),
                    )
                  : section.filters;

                if (filteredItems.length === 0) return null;

                return (
                  <FilterSection
                    key={section.title}
                    title={section.title}
                    defaultOpen={section.defaultOpen}
                  >
                    {filteredItems.map((filter) => (
                      <FilterItem
                        key={filter.columnId}
                        columnId={filter.columnId}
                        label={filter.label}
                        filterType={filter.filterType}
                        options={filter.options}
                        value={values[filter.columnId]}
                        onChange={handleFilterItemChange}
                      />
                    ))}
                  </FilterSection>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 italic text-center py-8">
                No filters configured
              </p>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-white space-y-2">
            <button
              onClick={() => onApply(values)}
              className="w-full py-2 bg-[#d95322] hover:bg-[#c24a1e] text-white text-sm font-medium rounded-md transition-colors"
            >
              Apply Filter{activeCount > 0 && ` (${activeCount})`}
            </button>
            <button
              onClick={onClear}
              className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
