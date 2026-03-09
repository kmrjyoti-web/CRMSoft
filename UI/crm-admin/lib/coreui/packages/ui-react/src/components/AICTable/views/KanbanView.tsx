import React, { useState } from 'react';
import { ArrowRightToLine } from 'lucide-react';
import type { KanbanSettings } from '../types';
import { KANBAN_COLOR_PALETTE } from '../constants';

export function KanbanView({ data, settings, onCreate, categoryOptions, title }: { data: any[]; settings: KanbanSettings | null; onCreate?: () => void; categoryOptions?: Record<string, string[]>; title?: string }) {
  const categorizeBy = settings?.categorizeBy || 'leadSource';
  const aggregateBy = settings?.aggregateBy || '';
  const selectedFields = settings?.selectedFields || ['contactName', 'accountName'];

  // Use predefined categories if available for the selected field, otherwise derive from data
  const predefined = categoryOptions?.[categorizeBy];
  const selectedCats = settings?.selectedCategories;
  let allCategories: string[];

  if (predefined) {
    // Use predefined list, filtered by user selection if present
    allCategories = selectedCats && selectedCats.length > 0
      ? predefined.filter(c => selectedCats.includes(c))
      : predefined;
  } else {
    allCategories = Array.from(new Set(data.map(item => item[categorizeBy]).filter(Boolean))).map(String);
  }

  const columns = allCategories.map((cat, index) => {
    const palette = KANBAN_COLOR_PALETTE[index % KANBAN_COLOR_PALETTE.length];
    return { id: String(cat), title: String(cat).replace(/_/g, ' '), ...palette };
  });

  const uncategorizedData = data.filter(d => !d[categorizeBy]);
  if (uncategorizedData.length > 0) {
    columns.push({
      id: 'Uncategorized',
      title: 'Uncategorized',
      color: 'bg-gray-200 text-gray-800',
      badge: 'bg-gray-300 text-gray-800',
      border: 'border-gray-300',
    });
  }

  const [collapsedCols, setCollapsedCols] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsedCols(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="h-full flex overflow-x-auto bg-gray-50 p-4 space-x-2">
      {columns.map(col => {
        const isCollapsed = collapsedCols[col.id];
        const colData = col.id === 'Uncategorized' ? uncategorizedData : data.filter(d => String(d[categorizeBy]) === col.id);

        let aggregateDisplay = '';
        if (aggregateBy) {
          const sum = colData.reduce((acc, item) => acc + (Number(item[aggregateBy]) || 0), 0);
          aggregateDisplay = `${sum.toLocaleString()}`;
        }

        if (isCollapsed) {
          return (
            <div key={col.id} className="flex flex-col w-12 flex-shrink-0">
              <div
                onClick={() => toggleCollapse(col.id)}
                className={`flex-1 border rounded-md flex flex-col items-center py-4 cursor-pointer hover:bg-gray-100 transition-colors ${settings?.headerStyle === 'Multi Color' ? col.color : 'bg-gray-100 text-gray-800'} ${settings?.headerStyle === 'Multi Color' ? col.border : 'border-gray-200'}`}
              >
                <span style={{ writingMode: 'vertical-rl' }} className="transform rotate-180 text-sm font-medium whitespace-nowrap mb-4">{col.title}</span>
                <span className="bg-white/50 px-1.5 py-0.5 rounded-full text-xs font-bold mb-2">{colData.length}</span>
                {aggregateDisplay && <span style={{ writingMode: 'vertical-rl' }} className="transform rotate-180 text-xs font-medium">{aggregateDisplay}</span>}
              </div>
            </div>
          );
        }

        return (
          <div key={col.id} className="flex flex-col w-72 flex-shrink-0">
            <div
              onClick={() => toggleCollapse(col.id)}
              className={`p-3 rounded-t-md border-t border-l border-r cursor-pointer flex flex-col ${settings?.headerStyle === 'Multi Color' ? col.color : 'bg-gray-100 text-gray-800'} ${settings?.headerStyle === 'Multi Color' ? col.border : 'border-gray-200'}`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-medium truncate">{col.title}</h3>
                <span className="bg-white/50 px-1.5 py-0.5 rounded-full text-xs font-bold">{colData.length}</span>
              </div>
              {aggregateDisplay && <div className="text-xs font-medium">{aggregateDisplay}</div>}
            </div>

            <div className={`flex-1 min-h-0 border-l border-r border-b rounded-b-md bg-gray-100 p-2 flex flex-col ${settings?.headerStyle === 'Multi Color' ? col.border : 'border-gray-200'}`}>
              <div className="flex-1 min-h-0 overflow-y-auto">
                {colData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">
                    No items found.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {colData.map(contact => (
                      <div key={contact.id} className="bg-white p-3 rounded shadow-sm border border-gray-200">
                        {selectedFields.map((field, idx) => {
                          const val = contact[field];
                          if (idx === 0) {
                            return <div key={field} className="text-sm font-medium text-blue-600">{val || '-'}</div>;
                          }
                          return (
                            <div key={field} className="text-xs text-gray-500 mt-1">
                              <span className="font-medium text-gray-400">{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {val || '-'}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {onCreate && (
                <div className="flex-shrink-0 mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                  <button onClick={onCreate} className="text-xs text-[#d95322] hover:underline font-medium">+ Create {title || 'Record'}</button>
                  <button className="text-gray-400 hover:text-gray-600"><ArrowRightToLine size={14} /></button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
