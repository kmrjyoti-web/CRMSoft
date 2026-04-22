'use client';

import { Icon } from '@/components/ui';
import { getSectionLabel, getSectionIcon } from '../utils/report-helpers';
import { getEntityDefinition, DATA_TYPE_ICONS, DATA_TYPE_COLORS, AGGREGATION_LABELS } from '../utils/report-fields';
import type { AggregationType } from '../utils/report-fields';
import type { TemplateSection } from '../types/report.types';

interface ReportDesignerSectionProps {
  section: TemplateSection;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function ReportDesignerSection({
  section,
  isSelected,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: ReportDesignerSectionProps) {
  const renderPreview = () => {
    switch (section.type) {
      case 'heading': {
        const Tag = `h${section.level}` as keyof JSX.IntrinsicElements;
        const sizes = { 1: 'text-xl font-bold', 2: 'text-lg font-semibold', 3: 'text-base font-semibold' };
        return (
          <Tag
            className={`${sizes[section.level]} text-gray-800`}
            style={{ textAlign: section.align as any }}
          >
            {section.text || 'Untitled Heading'}
          </Tag>
        );
      }

      case 'text':
        return (
          <p className="text-sm text-gray-600">
            {section.content || 'Empty text block'}
          </p>
        );

      case 'kpi-row': {
        const cols = section.columns ?? 4;
        return (
          <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Metric {i + 1}</div>
                <div className="text-lg font-bold text-gray-300">--</div>
              </div>
            ))}
          </div>
        );
      }

      case 'chart': {
        const entity = section.entityKey ? getEntityDefinition(section.entityKey) : null;
        return (
          <div className="rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center"
            style={{ height: Math.min(section.height ?? 200, 150) }}
          >
            <div className="text-center">
              <Icon name="pie-chart" size={32} className="text-gray-300 mx-auto mb-1" />
              {entity ? (
                <div>
                  <span className="text-xs text-gray-500 font-medium">{entity.label}</span>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {section.measureField ?? 'measure'} by {section.dimensionField ?? 'dimension'}
                    {section.overrideChartType ? ` · ${section.overrideChartType}` : ''}
                  </div>
                </div>
              ) : (
                <span className="text-xs text-gray-400">
                  Chart #{(section.chartIndex ?? 0) + 1}
                  {section.overrideChartType ? ` (${section.overrideChartType})` : ''}
                </span>
              )}
            </div>
          </div>
        );
      }

      case 'table': {
        const entity = section.entityKey ? getEntityDefinition(section.entityKey) : null;
        const fieldCount = section.selectedFields?.length ?? 0;
        return (
          <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="table2" size={14} className="text-gray-400" />
              {entity ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">{entity.label}</span>
                  <span className="text-[10px] text-gray-400 bg-gray-200 rounded px-1.5 py-0.5">
                    {fieldCount > 0 ? `${fieldCount} fields` : 'All fields'}
                  </span>
                  {section.groupByField && (
                    <span className="text-[10px] text-blue-500 bg-blue-50 rounded px-1.5 py-0.5">
                      Grouped: {section.groupByField}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-400">
                  Table #{(section.tableIndex ?? 0) + 1}
                  {section.pageSize ? ` (${section.pageSize} rows/page)` : ''}
                </span>
              )}
            </div>
            {/* Column placeholders */}
            <div className="flex gap-2">
              {Array.from({ length: Math.min(fieldCount || 4, 6) }).map((_, i) => (
                <div key={i} className="flex-1 h-3 rounded bg-gray-200" />
              ))}
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-2 mt-1">
                {Array.from({ length: Math.min(fieldCount || 4, 6) }).map((_, j) => (
                  <div key={j} className="flex-1 h-2 rounded bg-gray-100" />
                ))}
              </div>
            ))}
          </div>
        );
      }

      case 'data-field': {
        const entity = getEntityDefinition(section.entityKey);
        const field = entity?.fields.find((f) => f.key === section.fieldKey);
        return (
          <div className="flex items-center gap-3 p-2 rounded bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <Icon
                name={(field ? DATA_TYPE_ICONS[field.dataType] : 'hash') as any}
                size={16}
                className={field ? DATA_TYPE_COLORS[field.dataType] : 'text-gray-400'}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">
                {section.label || field?.label || section.fieldKey || 'Select field'}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-blue-600 bg-blue-100 rounded px-1.5 py-0.5">
                  {entity?.label ?? section.entityKey}
                </span>
                {section.aggregation && (
                  <span className="text-[10px] text-purple-600 bg-purple-50 rounded px-1.5 py-0.5">
                    {AGGREGATION_LABELS[section.aggregation as AggregationType] ?? section.aggregation}
                  </span>
                )}
                {field?.dataType && (
                  <span className="text-[10px] text-gray-400">{field.dataType}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-300">--</div>
            </div>
          </div>
        );
      }

      case 'formula':
        return (
          <div className="flex items-center gap-3 p-2 rounded bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100">
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <Icon name="percent" size={16} className="text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">
                {section.label || 'Calculated Field'}
              </div>
              <div className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                {section.expression || 'No formula defined'}
              </div>
            </div>
            {section.format && (
              <span className="text-[10px] text-amber-600 bg-amber-100 rounded px-1.5 py-0.5">
                {section.format}
              </span>
            )}
          </div>
        );

      case 'image':
        return (
          <div
            className="rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center"
            style={{
              height: Math.min(section.height ?? 80, 100),
              justifyContent: section.align === 'center' ? 'center' : section.align === 'right' ? 'flex-end' : 'flex-start',
            }}
          >
            {section.src ? (
              <div className="text-center">
                <Icon name="image" size={24} className="text-green-400 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 truncate block max-w-[200px]">
                  {section.alt || section.src.split('/').pop()}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <Icon name="image" size={24} className="text-gray-300 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400">Add image URL</span>
              </div>
            )}
          </div>
        );

      case 'group-header': {
        const entity = getEntityDefinition(section.entityKey);
        return (
          <div className="flex items-center gap-3 p-2 rounded bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <Icon name="layers" size={16} className="text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800">
                Group by: <span className="text-green-700">{section.groupByField || '—'}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-green-600 bg-green-100 rounded px-1.5 py-0.5">
                  {entity?.label ?? section.entityKey}
                </span>
                {section.showCount && (
                  <span className="text-[10px] text-gray-400">Show count</span>
                )}
                {section.showSubtotal && (
                  <span className="text-[10px] text-gray-400">Subtotal: {section.subtotalField}</span>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'summary-row':
        return (
          <div className="rounded border border-dashed border-gray-300 bg-gradient-to-r from-slate-50 to-gray-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="bar-chart" size={14} className="text-gray-500" />
              <span className="text-xs font-medium text-gray-600">Summary Row</span>
              <span className="text-[10px] text-gray-400 bg-gray-200 rounded px-1.5 py-0.5">
                {section.fields.length} {section.fields.length === 1 ? 'field' : 'fields'}
              </span>
            </div>
            {section.fields.length > 0 ? (
              <div className="flex gap-3 flex-wrap">
                {section.fields.map((f, i) => (
                  <div key={i} className="flex items-center gap-1 text-[11px] text-gray-500 bg-white rounded px-2 py-1 border border-gray-200">
                    <span className="font-medium text-gray-700">{f.label || f.fieldKey}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-purple-500">
                      {AGGREGATION_LABELS[f.aggregation as AggregationType] ?? f.aggregation}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400">No summary fields configured</p>
            )}
          </div>
        );

      case 'comparison':
        return (
          <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-3 flex items-center gap-2">
            <Icon name="git-commit" size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400">Period Comparison</span>
          </div>
        );

      case 'divider':
        return <hr className="border-gray-300 my-1" />;

      case 'spacer':
        return (
          <div
            className="border border-dashed border-gray-200 rounded flex items-center justify-center"
            style={{ height: Math.min(section.height, 60) }}
          >
            <span className="text-xs text-gray-300">{section.height}px spacer</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50/30 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-t-md border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Icon name="grip-vertical" size={14} className="text-gray-400 cursor-grab" />
          <Icon name={getSectionIcon(section.type) as any} size={14} className="text-gray-500" />
          <span className="text-xs font-medium text-gray-600">
            {getSectionLabel(section.type)}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={isFirst}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
          >
            <Icon name="chevron-up" size={12} className="text-gray-500" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={isLast}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
          >
            <Icon name="chevron-down" size={12} className="text-gray-500" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded hover:bg-red-100"
          >
            <Icon name="trash-2" size={12} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Section preview */}
      <div className="p-3">
        {renderPreview()}
      </div>
    </div>
  );
}
