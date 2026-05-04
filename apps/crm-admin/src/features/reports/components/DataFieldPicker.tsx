'use client';

import { useState, useMemo } from 'react';
import { Icon, Input } from '@/components/ui';
import {
  ENTITY_DEFINITIONS,
  getFieldsByCategory,
  DATA_TYPE_ICONS,
  DATA_TYPE_COLORS,
} from '../utils/report-fields';
import type { DataField, EntityDefinition } from '../utils/report-fields';

interface DataFieldPickerProps {
  selectedEntity?: string;
  onSelectEntity: (entityKey: string) => void;
  onAddField: (entityKey: string, field: DataField) => void;
  onAddTable: (entityKey: string, fields: DataField[]) => void;
  onAddChart: (entityKey: string, measureField: DataField, dimensionField: DataField) => void;
}

export function DataFieldPicker({
  selectedEntity,
  onSelectEntity,
  onAddField,
  onAddTable,
  onAddChart,
}: DataFieldPickerProps) {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Basic', 'Financial', 'Identity']));

  const entity = useMemo(
    () => ENTITY_DEFINITIONS.find((e) => e.key === selectedEntity),
    [selectedEntity],
  );

  const fieldsByCategory = useMemo(() => {
    if (!entity) return {};
    const grouped = getFieldsByCategory(entity.key);
    if (!search.trim()) return grouped;
    const lower = search.toLowerCase();
    const filtered: Record<string, DataField[]> = {};
    for (const [cat, fields] of Object.entries(grouped)) {
      const matches = fields.filter(
        (f) =>
          f.label.toLowerCase().includes(lower) ||
          f.key.toLowerCase().includes(lower),
      );
      if (matches.length) filtered[cat] = matches;
    }
    return filtered;
  }, [entity, search]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="w-72 border-r border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-sm font-bold text-gray-800">Data Fields</h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Select entity & add fields</p>
      </div>

      {/* Entity selector */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="grid grid-cols-4 gap-1">
          {ENTITY_DEFINITIONS.map((ent) => (
            <button
              key={ent.key}
              onClick={() => onSelectEntity(ent.key)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded text-[10px] transition-all ${
                selectedEntity === ent.key
                  ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
              title={ent.label}
            >
              <Icon name={ent.icon as any} size={14} />
              <span className="truncate w-full text-center leading-tight">
                {ent.label.length > 6 ? ent.label.slice(0, 6) + '..' : ent.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {!entity ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <Icon name="database" size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Select a data source above</p>
          </div>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="px-3 py-2 border-b border-gray-100">
            <Input
              label=""
              value={search}
              onChange={setSearch}
              leftIcon={<Icon name="search" size={14} />}
            />
          </div>

          {/* Quick actions */}
          <div className="px-3 py-2 border-b border-gray-100 flex gap-2">
            <button
              onClick={() => onAddTable(entity.key, entity.fields)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-blue-50 text-blue-600 text-[11px] font-medium hover:bg-blue-100 transition-colors"
            >
              <Icon name="table2" size={12} />
              Add Table
            </button>
            <button
              onClick={() => {
                const measure = entity.fields.find((f) => f.dataType === 'currency' || f.dataType === 'number');
                const dimension = entity.fields.find((f) => f.dataType === 'string' && f.aggregations?.includes('COUNT'));
                if (measure && dimension) onAddChart(entity.key, measure, dimension);
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-green-50 text-green-600 text-[11px] font-medium hover:bg-green-100 transition-colors"
            >
              <Icon name="pie-chart" size={12} />
              Add Chart
            </button>
          </div>

          {/* Field list by category */}
          <div className="flex-1 overflow-y-auto">
            {Object.entries(fieldsByCategory).map(([category, fields]) => (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    {category}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400 bg-gray-200 rounded-full px-1.5 py-0.5">
                      {fields.length}
                    </span>
                    <Icon
                      name={expandedCategories.has(category) ? 'chevron-down' : 'chevron-right'}
                      size={12}
                      className="text-gray-400"
                    />
                  </div>
                </button>

                {expandedCategories.has(category) && (
                  <div className="py-0.5">
                    {fields.map((field) => (
                      <button
                        key={field.key}
                        onClick={() => onAddField(entity.key, field)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 transition-colors group text-left"
                      >
                        <Icon
                          name={DATA_TYPE_ICONS[field.dataType] as any}
                          size={12}
                          className={DATA_TYPE_COLORS[field.dataType]}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 truncate group-hover:text-blue-700">
                            {field.label}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Icon name="plus" size={12} className="text-blue-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
