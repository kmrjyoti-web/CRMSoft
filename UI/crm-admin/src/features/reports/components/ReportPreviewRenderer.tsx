'use client';

import { useMemo } from 'react';
import { Icon, Badge } from '@/components/ui';
import { getEntityDefinition, getSampleRows, AGGREGATION_LABELS, DATA_TYPE_ICONS, DATA_TYPE_COLORS } from '../utils/report-fields';
import { CHART_COLORS, formatMetricValue } from '../utils/report-helpers';
import type { AggregationType } from '../utils/report-fields';
import type { TemplateSection, TemplateDataSource } from '../types/report.types';

interface ReportPreviewRendererProps {
  sections: TemplateSection[];
  dataSource: TemplateDataSource;
}

// ── Formatter helpers ─────────────────────────────────────────────────

function formatSampleValue(value: unknown, format?: string): string {
  if (value == null) return '\u2014';
  const num = Number(value);
  if (isNaN(num) && typeof value === 'string') return value;
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
    case 'percent':
      return `${num.toFixed(1)}%`;
    case 'number':
      return new Intl.NumberFormat('en-IN').format(num);
    default:
      if (typeof value === 'number') return new Intl.NumberFormat('en-IN').format(num);
      return String(value);
  }
}

function computeAgg(values: number[], agg: string): number {
  if (values.length === 0) return 0;
  switch (agg) {
    case 'SUM': return values.reduce((a, b) => a + b, 0);
    case 'AVG': return values.reduce((a, b) => a + b, 0) / values.length;
    case 'MIN': return Math.min(...values);
    case 'MAX': return Math.max(...values);
    case 'COUNT': return values.length;
    case 'COUNT_DISTINCT': return new Set(values).size;
    default: return values.length;
  }
}

// ── Section preview renderers ─────────────────────────────────────────

function PreviewHeading({ section }: { section: Extract<TemplateSection, { type: 'heading' }> }) {
  const sizes = { 1: 'text-2xl font-bold', 2: 'text-xl font-semibold', 3: 'text-lg font-semibold' };
  return (
    <div style={{ textAlign: (section.align ?? 'left') as any }} className={`${sizes[section.level]} text-gray-900 pb-1 border-b border-gray-200`}>
      {section.text || 'Report Title'}
    </div>
  );
}

function PreviewText({ section }: { section: Extract<TemplateSection, { type: 'text' }> }) {
  return <p className="text-sm text-gray-600 leading-relaxed">{section.content || 'Text content goes here...'}</p>;
}

function PreviewKpiRow({ section, dataSource }: { section: Extract<TemplateSection, { type: 'kpi-row' }>; dataSource: TemplateDataSource }) {
  const cols = section.columns ?? 4;
  const rows = getSampleRows(dataSource.entityKey);
  const entity = getEntityDefinition(dataSource.entityKey);
  const numericFields = entity?.fields.filter((f) => f.dataType === 'currency' || f.dataType === 'number' || f.dataType === 'percent') ?? [];
  const displayFields = numericFields.slice(0, cols);

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {displayFields.map((field, i) => {
        const values = rows.map((r) => Number(r[field.key] ?? 0)).filter((v) => !isNaN(v));
        const total = computeAgg(values, 'SUM');
        const change = Math.round(Math.random() * 30 - 10);
        const isUp = change > 0;
        return (
          <div key={field.key} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">{field.label}</div>
            <div className="text-xl font-bold text-gray-900">
              {formatSampleValue(total, field.dataType === 'currency' ? 'currency' : field.dataType === 'percent' ? 'percent' : 'number')}
            </div>
            <div className={`flex items-center gap-1 mt-1 text-xs ${isUp ? 'text-green-600' : 'text-red-500'}`}>
              <Icon name={isUp ? 'trending-up' : 'trending-down'} size={12} />
              <span>{Math.abs(change)}% vs last period</span>
            </div>
          </div>
        );
      })}
      {/* Fill remaining slots if not enough fields */}
      {Array.from({ length: Math.max(0, cols - displayFields.length) }).map((_, i) => (
        <div key={`empty-${i}`} className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
          <div className="text-xs text-gray-400 mb-1">Metric {displayFields.length + i + 1}</div>
          <div className="text-xl font-bold text-gray-300">--</div>
        </div>
      ))}
    </div>
  );
}

function PreviewChart({ section, dataSource }: { section: Extract<TemplateSection, { type: 'chart' }>; dataSource: TemplateDataSource }) {
  const entityKey = section.entityKey || dataSource.entityKey;
  const entity = getEntityDefinition(entityKey);
  const rows = getSampleRows(entityKey);
  const chartType = section.overrideChartType ?? 'BAR';
  const dimField = section.dimensionField ?? (entity?.fields.find((f) => f.dataType === 'string' && f.aggregations?.includes('COUNT'))?.key);
  const measureField = section.measureField ?? (entity?.fields.find((f) => f.dataType === 'currency' || f.dataType === 'number')?.key);

  // Aggregate data by dimension
  const grouped = useMemo(() => {
    if (!dimField || !measureField) return [];
    const map: Record<string, number> = {};
    for (const row of rows) {
      const dim = String(row[dimField] ?? 'Other');
      const val = Number(row[measureField] ?? 0);
      map[dim] = (map[dim] ?? 0) + val;
    }
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [rows, dimField, measureField]);

  const height = Math.min(section.height ?? 250, 300);

  if (chartType === 'PIE' || chartType === 'DONUT') {
    const total = grouped.reduce((s, g) => s + g.value, 0) || 1;
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          {measureField} by {dimField}
        </h4>
        <div className="flex items-center gap-6" style={{ minHeight: height * 0.6 }}>
          {/* Donut/Pie simulation */}
          <div className="relative w-32 h-32 rounded-full flex-shrink-0" style={{
            background: `conic-gradient(${grouped.map((g, i) => {
              const start = grouped.slice(0, i).reduce((s, gg) => s + gg.value / total * 360, 0);
              const end = start + g.value / total * 360;
              return `${CHART_COLORS[i % CHART_COLORS.length]} ${start}deg ${end}deg`;
            }).join(', ')})`,
          }}>
            {chartType === 'DONUT' && (
              <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">{formatSampleValue(total, 'number')}</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            {grouped.map((g, i) => (
              <div key={g.label} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-gray-600 flex-1 truncate">{g.label}</span>
                <span className="font-medium text-gray-800">{formatSampleValue(g.value, 'number')}</span>
                <span className="text-gray-400">({(g.value / total * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Bar / Line / Area chart simulation
  const maxVal = Math.max(...grouped.map((g) => g.value), 1);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        {measureField} by {dimField}
      </h4>
      <div style={{ height }} className="flex items-end gap-2 pt-4">
        {grouped.map((g, i) => (
          <div key={g.label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-gray-600">{formatSampleValue(g.value, 'number')}</span>
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${(g.value / maxVal) * (height - 40)}px`,
                backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                minHeight: 4,
              }}
            />
            <span className="text-[10px] text-gray-500 truncate max-w-full">{g.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewTable({ section, dataSource }: { section: Extract<TemplateSection, { type: 'table' }>; dataSource: TemplateDataSource }) {
  const entityKey = section.entityKey || dataSource.entityKey;
  const entity = getEntityDefinition(entityKey);
  const rows = getSampleRows(entityKey, section.pageSize ?? 10);
  const allFields = entity?.fields ?? [];
  const displayFields = section.selectedFields
    ? allFields.filter((f) => section.selectedFields!.includes(f.key))
    : allFields.slice(0, 8);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">{entity?.label ?? entityKey}</span>
        <span className="text-[10px] text-gray-400">{rows.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              {displayFields.map((f) => (
                <th key={f.key} className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-gray-100 hover:bg-blue-50/30">
                {displayFields.map((f) => {
                  const val = row[f.key];
                  let display = String(val ?? '\u2014');
                  if (f.dataType === 'currency' && typeof val === 'number') display = formatSampleValue(val, 'currency');
                  else if (f.dataType === 'percent' && typeof val === 'number') display = `${val}%`;
                  else if (f.dataType === 'enum' && typeof val === 'string') {
                    return (
                      <td key={f.key} className="px-3 py-2">
                        <Badge variant="outline" className="text-[10px]">{val}</Badge>
                      </td>
                    );
                  }
                  return (
                    <td key={f.key} className="px-3 py-2 text-gray-700 whitespace-nowrap">{display}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PreviewDataField({ section }: { section: Extract<TemplateSection, { type: 'data-field' }> }) {
  const entity = getEntityDefinition(section.entityKey);
  const field = entity?.fields.find((f) => f.key === section.fieldKey);
  const rows = getSampleRows(section.entityKey);
  const values = rows.map((r) => Number(r[section.fieldKey] ?? 0)).filter((v) => !isNaN(v));
  const result = section.aggregation ? computeAgg(values, section.aggregation) : values[0] ?? 0;
  const fmt = section.format ?? (field?.dataType === 'currency' ? 'currency' : field?.dataType === 'percent' ? 'percent' : 'number');

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon name={(field ? DATA_TYPE_ICONS[field.dataType] : 'hash') as any} size={20} className={field ? DATA_TYPE_COLORS[field.dataType] : 'text-gray-400'} />
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-500">{section.label || field?.label || section.fieldKey}</div>
        <div className="text-2xl font-bold text-gray-900">{formatSampleValue(result, fmt)}</div>
      </div>
      {section.aggregation && (
        <span className="text-[10px] text-purple-600 bg-purple-50 rounded px-2 py-0.5">
          {AGGREGATION_LABELS[section.aggregation as AggregationType]}
        </span>
      )}
    </div>
  );
}

function PreviewFormula({ section }: { section: Extract<TemplateSection, { type: 'formula' }> }) {
  // Show a sample calculated value
  const sampleValue = section.format === 'percent' ? 24.5 : section.format === 'currency' ? 187500 : 42;
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
        <Icon name="percent" size={20} className="text-amber-600" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-500">{section.label}</div>
        <div className="text-2xl font-bold text-gray-900">{formatSampleValue(sampleValue, section.format)}</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-gray-400 font-mono max-w-[180px] truncate">{section.expression}</div>
      </div>
    </div>
  );
}

function PreviewGroupHeader({ section }: { section: Extract<TemplateSection, { type: 'group-header' }> }) {
  const rows = getSampleRows(section.entityKey);
  const groupValues = [...new Set(rows.map((r) => String(r[section.groupByField] ?? 'Unknown')))];
  const firstGroup = groupValues[0] ?? 'Group Value';
  const count = rows.filter((r) => String(r[section.groupByField]) === firstGroup).length;

  return (
    <div className="rounded-xl border border-green-200 bg-green-50/50 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Icon name="layers" size={18} className="text-green-600" />
        <span className="text-base font-semibold text-gray-800">{firstGroup}</span>
        {section.showCount && (
          <Badge variant="outline" className="text-[10px]">{count} records</Badge>
        )}
      </div>
      {section.showSubtotal && section.subtotalField && (
        <div className="mt-1 text-xs text-gray-500 ml-8">
          Subtotal ({section.subtotalField}): {formatSampleValue(
            computeAgg(rows.filter((r) => String(r[section.groupByField]) === firstGroup).map((r) => Number(r[section.subtotalField!] ?? 0)), 'SUM'),
            'currency',
          )}
        </div>
      )}
    </div>
  );
}

function PreviewSummaryRow({ section, dataSource }: { section: Extract<TemplateSection, { type: 'summary-row' }>; dataSource: TemplateDataSource }) {
  const rows = getSampleRows(dataSource.entityKey);

  return (
    <div className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-6 flex-wrap">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Totals</span>
        {section.fields.map((f, i) => {
          const values = rows.map((r) => Number(r[f.fieldKey] ?? 0)).filter((v) => !isNaN(v));
          const result = computeAgg(values, f.aggregation);
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{f.label || f.fieldKey}:</span>
              <span className="text-sm font-bold text-gray-800">{formatSampleValue(result, 'number')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PreviewImage({ section }: { section: Extract<TemplateSection, { type: 'image' }> }) {
  return (
    <div style={{ textAlign: (section.align ?? 'left') as any }}>
      {section.src ? (
        <img
          src={section.src}
          alt={section.alt ?? ''}
          style={{ width: section.width ?? 200, height: section.height ?? 80, objectFit: 'contain' }}
          className="inline-block rounded border border-gray-200"
        />
      ) : (
        <div
          className="inline-flex items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50"
          style={{ width: section.width ?? 200, height: section.height ?? 80 }}
        >
          <div className="text-center">
            <Icon name="image" size={24} className="text-gray-300 mx-auto mb-1" />
            <span className="text-[10px] text-gray-400">Logo / Image</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main renderer ─────────────────────────────────────────────────────

export function ReportPreviewRenderer({ sections, dataSource }: ReportPreviewRendererProps) {
  return (
    <div className="space-y-4">
      {sections.map((section) => {
        switch (section.type) {
          case 'heading':
            return <PreviewHeading key={section.id} section={section} />;
          case 'text':
            return <PreviewText key={section.id} section={section} />;
          case 'kpi-row':
            return <PreviewKpiRow key={section.id} section={section} dataSource={dataSource} />;
          case 'chart':
            return <PreviewChart key={section.id} section={section} dataSource={dataSource} />;
          case 'table':
            return <PreviewTable key={section.id} section={section} dataSource={dataSource} />;
          case 'data-field':
            return <PreviewDataField key={section.id} section={section} />;
          case 'formula':
            return <PreviewFormula key={section.id} section={section} />;
          case 'group-header':
            return <PreviewGroupHeader key={section.id} section={section} />;
          case 'summary-row':
            return <PreviewSummaryRow key={section.id} section={section} dataSource={dataSource} />;
          case 'image':
            return <PreviewImage key={section.id} section={section} />;
          case 'comparison':
            return (
              <div key={section.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="git-commit" size={16} className="text-blue-500" />
                  <span className="text-sm font-semibold text-gray-700">Period Comparison</span>
                </div>
                <p className="text-xs text-gray-400">Comparison data will render when connected to a report</p>
              </div>
            );
          case 'divider':
            return <hr key={section.id} className="border-gray-300" />;
          case 'spacer':
            return <div key={section.id} style={{ height: section.height }} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
