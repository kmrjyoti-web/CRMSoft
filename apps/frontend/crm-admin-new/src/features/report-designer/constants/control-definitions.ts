import type { ToolboxItem, DataFieldItem, BandType } from '../types/report-designer.types';

export const CONTROL_DEFINITIONS: ToolboxItem[] = [
  { type: 'text', label: 'Text', icon: 'type', group: 'basic', defaultWidth: 200, defaultHeight: 20, defaultProperties: { text: 'Text', fontSize: 12 } },
  { type: 'label', label: 'Label', icon: 'tag', group: 'basic', defaultWidth: 150, defaultHeight: 20, defaultProperties: { text: 'Label', fontSize: 11, fontWeight: 'bold', color: '#555' } },
  { type: 'image', label: 'Image', icon: 'image', group: 'basic', defaultWidth: 120, defaultHeight: 60, defaultProperties: {} },
  { type: 'table', label: 'Table', icon: 'grid-3x3', group: 'data', defaultWidth: 520, defaultHeight: 200, defaultProperties: { dataSource: 'items', columns: [{ field: '#', header: '#', width: 30 }, { field: 'name', header: 'Name', width: 200 }, { field: 'total', header: 'Total', width: 80, align: 'right' }] } },
  { type: 'line', label: 'Line', icon: 'minus', group: 'layout', defaultWidth: 520, defaultHeight: 1, defaultProperties: { lineColor: '#ddd', lineWidth: 1 } },
  { type: 'rectangle', label: 'Rectangle', icon: 'square', group: 'layout', defaultWidth: 150, defaultHeight: 80, defaultProperties: { borderWidth: 1, borderColor: '#ddd' } },
  { type: 'qrcode', label: 'QR Code', icon: 'grid-3x3', group: 'advanced', defaultWidth: 80, defaultHeight: 80, defaultProperties: { dataField: 'invoice.number' } },
  { type: 'barcode', label: 'Barcode', icon: 'hash', group: 'advanced', defaultWidth: 150, defaultHeight: 50, defaultProperties: { dataField: 'invoice.number', barcodeType: 'CODE128' } },
  { type: 'formula', label: 'Formula', icon: 'percent', group: 'data', defaultWidth: 100, defaultHeight: 20, defaultProperties: { formulaExpression: '0', outputFormat: 'currency', fontSize: 12 } },
  { type: 'date', label: 'Date', icon: 'calendar', group: 'data', defaultWidth: 100, defaultHeight: 20, defaultProperties: { format: 'DD/MM/YYYY', fontSize: 11 } },
  { type: 'serial-no', label: 'Serial No', icon: 'hash', group: 'data', defaultWidth: 30, defaultHeight: 20, defaultProperties: { fontSize: 11, textAlign: 'center' } },
  { type: 'page-no', label: 'Page No', icon: 'file-text', group: 'data', defaultWidth: 80, defaultHeight: 16, defaultProperties: { fontSize: 9, textAlign: 'center', color: '#888' } },
  { type: 'spacer', label: 'Spacer', icon: 'expand', group: 'layout', defaultWidth: 520, defaultHeight: 20, defaultProperties: {} },
  { type: 'shape', label: 'Shape', icon: 'circle', group: 'layout', defaultWidth: 60, defaultHeight: 60, defaultProperties: { borderRadius: 30, backgroundColor: '#f0f0f0' } },
  { type: 'signature', label: 'Signature', icon: 'pen-tool', group: 'advanced', defaultWidth: 140, defaultHeight: 50, defaultProperties: { imageField: 'signatureUrl' } },
];

export const BAND_DEFINITIONS: { type: BandType; label: string; color: string; defaultHeight: number }[] = [
  { type: 'REPORT_TITLE', label: 'Report Title', color: '#3b82f6', defaultHeight: 120 },
  { type: 'PAGE_HEADER', label: 'Page Header', color: '#8b5cf6', defaultHeight: 80 },
  { type: 'GROUP_HEADER', label: 'Group Header', color: '#f59e0b', defaultHeight: 40 },
  { type: 'DETAIL', label: 'Detail', color: '#10b981', defaultHeight: 250 },
  { type: 'GROUP_FOOTER', label: 'Group Footer', color: '#f59e0b', defaultHeight: 40 },
  { type: 'REPORT_SUMMARY', label: 'Report Summary', color: '#ef4444', defaultHeight: 100 },
  { type: 'PAGE_FOOTER', label: 'Page Footer', color: '#6b7280', defaultHeight: 60 },
];

export const DATA_FIELDS: DataFieldItem[] = [
  // Company
  { path: 'company.name', label: 'Company Name', group: 'Company', type: 'string' },
  { path: 'company.legalName', label: 'Legal Name', group: 'Company', type: 'string' },
  { path: 'company.address', label: 'Address', group: 'Company', type: 'string' },
  { path: 'company.gstin', label: 'GSTIN', group: 'Company', type: 'string' },
  { path: 'company.pan', label: 'PAN', group: 'Company', type: 'string' },
  { path: 'company.phone', label: 'Phone', group: 'Company', type: 'string' },
  { path: 'company.email', label: 'Email', group: 'Company', type: 'string' },
  { path: 'company.logo', label: 'Logo', group: 'Company', type: 'image' },

  // Customer
  { path: 'customer.name', label: 'Customer Name', group: 'Customer', type: 'string' },
  { path: 'customer.address', label: 'Address', group: 'Customer', type: 'string' },
  { path: 'customer.phone', label: 'Phone', group: 'Customer', type: 'string' },
  { path: 'customer.email', label: 'Email', group: 'Customer', type: 'string' },
  { path: 'customer.gstin', label: 'GSTIN', group: 'Customer', type: 'string' },
  { path: 'customer.shippingAddress', label: 'Shipping Address', group: 'Customer', type: 'string' },

  // Invoice
  { path: 'invoice.number', label: 'Invoice No', group: 'Invoice', type: 'string' },
  { path: 'invoice.date', label: 'Invoice Date', group: 'Invoice', type: 'date' },
  { path: 'invoice.dueDate', label: 'Due Date', group: 'Invoice', type: 'date' },
  { path: 'invoice.placeOfSupply', label: 'Place of Supply', group: 'Invoice', type: 'string' },

  // Items (array fields - for table binding)
  { path: 'items[].name', label: 'Item Name', group: 'Items', type: 'string' },
  { path: 'items[].hsn', label: 'HSN Code', group: 'Items', type: 'string' },
  { path: 'items[].qty', label: 'Quantity', group: 'Items', type: 'number' },
  { path: 'items[].unit', label: 'Unit', group: 'Items', type: 'string' },
  { path: 'items[].rate', label: 'Rate', group: 'Items', type: 'number' },
  { path: 'items[].discount', label: 'Discount', group: 'Items', type: 'number' },
  { path: 'items[].taxableAmount', label: 'Taxable Amount', group: 'Items', type: 'number' },
  { path: 'items[].cgst', label: 'CGST', group: 'Items', type: 'number' },
  { path: 'items[].sgst', label: 'SGST', group: 'Items', type: 'number' },
  { path: 'items[].igst', label: 'IGST', group: 'Items', type: 'number' },
  { path: 'items[].total', label: 'Total', group: 'Items', type: 'number' },

  // Totals
  { path: 'totals.subtotal', label: 'Subtotal', group: 'Totals', type: 'number' },
  { path: 'totals.totalDiscount', label: 'Total Discount', group: 'Totals', type: 'number' },
  { path: 'totals.totalCgst', label: 'Total CGST', group: 'Totals', type: 'number' },
  { path: 'totals.totalSgst', label: 'Total SGST', group: 'Totals', type: 'number' },
  { path: 'totals.totalIgst', label: 'Total IGST', group: 'Totals', type: 'number' },
  { path: 'totals.totalTax', label: 'Total Tax', group: 'Totals', type: 'number' },
  { path: 'totals.grandTotal', label: 'Grand Total', group: 'Totals', type: 'number' },
  { path: 'totals.roundOff', label: 'Round Off', group: 'Totals', type: 'number' },

  // Quotation
  { path: 'quotation.number', label: 'Quotation No', group: 'Quotation', type: 'string' },
  { path: 'quotation.title', label: 'Title', group: 'Quotation', type: 'string' },
  { path: 'quotation.date', label: 'Date', group: 'Quotation', type: 'date' },
  { path: 'quotation.validUntil', label: 'Valid Until', group: 'Quotation', type: 'date' },
];

export const FORMULA_CATEGORIES = [
  { value: 'tax', label: 'Tax' },
  { value: 'math', label: 'Math' },
  { value: 'text', label: 'Text' },
  { value: 'date', label: 'Date' },
  { value: 'conditional', label: 'Conditional' },
];
