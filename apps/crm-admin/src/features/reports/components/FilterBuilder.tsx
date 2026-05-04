'use client';

import { useCallback } from 'react';
import { Input, SelectInput, Button, Icon } from '@/components/ui';
import {
  getEntityFields,
  FILTER_OPERATORS,
  DATA_TYPE_ICONS,
  DATA_TYPE_COLORS,
} from '../utils/report-fields';
import type { TemplateFilter } from '../types/report.types';

interface FilterBuilderProps {
  entityKey: string;
  filters: TemplateFilter[];
  onChange: (filters: TemplateFilter[]) => void;
}

export function FilterBuilder({ entityKey, filters, onChange }: FilterBuilderProps) {
  const fields = getEntityFields(entityKey);

  const fieldOptions = fields.map((f) => ({
    label: f.label,
    value: f.key,
  }));

  const addFilter = useCallback(() => {
    const firstField = fields[0];
    if (!firstField) return;
    const operators = FILTER_OPERATORS[firstField.dataType];
    onChange([
      ...filters,
      { fieldKey: firstField.key, operator: operators[0].value, value: '' },
    ]);
  }, [fields, filters, onChange]);

  const removeFilter = useCallback(
    (index: number) => {
      onChange(filters.filter((_, i) => i !== index));
    },
    [filters, onChange],
  );

  const updateFilter = useCallback(
    (index: number, update: Partial<TemplateFilter>) => {
      onChange(
        filters.map((f, i) => (i === index ? { ...f, ...update } : f)),
      );
    },
    [filters, onChange],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Filters
        </h4>
        <Button size="sm" variant="ghost" onClick={addFilter}>
          <Icon name="plus" size={14} className="mr-1" />
          Add Filter
        </Button>
      </div>

      {filters.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">
          No filters applied
        </p>
      ) : (
        <div className="space-y-2">
          {filters.map((filter, idx) => {
            const field = fields.find((f) => f.key === filter.fieldKey);
            const operators = field
              ? FILTER_OPERATORS[field.dataType]
              : FILTER_OPERATORS.string;
            const operatorOptions = operators.map((o) => ({
              label: o.label,
              value: o.value,
            }));

            const isValueless =
              filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty';
            const showSecondValue =
              filter.operator === 'between';

            return (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <SelectInput
                    label="Field"
                    options={fieldOptions}
                    value={filter.fieldKey}
                    onChange={(v) => {
                      const newField = fields.find((f) => f.key === String(v));
                      const newOps = newField
                        ? FILTER_OPERATORS[newField.dataType]
                        : FILTER_OPERATORS.string;
                      updateFilter(idx, {
                        fieldKey: String(v ?? ''),
                        operator: newOps[0].value,
                        value: '',
                      });
                    }}
                  />
                  <SelectInput
                    label="Operator"
                    options={operatorOptions}
                    value={filter.operator}
                    onChange={(v) =>
                      updateFilter(idx, { operator: String(v ?? '') })
                    }
                  />
                  {!isValueless && (
                    <div className="flex gap-1">
                      <Input
                        label="Value"
                        value={String(filter.value ?? '')}
                        onChange={(v) => updateFilter(idx, { value: v })}
                      />
                      {showSecondValue && (
                        <Input
                          label="To"
                          value={String(filter.value2 ?? '')}
                          onChange={(v) => updateFilter(idx, { value2: v })}
                        />
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFilter(idx)}
                  className="mt-6 p-1.5 rounded hover:bg-red-100 transition-colors"
                >
                  <Icon name="x" size={14} className="text-red-400" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
