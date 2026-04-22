'use client';

import { SelectInput, NumberInput, Icon } from '@/components/ui';
import {
  ENTITY_DEFINITIONS,
  getGroupableFields,
  getEntityFields,
} from '../utils/report-fields';
import { FilterBuilder } from './FilterBuilder';
import type { TemplateDataSource, TemplateFilter } from '../types/report.types';

interface DataSourceConfigProps {
  dataSource: TemplateDataSource;
  onChange: (ds: TemplateDataSource) => void;
}

const SORT_DIR_OPTIONS = [
  { label: 'Ascending (A-Z)', value: 'asc' },
  { label: 'Descending (Z-A)', value: 'desc' },
];

export function DataSourceConfig({ dataSource, onChange }: DataSourceConfigProps) {
  const entityOptions = ENTITY_DEFINITIONS.map((e) => ({
    label: e.label,
    value: e.key,
  }));

  const allFields = getEntityFields(dataSource.entityKey);
  const groupableFields = getGroupableFields(dataSource.entityKey);

  const fieldOptions = [
    { label: 'None', value: '' },
    ...allFields.map((f) => ({ label: f.label, value: f.key })),
  ];

  const groupOptions = [
    { label: 'None', value: '' },
    ...groupableFields.map((f) => ({ label: f.label, value: f.key })),
  ];

  return (
    <div className="space-y-5">
      {/* Entity selector */}
      <div>
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Icon name="database" size={13} className="text-gray-400" />
          Data Source
        </h4>
        <SelectInput
          label="Entity"
          options={entityOptions}
          value={dataSource.entityKey}
          onChange={(v) =>
            onChange({
              ...dataSource,
              entityKey: String(v ?? 'leads'),
              filters: [],
              sortField: undefined,
              groupByField: undefined,
            })
          }
          leftIcon={<Icon name="database" size={16} />}
        />
      </div>

      {/* Group By */}
      <div>
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Icon name="layers" size={13} className="text-gray-400" />
          Grouping
        </h4>
        <SelectInput
          label="Group By"
          options={groupOptions}
          value={dataSource.groupByField ?? ''}
          onChange={(v) =>
            onChange({ ...dataSource, groupByField: String(v) || undefined })
          }
        />
      </div>

      {/* Sort */}
      <div>
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Icon name="arrow-up" size={13} className="text-gray-400" />
          Sorting
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <SelectInput
            label="Sort Field"
            options={fieldOptions}
            value={dataSource.sortField ?? ''}
            onChange={(v) =>
              onChange({ ...dataSource, sortField: String(v) || undefined })
            }
          />
          <SelectInput
            label="Direction"
            options={SORT_DIR_OPTIONS}
            value={dataSource.sortDirection ?? 'asc'}
            onChange={(v) =>
              onChange({ ...dataSource, sortDirection: String(v) as any })
            }
          />
        </div>
      </div>

      {/* Row Limit */}
      <div>
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Icon name="hash" size={13} className="text-gray-400" />
          Limit
        </h4>
        <NumberInput
          label="Max Rows"
          value={dataSource.limit ?? 1000}
          onChange={(v) => onChange({ ...dataSource, limit: v ?? 1000 })}
        />
      </div>

      {/* Filters */}
      <FilterBuilder
        entityKey={dataSource.entityKey}
        filters={dataSource.filters ?? []}
        onChange={(filters) => onChange({ ...dataSource, filters })}
      />
    </div>
  );
}
