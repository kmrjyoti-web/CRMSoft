'use client';

import { Icon } from '@/components/ui';
import { getSectionLabel, getSectionIcon } from '../utils/report-helpers';
import type { SectionType } from '../types/report.types';

const TOOLBOX_ITEMS: { type: SectionType; description: string; group: string }[] = [
  // Layout
  { type: 'heading', description: 'Section heading (H1, H2, H3)', group: 'Layout' },
  { type: 'text', description: 'Free text paragraph', group: 'Layout' },
  { type: 'divider', description: 'Horizontal line separator', group: 'Layout' },
  { type: 'spacer', description: 'Vertical space', group: 'Layout' },
  { type: 'image', description: 'Image or company logo', group: 'Layout' },
  // Data
  { type: 'data-field', description: 'Single data field with aggregation', group: 'Data' },
  { type: 'kpi-row', description: 'KPI metric cards row', group: 'Data' },
  { type: 'table', description: 'Data table with columns', group: 'Data' },
  { type: 'chart', description: 'Chart visualization', group: 'Data' },
  { type: 'formula', description: 'Calculated / formula field', group: 'Data' },
  // Advanced
  { type: 'group-header', description: 'Group records by field', group: 'Advanced' },
  { type: 'summary-row', description: 'Totals / summary row', group: 'Advanced' },
  { type: 'comparison', description: 'Period-over-period comparison', group: 'Advanced' },
];

const GROUPS = ['Layout', 'Data', 'Advanced'];

interface ReportDesignerToolboxProps {
  onAddSection: (type: SectionType) => void;
}

export function ReportDesignerToolbox({ onAddSection }: ReportDesignerToolboxProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {GROUPS.map((group) => {
        const items = TOOLBOX_ITEMS.filter((i) => i.group === group);
        return (
          <div key={group}>
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                {group}
              </span>
            </div>
            <div className="p-2 space-y-1">
              {items.map((item) => (
                <button
                  key={item.type}
                  onClick={() => onAddSection(item.type)}
                  className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name={getSectionIcon(item.type) as any} size={14} className="text-gray-500 group-hover:text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 group-hover:text-blue-700">
                      {getSectionLabel(item.type)}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
