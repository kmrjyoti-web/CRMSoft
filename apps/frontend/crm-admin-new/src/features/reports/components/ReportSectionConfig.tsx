'use client';

import { useState, useCallback } from 'react';
import { Input, SelectInput, NumberInput, Button, Icon } from '@/components/ui';
import {
  ENTITY_DEFINITIONS,
  getEntityFields,
  getNumericFields,
  getGroupableFields,
  AGGREGATION_LABELS,
  DATA_TYPE_ICONS,
  DATA_TYPE_COLORS,
  getFormulasByCategory,
} from '../utils/report-fields';
import type { AggregationType, FormulaTemplate } from '../utils/report-fields';
import type { TemplateSection, ChartType } from '../types/report.types';

interface ReportSectionConfigProps {
  section: TemplateSection;
  chartCount: number;
  tableCount: number;
  onUpdate: (updated: TemplateSection) => void;
  onClose: () => void;
}

const CHART_TYPE_OPTIONS = [
  { label: 'Bar', value: 'BAR' },
  { label: 'Line', value: 'LINE' },
  { label: 'Pie', value: 'PIE' },
  { label: 'Donut', value: 'DONUT' },
  { label: 'Area', value: 'AREA' },
  { label: 'Stacked Bar', value: 'STACKED_BAR' },
  { label: 'Funnel', value: 'FUNNEL' },
  { label: 'Table', value: 'TABLE' },
];

const HEADING_LEVEL_OPTIONS = [
  { label: 'H1 - Large', value: 1 },
  { label: 'H2 - Medium', value: 2 },
  { label: 'H3 - Small', value: 3 },
];

const ALIGN_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];

const COLUMN_OPTIONS = [
  { label: '2 Columns', value: 2 },
  { label: '3 Columns', value: 3 },
  { label: '4 Columns', value: 4 },
  { label: '5 Columns', value: 5 },
];

const FORMAT_OPTIONS = [
  { label: 'Number', value: 'number' },
  { label: 'Currency', value: 'currency' },
  { label: 'Percent', value: 'percent' },
];

const SORT_DIR_OPTIONS = [
  { label: 'Ascending', value: 'asc' },
  { label: 'Descending', value: 'desc' },
];

const ENTITY_OPTIONS = [
  { label: 'None (use report data)', value: '' },
  ...ENTITY_DEFINITIONS.map((e) => ({ label: e.label, value: e.key })),
];

export function ReportSectionConfig({
  section,
  chartCount,
  tableCount,
  onUpdate,
  onClose,
}: ReportSectionConfigProps) {
  const chartIndexOptions = Array.from({ length: Math.max(chartCount, 5) }, (_, i) => ({
    label: `Chart #${i + 1}`,
    value: i,
  }));

  const tableIndexOptions = Array.from({ length: Math.max(tableCount, 5) }, (_, i) => ({
    label: `Table #${i + 1}`,
    value: i,
  }));

  const renderConfig = () => {
    switch (section.type) {
      case 'heading':
        return (
          <div className="space-y-4">
            <Input
              label="Heading Text"
              value={section.text}
              onChange={(v) => onUpdate({ ...section, text: v })}
            />
            <SelectInput
              label="Level"
              options={HEADING_LEVEL_OPTIONS}
              value={section.level}
              onChange={(v) => onUpdate({ ...section, level: Number(v) as 1 | 2 | 3 })}
            />
            <SelectInput
              label="Alignment"
              options={ALIGN_OPTIONS}
              value={section.align ?? 'left'}
              onChange={(v) => onUpdate({ ...section, align: String(v) as any })}
            />
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={4}
                value={section.content}
                onChange={(e) => onUpdate({ ...section, content: e.target.value })}
              />
            </div>
          </div>
        );

      case 'kpi-row':
        return (
          <div className="space-y-4">
            <SelectInput
              label="Columns"
              options={COLUMN_OPTIONS}
              value={section.columns ?? 4}
              onChange={(v) => onUpdate({ ...section, columns: Number(v) as any })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metric Keys (comma-separated, leave empty for all)
              </label>
              <Input
                label="Metric Keys"
                value={section.metricKeys?.join(', ') ?? ''}
                onChange={(v) =>
                  onUpdate({
                    ...section,
                    metricKeys: v.trim() ? v.split(',').map((k) => k.trim()) : undefined,
                  })
                }
              />
            </div>
          </div>
        );

      case 'chart': {
        const entityKey = section.entityKey ?? '';
        const numericFields = entityKey ? getNumericFields(entityKey) : [];
        const groupFields = entityKey ? getGroupableFields(entityKey) : [];

        const measureOptions = numericFields.map((f) => ({ label: f.label, value: f.key }));
        const dimensionOptions = groupFields.map((f) => ({ label: f.label, value: f.key }));

        const selectedMeasureField = numericFields.find((f) => f.key === section.measureField);
        const aggOptions = selectedMeasureField?.aggregations?.map((a) => ({
          label: AGGREGATION_LABELS[a],
          value: a,
        })) ?? [];

        return (
          <div className="space-y-4">
            <SectionLabel label="Data Source" icon="database" />

            <SelectInput
              label="Entity"
              options={ENTITY_OPTIONS}
              value={entityKey}
              onChange={(v) =>
                onUpdate({
                  ...section,
                  entityKey: String(v) || undefined,
                  measureField: undefined,
                  dimensionField: undefined,
                })
              }
            />

            {entityKey && (
              <>
                <SelectInput
                  label="Measure Field"
                  options={[{ label: 'Select field...', value: '' }, ...measureOptions]}
                  value={section.measureField ?? ''}
                  onChange={(v) => onUpdate({ ...section, measureField: String(v) || undefined })}
                />
                {section.measureField && aggOptions.length > 0 && (
                  <SelectInput
                    label="Aggregation"
                    options={aggOptions}
                    value={section.measureAggregation ?? 'SUM'}
                    onChange={(v) => onUpdate({ ...section, measureAggregation: String(v) })}
                  />
                )}
                <SelectInput
                  label="Dimension Field (X-axis)"
                  options={[{ label: 'Select field...', value: '' }, ...dimensionOptions]}
                  value={section.dimensionField ?? ''}
                  onChange={(v) => onUpdate({ ...section, dimensionField: String(v) || undefined })}
                />
              </>
            )}

            {!entityKey && (
              <SelectInput
                label="Chart Source (from report data)"
                options={chartIndexOptions}
                value={section.chartIndex ?? 0}
                onChange={(v) => onUpdate({ ...section, chartIndex: Number(v) })}
              />
            )}

            <SectionLabel label="Appearance" icon="palette" />

            <SelectInput
              label="Chart Type"
              options={[{ label: 'Auto (from data)', value: '' }, ...CHART_TYPE_OPTIONS]}
              value={section.overrideChartType ?? ''}
              onChange={(v) =>
                onUpdate({
                  ...section,
                  overrideChartType: v ? (String(v) as ChartType) : undefined,
                })
              }
            />
            <NumberInput
              label="Height (px)"
              value={section.height ?? 320}
              onChange={(v) => onUpdate({ ...section, height: v ?? 320 })}
            />
          </div>
        );
      }

      case 'table': {
        const entityKey = section.entityKey ?? '';
        const allFields = entityKey ? getEntityFields(entityKey) : [];
        const groupFields = entityKey ? getGroupableFields(entityKey) : [];

        return (
          <div className="space-y-4">
            <SectionLabel label="Data Source" icon="database" />

            <SelectInput
              label="Entity"
              options={ENTITY_OPTIONS}
              value={entityKey}
              onChange={(v) =>
                onUpdate({
                  ...section,
                  entityKey: String(v) || undefined,
                  selectedFields: undefined,
                  sortField: undefined,
                  groupByField: undefined,
                })
              }
            />

            {entityKey && allFields.length > 0 && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Select Columns ({section.selectedFields?.length ?? 0} selected)
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {allFields.map((field) => {
                      const isChecked = section.selectedFields?.includes(field.key) ?? false;
                      return (
                        <label
                          key={field.key}
                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const current = section.selectedFields ?? allFields.map((f) => f.key);
                              const next = isChecked
                                ? current.filter((k) => k !== field.key)
                                : [...current, field.key];
                              onUpdate({ ...section, selectedFields: next });
                            }}
                            className="rounded border-gray-300"
                          />
                          <Icon
                            name={DATA_TYPE_ICONS[field.dataType] as any}
                            size={12}
                            className={DATA_TYPE_COLORS[field.dataType]}
                          />
                          <span className="text-xs text-gray-700">{field.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <SelectInput
                  label="Group By"
                  options={[{ label: 'None', value: '' }, ...groupFields.map((f) => ({ label: f.label, value: f.key }))]}
                  value={section.groupByField ?? ''}
                  onChange={(v) => onUpdate({ ...section, groupByField: String(v) || undefined })}
                />

                <div className="grid grid-cols-2 gap-2">
                  <SelectInput
                    label="Sort By"
                    options={[{ label: 'None', value: '' }, ...allFields.map((f) => ({ label: f.label, value: f.key }))]}
                    value={section.sortField ?? ''}
                    onChange={(v) => onUpdate({ ...section, sortField: String(v) || undefined })}
                  />
                  <SelectInput
                    label="Direction"
                    options={SORT_DIR_OPTIONS}
                    value={section.sortDirection ?? 'asc'}
                    onChange={(v) => onUpdate({ ...section, sortDirection: String(v) as any })}
                  />
                </div>
              </>
            )}

            {!entityKey && (
              <>
                <SelectInput
                  label="Table Source (from report data)"
                  options={tableIndexOptions}
                  value={section.tableIndex ?? 0}
                  onChange={(v) => onUpdate({ ...section, tableIndex: Number(v) })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visible Columns (comma-separated, leave empty for all)
                  </label>
                  <Input
                    label="Column Keys"
                    value={section.visibleColumns?.join(', ') ?? ''}
                    onChange={(v) =>
                      onUpdate({
                        ...section,
                        visibleColumns: v.trim() ? v.split(',').map((k) => k.trim()) : undefined,
                      })
                    }
                  />
                </div>
              </>
            )}

            <NumberInput
              label="Rows Per Page"
              value={section.pageSize ?? 25}
              onChange={(v) => onUpdate({ ...section, pageSize: v ?? 25 })}
            />
          </div>
        );
      }

      case 'data-field': {
        const entityOptions = ENTITY_DEFINITIONS.map((e) => ({ label: e.label, value: e.key }));
        const fields = section.entityKey ? getEntityFields(section.entityKey) : [];
        const fieldOptions = fields.map((f) => ({ label: f.label, value: f.key }));
        const selectedField = fields.find((f) => f.key === section.fieldKey);
        const aggOptions = selectedField?.aggregations?.map((a) => ({
          label: AGGREGATION_LABELS[a],
          value: a,
        })) ?? [];

        return (
          <div className="space-y-4">
            <SectionLabel label="Field Configuration" icon="hash" />

            <SelectInput
              label="Entity"
              options={entityOptions}
              value={section.entityKey}
              onChange={(v) =>
                onUpdate({ ...section, entityKey: String(v), fieldKey: '', aggregation: undefined })
              }
            />

            {fields.length > 0 && (
              <SelectInput
                label="Field"
                options={[{ label: 'Select field...', value: '' }, ...fieldOptions]}
                value={section.fieldKey}
                onChange={(v) => {
                  const f = fields.find((ff) => ff.key === String(v));
                  onUpdate({
                    ...section,
                    fieldKey: String(v),
                    label: f?.label ?? section.label,
                    aggregation: f?.aggregations?.[0],
                  });
                }}
              />
            )}

            <Input
              label="Display Label"
              value={section.label ?? ''}
              onChange={(v) => onUpdate({ ...section, label: v })}
            />

            {aggOptions.length > 0 && (
              <SelectInput
                label="Aggregation"
                options={[{ label: 'None (raw value)', value: '' }, ...aggOptions]}
                value={section.aggregation ?? ''}
                onChange={(v) => onUpdate({ ...section, aggregation: String(v) || undefined })}
              />
            )}

            <SelectInput
              label="Display Format"
              options={[{ label: 'Auto', value: '' }, ...FORMAT_OPTIONS]}
              value={section.format ?? ''}
              onChange={(v) => onUpdate({ ...section, format: String(v) || undefined })}
            />
          </div>
        );
      }

      case 'formula':
        return (
          <div className="space-y-4">
            <SectionLabel label="Formula Configuration" icon="percent" />

            {/* Predefined formula suggestions */}
            <FormulaSuggestions
              onSelect={(formula) =>
                onUpdate({
                  ...section,
                  label: formula.label,
                  expression: formula.expression,
                  format: formula.format,
                })
              }
            />

            <Input
              label="Label"
              value={section.label}
              onChange={(v) => onUpdate({ ...section, label: v })}
            />

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expression</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
                value={section.expression}
                onChange={(e) => onUpdate({ ...section, expression: e.target.value })}
                placeholder="e.g., {totalAmount} - {paidAmount}"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Use {'{fieldKey}'} to reference data fields
              </p>
            </div>

            <SelectInput
              label="Format"
              options={FORMAT_OPTIONS}
              value={section.format ?? 'number'}
              onChange={(v) => onUpdate({ ...section, format: String(v) as any })}
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <SectionLabel label="Image Configuration" icon="image" />

            <Input
              label="Image URL"
              value={section.src}
              onChange={(v) => onUpdate({ ...section, src: v })}
            />
            <Input
              label="Alt Text"
              value={section.alt ?? ''}
              onChange={(v) => onUpdate({ ...section, alt: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Width (px)"
                value={section.width ?? 200}
                onChange={(v) => onUpdate({ ...section, width: v ?? undefined })}
              />
              <NumberInput
                label="Height (px)"
                value={section.height ?? 80}
                onChange={(v) => onUpdate({ ...section, height: v ?? undefined })}
              />
            </div>
            <SelectInput
              label="Alignment"
              options={ALIGN_OPTIONS}
              value={section.align ?? 'left'}
              onChange={(v) => onUpdate({ ...section, align: String(v) as any })}
            />
          </div>
        );

      case 'group-header': {
        const entityOptions = ENTITY_DEFINITIONS.map((e) => ({ label: e.label, value: e.key }));
        const groupFields = section.entityKey ? getGroupableFields(section.entityKey) : [];
        const numericFields = section.entityKey ? getNumericFields(section.entityKey) : [];
        const groupOptions = groupFields.map((f) => ({ label: f.label, value: f.key }));
        const subtotalOptions = numericFields.map((f) => ({ label: f.label, value: f.key }));

        return (
          <div className="space-y-4">
            <SectionLabel label="Group Header Configuration" icon="layers" />

            <SelectInput
              label="Entity"
              options={entityOptions}
              value={section.entityKey}
              onChange={(v) =>
                onUpdate({ ...section, entityKey: String(v), groupByField: '', subtotalField: undefined })
              }
            />

            {groupOptions.length > 0 && (
              <SelectInput
                label="Group By Field"
                options={[{ label: 'Select field...', value: '' }, ...groupOptions]}
                value={section.groupByField}
                onChange={(v) => onUpdate({ ...section, groupByField: String(v) })}
              />
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.showCount ?? false}
                  onChange={(e) => onUpdate({ ...section, showCount: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show record count</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.showSubtotal ?? false}
                  onChange={(e) => onUpdate({ ...section, showSubtotal: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show subtotal</span>
              </label>
            </div>

            {section.showSubtotal && subtotalOptions.length > 0 && (
              <SelectInput
                label="Subtotal Field"
                options={subtotalOptions}
                value={section.subtotalField ?? ''}
                onChange={(v) => onUpdate({ ...section, subtotalField: String(v) || undefined })}
              />
            )}
          </div>
        );
      }

      case 'summary-row': {
        return (
          <div className="space-y-4">
            <SectionLabel label="Summary Row" icon="bar-chart" />
            <SummaryFieldsEditor
              fields={section.fields}
              onChange={(fields) => onUpdate({ ...section, fields })}
            />
          </div>
        );
      }

      case 'spacer':
        return (
          <NumberInput
            label="Height (px)"
            value={section.height}
            onChange={(v) => onUpdate({ ...section, height: v ?? 24 })}
          />
        );

      case 'comparison':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metric Keys (comma-separated, leave empty for all)
            </label>
            <Input
              label="Metric Keys"
              value={section.metricKeys?.join(', ') ?? ''}
              onChange={(v) =>
                onUpdate({
                  ...section,
                  metricKeys: v.trim() ? v.split(',').map((k) => k.trim()) : undefined,
                })
              }
            />
          </div>
        );

      case 'divider':
        return <p className="text-sm text-gray-500">No configuration needed.</p>;

      default:
        return null;
    }
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Section Settings</h3>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Done
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {renderConfig()}
      </div>
    </div>
  );
}

// ── Small sub-components ──────────────────────────────────────────────

function SectionLabel({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 pt-1 pb-2 border-b border-gray-100 mb-2">
      <Icon name={icon as any} size={14} className="text-gray-400" />
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

interface SummaryFieldEntry {
  fieldKey: string;
  aggregation: string;
  label?: string;
}

function SummaryFieldsEditor({
  fields,
  onChange,
}: {
  fields: SummaryFieldEntry[];
  onChange: (fields: SummaryFieldEntry[]) => void;
}) {
  const [entityKey, setEntityKey] = useState('leads');
  const entityFields = getEntityFields(entityKey);
  const numericFields = getNumericFields(entityKey);

  const addField = useCallback(() => {
    const first = numericFields[0];
    if (!first) return;
    onChange([...fields, { fieldKey: first.key, aggregation: 'SUM', label: first.label }]);
  }, [fields, numericFields, onChange]);

  const removeField = useCallback(
    (idx: number) => {
      onChange(fields.filter((_, i) => i !== idx));
    },
    [fields, onChange],
  );

  const updateField = useCallback(
    (idx: number, update: Partial<SummaryFieldEntry>) => {
      onChange(fields.map((f, i) => (i === idx ? { ...f, ...update } : f)));
    },
    [fields, onChange],
  );

  const fieldOptions = numericFields.map((f) => ({ label: f.label, value: f.key }));

  return (
    <div className="space-y-3">
      <SelectInput
        label="Entity"
        options={ENTITY_DEFINITIONS.map((e) => ({ label: e.label, value: e.key }))}
        value={entityKey}
        onChange={(v) => setEntityKey(String(v))}
      />

      {fields.map((entry, idx) => {
        const field = entityFields.find((f) => f.key === entry.fieldKey);
        const aggOpts = field?.aggregations?.map((a) => ({
          label: AGGREGATION_LABELS[a],
          value: a,
        })) ?? Object.entries(AGGREGATION_LABELS).map(([v, l]) => ({ label: l, value: v }));

        return (
          <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex-1 space-y-2">
              <SelectInput
                label="Field"
                options={fieldOptions}
                value={entry.fieldKey}
                onChange={(v) => {
                  const f = numericFields.find((ff) => ff.key === String(v));
                  updateField(idx, { fieldKey: String(v), label: f?.label ?? entry.label });
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <SelectInput
                  label="Aggregation"
                  options={aggOpts}
                  value={entry.aggregation}
                  onChange={(v) => updateField(idx, { aggregation: String(v) })}
                />
                <Input
                  label="Label"
                  value={entry.label ?? ''}
                  onChange={(v) => updateField(idx, { label: v })}
                />
              </div>
            </div>
            <button
              onClick={() => removeField(idx)}
              className="mt-6 p-1.5 rounded hover:bg-red-100 transition-colors"
            >
              <Icon name="x" size={14} className="text-red-400" />
            </button>
          </div>
        );
      })}

      <Button size="sm" variant="outline" onClick={addField} className="w-full">
        <Icon name="plus" size={14} className="mr-1" />
        Add Summary Field
      </Button>
    </div>
  );
}

// ── Formula Suggestions ───────────────────────────────────────────────

function FormulaSuggestions({ onSelect }: { onSelect: (formula: FormulaTemplate) => void }) {
  const [expanded, setExpanded] = useState(false);
  const formulasByCategory = getFormulasByCategory();

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon name="zap" size={14} className="text-blue-500" />
          <span className="text-xs font-semibold text-blue-700">Suggested Formulas</span>
        </div>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={14} className="text-blue-400" />
      </button>

      {expanded && (
        <div className="border-t border-blue-200 max-h-64 overflow-y-auto">
          {Object.entries(formulasByCategory).map(([category, formulas]) => (
            <div key={category}>
              <div className="px-3 py-1 bg-blue-100/50">
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                  {category}
                </span>
              </div>
              {formulas.map((formula) => (
                <button
                  key={formula.id}
                  onClick={() => {
                    onSelect(formula);
                    setExpanded(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-100/50 transition-colors border-b border-blue-100 last:border-0"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-gray-800">{formula.label}</span>
                    <span className="text-[10px] text-blue-500 bg-blue-100 rounded px-1.5 py-0.5">
                      {formula.format}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">{formula.description}</p>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
