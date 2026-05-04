'use client';

import { useMemo } from 'react';

import { TableFull } from '@/components/ui';
import { TableSkeleton } from '@/components/common/TableSkeleton';
import { useTableFilters } from '@/hooks/useTableFilters';
import { useEntityPanel } from '@/hooks/useEntityPanel';
import { formatDate } from '@/lib/format-date';

import { HelpButton } from '@/components/common/HelpButton';

import { usePackagesList, useDeletePackage } from '../hooks/useProducts';
import { PackageForm } from './PackageForm';
import { PackageListUserHelp } from '../help/PackageListUserHelp';
import { PackageListDevHelp } from '../help/PackageListDevHelp';
import type { PackageItem, ListParams } from '../types/products.types';

// -- Columns ------------------------------------------------------------------

const PKG_COLUMNS = [
  { id: 'name', label: 'Name', visible: true },
  { id: 'code', label: 'Code', visible: true },
  { id: 'type', label: 'Type', visible: true },
  { id: 'description', label: 'Description', visible: true },
  { id: 'isActive', label: 'Active', visible: true },
  { id: 'createdAt', label: 'Created', visible: false },
];

// -- Filter config ------------------------------------------------------------

const PKG_FILTER_CONFIG = {
  sections: [
    {
      title: 'Package Filters',
      defaultOpen: true,
      filters: [
        {
          columnId: 'isActive',
          label: 'Status',
          filterType: 'master' as const,
          queryParam: 'isActive',
          options: [
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ],
        },
      ],
    },
  ],
};

// -- Component ----------------------------------------------------------------

export function PackageList() {
  const { filterParams } = useTableFilters(PKG_FILTER_CONFIG);

  const params: ListParams = {
    ...filterParams,
    limit: 100,
  };

  const { data: response, isLoading } = usePackagesList(params);
  const deletePkg = useDeletePackage();

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: 'package',
    entityLabel: 'Package',
    FormComponent: PackageForm,
    idProp: 'packageId',
    editRoute: '/products/packages/:id',
    createRoute: '/products/packages/new',
    displayField: 'name',
  });

  const records = (response as any)?.data ?? (response as any) ?? [];

  const tableData = useMemo(() => {
    if (!Array.isArray(records)) return [];
    return records.map((p: PackageItem) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      type: p.type ?? '—',
      description: p.description ?? '—',
      isActive: p.isActive ? 'Active' : 'Inactive',
      createdAt: formatDate(p.createdAt, 'dd MMM yyyy'),
    }));
  }, [records]);

  const handleRowDelete = (row: any) => {
    if (confirm(`Deactivate package "${row.name}"?`)) {
      deletePkg.mutate(row.id);
    }
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <TableFull
      title="Packages"
      tableKey="packages"
      data={tableData}
      columns={PKG_COLUMNS}
      defaultViewMode="table"
      defaultDensity="comfortable"
      filterConfig={PKG_FILTER_CONFIG}
      onRowEdit={handleRowEdit}
      onRowDelete={handleRowDelete}
      onCreate={handleCreate}
      headerActions={
        <HelpButton
          panelId="packages-list-help"
          title="Packages — Help"
          userContent={<PackageListUserHelp />}
          devContent={<PackageListDevHelp />}
        />
      }
    />
  );
}
