'use client';

import { useMemo } from 'react';

import { TableFull } from '@/components/ui';
import { TableSkeleton } from '@/components/common/TableSkeleton';
import { useTableFilters } from '@/hooks/useTableFilters';
import { useEntityPanel } from '@/hooks/useEntityPanel';
import { formatDate } from '@/lib/format-date';

import { HelpButton } from '@/components/common/HelpButton';

import { useProductsList, useDeactivateProduct } from '../hooks/useProducts';
import { ProductForm } from './ProductForm';
import { ProductListUserHelp } from '../help/ProductListUserHelp';
import { ProductListDevHelp } from '../help/ProductListDevHelp';
import type { ProductListItem, ProductListParams } from '../types/products.types';

// -- Columns ------------------------------------------------------------------

const PRODUCT_COLUMNS = [
  { id: 'name', label: 'Name', visible: true },
  { id: 'code', label: 'Code', visible: true },
  { id: 'mrp', label: 'MRP', visible: true },
  { id: 'salePrice', label: 'Sale Price', visible: true },
  { id: 'hsnCode', label: 'HSN Code', visible: true },
  { id: 'primaryUnit', label: 'Unit', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'tags', label: 'Tags', visible: false },
  { id: 'createdAt', label: 'Created', visible: false },
];

// -- Status colors ------------------------------------------------------------

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE:       { bg: '#E8F8EE', text: '#16A34A' },
  INACTIVE:     { bg: '#F3F4F6', text: '#6B7280' },
  DRAFT:        { bg: '#EBF5FF', text: '#2563EB' },
  DISCONTINUED: { bg: '#FDE8E8', text: '#DC2626' },
};

// -- Filter config ------------------------------------------------------------

const PRODUCT_FILTER_CONFIG = {
  sections: [
    {
      title: 'Product Filters',
      defaultOpen: true,
      filters: [
        {
          columnId: 'status',
          label: 'Status',
          filterType: 'master' as const,
          queryParam: 'status',
          options: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'DISCONTINUED', label: 'Discontinued' },
          ],
        },
      ],
    },
  ],
};

// -- Component ----------------------------------------------------------------

export function ProductList() {
  const { filterParams } = useTableFilters(PRODUCT_FILTER_CONFIG);

  const params: ProductListParams = {
    ...filterParams,
    limit: 100,
  };

  const { data: response, isLoading } = useProductsList(params);
  const deactivateProduct = useDeactivateProduct();

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: 'product',
    entityLabel: 'Product',
    FormComponent: ProductForm,
    idProp: 'productId',
    editRoute: '/products/products/:id',
    createRoute: '/products/products/new',
    displayField: 'name',
  });

  const records = (response as any)?.data ?? (response as any) ?? [];

  const tableData = useMemo(() => {
    if (!Array.isArray(records)) return [];
    return records.map((p: ProductListItem) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      mrp: p.mrp != null ? `₹${Number(p.mrp).toLocaleString('en-IN')}` : '—',
      salePrice: p.salePrice != null ? `₹${Number(p.salePrice).toLocaleString('en-IN')}` : '—',
      hsnCode: p.hsnCode ?? '—',
      primaryUnit: p.primaryUnit ?? '—',
      status: p.status,
      tags: p.tags?.join(', ') ?? '',
      createdAt: formatDate(p.createdAt, 'dd MMM yyyy'),
    }));
  }, [records]);

  const handleRowDelete = (row: any) => {
    if (confirm(`Deactivate product "${row.name}"?`)) {
      deactivateProduct.mutate(row.id);
    }
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <TableFull
      title="Products"
      tableKey="products"
      data={tableData}
      columns={PRODUCT_COLUMNS}
      defaultViewMode="table"
      defaultDensity="comfortable"
      filterConfig={PRODUCT_FILTER_CONFIG}
      onRowEdit={handleRowEdit}
      onRowDelete={handleRowDelete}
      onCreate={handleCreate}
      headerActions={
        <HelpButton
          panelId="products-list-help"
          title="Products — Help"
          userContent={<ProductListUserHelp />}
          devContent={<ProductListDevHelp />}
        />
      }
    />
  );
}
