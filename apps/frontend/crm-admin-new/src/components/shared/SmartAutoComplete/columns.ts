import type { TableColumn } from './types';

export function getDefaultColumns(entityType: string): TableColumn[] {
  switch (entityType) {
    case 'CONTACT':
      return [
        { key: 'name', label: 'Name', width: '28%' },
        { key: 'email', label: 'Email', width: '24%' },
        { key: 'phone', label: 'Mobile', width: '15%' },
        { key: 'city', label: 'City', width: '13%' },
        { key: 'gstin', label: 'GSTIN', width: '20%' },
      ];
    case 'ORGANIZATION':
      return [
        { key: 'name', label: 'Name', width: '30%' },
        { key: 'gstin', label: 'GSTIN', width: '22%' },
        { key: 'city', label: 'City', width: '13%' },
        { key: 'phone', label: 'Phone', width: '15%' },
        { key: 'email', label: 'Email', width: '20%' },
      ];
    case 'PRODUCT':
      return [
        { key: 'name', label: 'Product', width: '30%' },
        { key: 'code', label: 'Code', width: '12%' },
        { key: 'hsnCode', label: 'HSN', width: '10%' },
        { key: 'sellingPrice', label: 'Price (₹)', width: '13%' },
        { key: 'currentStock', label: 'Stock', width: '10%' },
        { key: 'brand', label: 'Brand', width: '15%' },
      ];
    case 'LEDGER':
      return [
        { key: 'name', label: 'Ledger Name', width: '35%' },
        { key: 'code', label: 'Code', width: '15%' },
        { key: 'groupType', label: 'Group', width: '20%' },
        { key: 'currentBalance', label: 'Balance (₹)', width: '20%' },
        { key: 'station', label: 'Station', width: '10%' },
      ];
    default:
      return [{ key: 'name', label: 'Name', width: '100%' }];
  }
}

export function formatCellValue(val: any, col: TableColumn): string {
  if (val == null || val === '') return '—';
  if (col.format) return col.format(val);
  if (col.key === 'sellingPrice' || col.key === 'mrp' || col.key === 'currentBalance') {
    return `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }
  return String(val);
}

export function getDisplayName(item: any, entityType: string): string {
  // Service normalizes a 'name' field for all types; fall back to firstName+lastName
  if (item.name) return item.name;
  if (entityType === 'CONTACT') {
    return `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || item.email || item.id;
  }
  return item.name ?? item.id ?? '';
}
