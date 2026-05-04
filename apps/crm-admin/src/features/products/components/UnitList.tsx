'use client';

import { useMemo } from 'react';

import { TableFull } from '@/components/ui';
import { TableSkeleton } from '@/components/common/TableSkeleton';

import { HelpButton } from '@/components/common/HelpButton';

import { useUnitTypes } from '../hooks/useProducts';
import { UnitListUserHelp } from '../help/UnitListUserHelp';
import type { UnitTypeOption } from '../types/products.types';

// -- Columns ------------------------------------------------------------------

const UNIT_COLUMNS = [
  { id: 'value', label: 'Unit Code', visible: true },
  { id: 'label', label: 'Display Name', visible: true },
];

// -- Component ----------------------------------------------------------------

export function UnitList() {
  const { data: response, isLoading } = useUnitTypes();

  const records = (response as any)?.data ?? (response as any) ?? [];

  const tableData = useMemo(() => {
    if (!Array.isArray(records)) return [];
    return records.map((u: UnitTypeOption, idx: number) => ({
      id: `unit-${idx}`,
      value: u.value,
      label: u.label,
    }));
  }, [records]);

  if (isLoading) return <TableSkeleton />;

  return (
    <TableFull
      title="Units"
      tableKey="units"
      data={tableData}
      columns={UNIT_COLUMNS}
      defaultViewMode="table"
      defaultDensity="comfortable"
      headerActions={
        <HelpButton
          panelId="units-list-help"
          title="Units — Help"
          userContent={<UnitListUserHelp />}
        />
      }
    />
  );
}
