import type { ColumnDef, BIWidget } from './types';

export const defaultColumns: ColumnDef[] = [
  { id: 'contactName', label: 'Contact Name', visible: true },
  { id: 'accountName', label: 'Account Name', visible: true },
  { id: 'email', label: 'Email', visible: true },
  { id: 'phone', label: 'Phone', visible: true },
  { id: 'contactOwner', label: 'Contact Owner', visible: true },
  { id: 'industry', label: 'Industry', visible: true },
  { id: 'leadType', label: 'Lead Type', visible: true },
  { id: 'customerType', label: 'Customer Type', visible: true },
  { id: 'product', label: 'Product', visible: true },
  { id: 'country', label: 'Country', visible: true },
  { id: 'state', label: 'State', visible: true },
  { id: 'city', label: 'City', visible: true },
  { id: 'address', label: 'Address', visible: true },
  { id: 'quotationValue', label: 'Quotation Value', visible: true },
  { id: 'invoiceValue', label: 'Invoice Value', visible: true },
  { id: 'crDate', label: 'CrDate', visible: true },
  { id: 'enquDate', label: 'Enqu Date', visible: true },
  { id: 'quotationDate', label: 'Quotation Date', visible: true },
];

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const defaultBIWidgets: BIWidget[] = [
  { id: '1', type: 'card', title: 'Total Quotation Value', values: 'quotationValue', aggregation: 'sum' },
  { id: '2', type: 'card', title: 'Total Invoice Value', values: 'invoiceValue', aggregation: 'sum' },
  { id: '3', type: 'card', title: 'Total Contacts', values: 'id', aggregation: 'count' },
  { id: '4', type: 'chart', title: 'Quotation by Industry', xAxis: 'industry', values: 'quotationValue', aggregation: 'sum', chartType: 'bar' },
  { id: '5', type: 'pivot', title: 'Industry vs Lead Type', rows: ['industry'], columns: ['leadType'], values: 'quotationValue', aggregation: 'sum' },
];

export const KANBAN_COLOR_PALETTE = [
  { color: 'bg-[#dcfce7] text-green-800', badge: 'bg-[#bbf7d0] text-green-800', border: 'border-transparent' },
  { color: 'bg-[#e0f2fe] text-blue-800', badge: 'bg-[#bae6fd] text-blue-800', border: 'border-transparent' },
  { color: 'bg-[#fef3c7] text-amber-800', badge: 'bg-[#fde68a] text-amber-800', border: 'border-transparent' },
  { color: 'bg-[#e0e7ff] text-indigo-800', badge: 'bg-[#c7d2fe] text-indigo-800', border: 'border-transparent' },
  { color: 'bg-[#fce7f3] text-pink-800', badge: 'bg-[#fbcfe8] text-pink-800', border: 'border-transparent' },
  { color: 'bg-[#cffafe] text-cyan-800', badge: 'bg-[#a5f3fc] text-cyan-800', border: 'border-transparent' },
  { color: 'bg-[#ffedd5] text-orange-800', badge: 'bg-[#fed7aa] text-orange-800', border: 'border-transparent' },
];
