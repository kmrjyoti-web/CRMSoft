import { PrismaClient, DocumentType } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_SETTINGS = {
  colors: { primary: '#1a56db', secondary: '#6b7280' },
  fonts: { heading: 'Arial', body: 'Arial', size: 12 },
  fields: { hsn: true, sku: false, discount: true, cgst: true, sgst: true, igst: true, cess: false },
  paper: { size: 'A4', orientation: 'portrait' },
};

const RECEIPT_SETTINGS = {
  ...DEFAULT_SETTINGS,
  paper: { size: 'A4', orientation: 'portrait' },
  fields: { ...DEFAULT_SETTINGS.fields, hsn: false, discount: false },
};

const RESTAURANT_SETTINGS = {
  ...DEFAULT_SETTINGS,
  paper: { size: '80mm', orientation: 'portrait' },
  fields: { ...DEFAULT_SETTINGS.fields, hsn: false, sku: false },
};

const REPORT_SETTINGS = {
  ...DEFAULT_SETTINGS,
  fields: { hsn: false, sku: false, discount: false, cgst: false, sgst: false, igst: false, cess: false },
};

// ═══════════════════════════════════════════════════════════════════════════════
// AVAILABLE FIELDS PER DOCUMENT TYPE
// ═══════════════════════════════════════════════════════════════════════════════

const INVOICE_FIELDS = [
  'company.name', 'company.address', 'company.gstin', 'company.pan', 'company.phone', 'company.email', 'company.logo',
  'customer.name', 'customer.address', 'customer.gstin', 'customer.phone', 'customer.email',
  'invoice.number', 'invoice.date', 'invoice.dueDate', 'invoice.placeOfSupply',
  'items.name', 'items.description', 'items.hsn', 'items.sku', 'items.qty', 'items.unit', 'items.rate', 'items.discount', 'items.taxableAmount', 'items.cgst', 'items.sgst', 'items.igst', 'items.cess', 'items.total',
  'totals.subtotal', 'totals.totalDiscount', 'totals.totalCgst', 'totals.totalSgst', 'totals.totalIgst', 'totals.totalCess', 'totals.grandTotal', 'totals.roundOff', 'totals.amountInWords',
  'bank.name', 'bank.accountNo', 'bank.ifsc', 'bank.branch',
  'terms', 'notes', 'signature',
];

const QUOTATION_FIELDS = [
  'company.name', 'company.address', 'company.gstin', 'company.phone', 'company.email', 'company.logo',
  'customer.name', 'customer.address', 'customer.phone', 'customer.email',
  'quotation.number', 'quotation.date', 'quotation.validUntil', 'quotation.subject',
  'items.name', 'items.description', 'items.hsn', 'items.qty', 'items.unit', 'items.rate', 'items.discount', 'items.taxableAmount', 'items.cgst', 'items.sgst', 'items.igst', 'items.total',
  'totals.subtotal', 'totals.totalDiscount', 'totals.totalTax', 'totals.grandTotal', 'totals.amountInWords',
  'terms', 'notes', 'signature',
];

const RECEIPT_FIELDS = [
  'company.name', 'company.address', 'company.phone', 'company.email', 'company.logo',
  'customer.name', 'customer.address', 'customer.phone',
  'receipt.number', 'receipt.date', 'receipt.paymentMode', 'receipt.referenceNo',
  'receipt.amount', 'receipt.amountInWords', 'receipt.againstInvoice',
  'notes', 'signature',
];

const PO_FIELDS = [
  'company.name', 'company.address', 'company.gstin', 'company.phone', 'company.email', 'company.logo',
  'vendor.name', 'vendor.address', 'vendor.gstin', 'vendor.phone', 'vendor.email',
  'po.number', 'po.date', 'po.deliveryDate', 'po.deliveryAddress',
  'items.name', 'items.description', 'items.hsn', 'items.qty', 'items.unit', 'items.rate', 'items.discount', 'items.taxableAmount', 'items.cgst', 'items.sgst', 'items.igst', 'items.total',
  'totals.subtotal', 'totals.totalTax', 'totals.grandTotal', 'totals.amountInWords',
  'terms', 'notes', 'signature',
];

const CHALLAN_FIELDS = [
  'company.name', 'company.address', 'company.gstin', 'company.phone', 'company.logo',
  'customer.name', 'customer.address', 'customer.phone',
  'challan.number', 'challan.date', 'challan.vehicleNo', 'challan.transporterName', 'challan.lrNo',
  'items.name', 'items.description', 'items.hsn', 'items.qty', 'items.unit',
  'notes', 'signature',
];

const CREDIT_NOTE_FIELDS = [
  'company.name', 'company.address', 'company.gstin', 'company.phone', 'company.email', 'company.logo',
  'customer.name', 'customer.address', 'customer.gstin', 'customer.phone',
  'creditNote.number', 'creditNote.date', 'creditNote.againstInvoice', 'creditNote.reason',
  'items.name', 'items.description', 'items.hsn', 'items.qty', 'items.unit', 'items.rate', 'items.cgst', 'items.sgst', 'items.igst', 'items.total',
  'totals.subtotal', 'totals.totalTax', 'totals.grandTotal', 'totals.amountInWords',
  'notes', 'signature',
];

const SALES_REPORT_FIELDS = [
  'company.name', 'company.logo', 'report.title', 'report.dateRange', 'report.generatedAt',
  'rows.date', 'rows.invoiceNo', 'rows.customerName', 'rows.taxableAmount', 'rows.cgst', 'rows.sgst', 'rows.igst', 'rows.total',
  'summary.totalSales', 'summary.totalTax', 'summary.totalInvoices',
];

const STATEMENT_FIELDS = [
  'company.name', 'company.address', 'company.phone', 'company.email', 'company.logo',
  'customer.name', 'customer.address', 'customer.phone',
  'statement.fromDate', 'statement.toDate', 'statement.openingBalance',
  'rows.date', 'rows.particular', 'rows.voucherNo', 'rows.debit', 'rows.credit', 'rows.balance',
  'summary.totalDebit', 'summary.totalCredit', 'summary.closingBalance',
];

const TOURISM_QUOTE_FIELDS = [
  ...QUOTATION_FIELDS,
  'itinerary.days', 'itinerary.day.title', 'itinerary.day.description', 'itinerary.day.meals', 'itinerary.day.hotel',
  'inclusions', 'exclusions', 'cancellationPolicy',
];

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 1: GST INVOICE — STANDARD
// ═══════════════════════════════════════════════════════════════════════════════

const GST_INVOICE_STANDARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Tax Invoice</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #333; line-height: 1.4; }
  .invoice-box { max-width: 210mm; margin: 0 auto; padding: 16px; border: 1px solid #ccc; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a56db; padding-bottom: 12px; margin-bottom: 12px; }
  .header-left { flex: 1; }
  .company-name { font-size: 20px; font-weight: 700; color: #1a56db; margin-bottom: 4px; }
  .company-detail { font-size: 11px; color: #555; }
  .header-right { text-align: right; }
  .invoice-title { font-size: 22px; font-weight: 700; color: #1a56db; letter-spacing: 1px; }
  .invoice-meta { font-size: 11px; margin-top: 4px; }
  .invoice-meta span { display: block; }
  .parties { display: flex; gap: 16px; margin-bottom: 14px; }
  .party-box { flex: 1; border: 1px solid #ddd; border-radius: 4px; padding: 10px; }
  .party-box h4 { font-size: 10px; text-transform: uppercase; color: #888; margin-bottom: 4px; letter-spacing: 0.5px; }
  .party-box .name { font-weight: 700; font-size: 13px; margin-bottom: 2px; }
  .party-box .detail { font-size: 11px; color: #555; }
  table.items { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  table.items th { background: #1a56db; color: #fff; font-size: 10px; text-transform: uppercase; padding: 6px 8px; text-align: left; }
  table.items th.right, table.items td.right { text-align: right; }
  table.items th.center, table.items td.center { text-align: center; }
  table.items td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
  table.items tr:nth-child(even) { background: #f9fafb; }
  .totals-section { display: flex; justify-content: flex-end; margin-bottom: 14px; }
  .totals-table { width: 280px; }
  .totals-table tr td { padding: 4px 8px; font-size: 11px; }
  .totals-table tr td:last-child { text-align: right; font-weight: 600; }
  .totals-table .grand-total { border-top: 2px solid #1a56db; font-size: 14px; color: #1a56db; }
  .amount-words { background: #f0f5ff; padding: 8px 12px; border-radius: 4px; font-size: 11px; margin-bottom: 14px; }
  .amount-words strong { color: #1a56db; }
  .footer-section { display: flex; justify-content: space-between; margin-top: 10px; }
  .bank-details { flex: 1; }
  .bank-details h4 { font-size: 10px; text-transform: uppercase; color: #888; margin-bottom: 4px; }
  .bank-details .detail { font-size: 11px; color: #555; }
  .signature-box { text-align: center; width: 180px; }
  .signature-box .line { border-top: 1px solid #333; margin-top: 50px; padding-top: 4px; font-size: 10px; color: #888; }
  .terms { margin-top: 14px; border-top: 1px solid #eee; padding-top: 8px; }
  .terms h4 { font-size: 10px; text-transform: uppercase; color: #888; margin-bottom: 4px; }
  .terms p { font-size: 10px; color: #666; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .invoice-box { border: none; padding: 0; }
  }
</style>
</head>
<body>
<div class="invoice-box">

  <div class="header">
    <div class="header-left">
      {{#if company.logo}}<img src="{{company.logo}}" alt="Logo" style="max-height:60px;margin-bottom:6px;">{{/if}}
      <div class="company-name">{{company.name}}</div>
      <div class="company-detail">{{company.address}}</div>
      <div class="company-detail">Phone: {{company.phone}} | Email: {{company.email}}</div>
      <div class="company-detail"><strong>GSTIN:</strong> {{company.gstin}} | <strong>PAN:</strong> {{company.pan}}</div>
    </div>
    <div class="header-right">
      <div class="invoice-title">TAX INVOICE</div>
      <div class="invoice-meta">
        <span><strong>Invoice #:</strong> {{invoice.number}}</span>
        <span><strong>Date:</strong> {{dateIN invoice.date}}</span>
        <span><strong>Due Date:</strong> {{dateIN invoice.dueDate}}</span>
        <span><strong>Place of Supply:</strong> {{invoice.placeOfSupply}}</span>
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      <h4>Bill To</h4>
      <div class="name">{{customer.name}}</div>
      <div class="detail">{{customer.address}}</div>
      <div class="detail">Phone: {{customer.phone}}</div>
      {{#if customer.gstin}}<div class="detail"><strong>GSTIN:</strong> {{customer.gstin}}</div>{{/if}}
    </div>
    <div class="party-box">
      <h4>Ship To</h4>
      <div class="name">{{customer.name}}</div>
      <div class="detail">{{customer.shippingAddress}}</div>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th style="width:30px">#</th>
        <th>Item Description</th>
        {{#showField "hsn"}}<th class="center">HSN/SAC</th>{{/showField}}
        <th class="center">Qty</th>
        <th class="right">Rate</th>
        {{#showField "discount"}}<th class="right">Disc.</th>{{/showField}}
        <th class="right">Taxable</th>
        {{#isInterState}}
          <th class="right">IGST</th>
        {{else}}
          <th class="right">CGST</th>
          <th class="right">SGST</th>
        {{/isInterState}}
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{serialNo @index}}</td>
        <td><strong>{{this.name}}</strong>{{#if this.description}}<br><span style="color:#888">{{this.description}}</span>{{/if}}</td>
        {{#showField "hsn"}}<td class="center">{{this.hsn}}</td>{{/showField}}
        <td class="center">{{this.qty}} {{this.unit}}</td>
        <td class="right">{{inr this.rate}}</td>
        {{#showField "discount"}}<td class="right">{{inr this.discount}}</td>{{/showField}}
        <td class="right">{{inr this.taxableAmount}}</td>
        {{#isInterState}}
          <td class="right">{{inr this.igst}}</td>
        {{else}}
          <td class="right">{{inr this.cgst}}</td>
          <td class="right">{{inr this.sgst}}</td>
        {{/isInterState}}
        <td class="right">{{inr this.total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="totals-section">
    <table class="totals-table">
      <tr><td>Subtotal</td><td>{{inr totals.subtotal}}</td></tr>
      {{#showField "discount"}}<tr><td>Discount</td><td>- {{inr totals.totalDiscount}}</td></tr>{{/showField}}
      {{#isInterState}}
        <tr><td>IGST</td><td>{{inr totals.totalIgst}}</td></tr>
      {{else}}
        <tr><td>CGST</td><td>{{inr totals.totalCgst}}</td></tr>
        <tr><td>SGST</td><td>{{inr totals.totalSgst}}</td></tr>
      {{/isInterState}}
      {{#showField "cess"}}<tr><td>Cess</td><td>{{inr totals.totalCess}}</td></tr>{{/showField}}
      {{#if totals.roundOff}}<tr><td>Round Off</td><td>{{inr totals.roundOff}}</td></tr>{{/if}}
      <tr class="grand-total"><td><strong>Grand Total</strong></td><td><strong>{{inr totals.grandTotal}}</strong></td></tr>
    </table>
  </div>

  <div class="amount-words">
    <strong>Amount in Words:</strong> {{amountInWords totals.grandTotal}}
  </div>

  <div class="footer-section">
    <div class="bank-details">
      <h4>Bank Details</h4>
      <div class="detail">Bank: {{bank.name}}</div>
      <div class="detail">A/C No: {{bank.accountNo}}</div>
      <div class="detail">IFSC: {{bank.ifsc}}</div>
      <div class="detail">Branch: {{bank.branch}}</div>
    </div>
    <div class="signature-box">
      <div class="line">Authorised Signatory</div>
    </div>
  </div>

  {{#if terms}}
  <div class="terms">
    <h4>Terms & Conditions</h4>
    <p>{{terms}}</p>
  </div>
  {{/if}}

</div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 2: GST INVOICE — MODERN
// ═══════════════════════════════════════════════════════════════════════════════

const GST_INVOICE_MODERN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Tax Invoice</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1e293b; line-height: 1.5; background: #fff; }
  .invoice-box { max-width: 210mm; margin: 0 auto; }
  .top-bar { height: 6px; background: linear-gradient(90deg, #1a56db 0%, #7c3aed 100%); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 0 16px; }
  .header-left { flex: 1; }
  .company-name { font-size: 24px; font-weight: 800; color: #0f172a; }
  .company-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
  .badge { display: inline-block; background: #1a56db; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; letter-spacing: 1px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 14px 0; background: #f8fafc; border-radius: 8px; padding: 12px 16px; }
  .meta-item { font-size: 11px; }
  .meta-item .label { color: #94a3b8; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
  .meta-item .value { font-weight: 600; color: #1e293b; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .party-card { background: #f8fafc; border-radius: 8px; padding: 14px; border-left: 3px solid #1a56db; }
  .party-card.ship { border-left-color: #7c3aed; }
  .party-card h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 6px; }
  .party-card .name { font-size: 14px; font-weight: 700; color: #0f172a; }
  .party-card .info { font-size: 11px; color: #64748b; margin-top: 2px; }
  table.items { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 16px; border-radius: 8px; overflow: hidden; }
  table.items thead th { background: #0f172a; color: #e2e8f0; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 10px; text-align: left; }
  table.items thead th.right, table.items td.right { text-align: right; }
  table.items thead th.center, table.items td.center { text-align: center; }
  table.items td { padding: 8px 10px; font-size: 11px; border-bottom: 1px solid #f1f5f9; }
  table.items tbody tr:hover { background: #f8fafc; }
  .totals-wrap { display: flex; justify-content: flex-end; }
  .totals-card { background: #f8fafc; border-radius: 8px; padding: 14px 18px; min-width: 280px; }
  .totals-card .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; color: #64748b; }
  .totals-card .row .val { font-weight: 600; color: #1e293b; }
  .totals-card .grand { border-top: 2px solid #1a56db; margin-top: 6px; padding-top: 6px; font-size: 16px; color: #1a56db; font-weight: 800; }
  .words-bar { background: linear-gradient(90deg, #eff6ff 0%, #f5f3ff 100%); padding: 10px 16px; border-radius: 8px; margin: 14px 0; font-size: 11px; }
  .words-bar strong { color: #1a56db; }
  .bottom { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 16px; padding-top: 14px; border-top: 1px solid #e2e8f0; }
  .bank-info h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px; }
  .bank-info .line { font-size: 11px; color: #64748b; }
  .sign-area { text-align: center; }
  .sign-area .rule { border-top: 1px solid #cbd5e1; margin-top: 50px; padding-top: 4px; font-size: 10px; color: #94a3b8; }
  .terms-block { margin-top: 14px; padding-top: 10px; border-top: 1px solid #f1f5f9; }
  .terms-block h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px; }
  .terms-block p { font-size: 10px; color: #94a3b8; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="invoice-box">
  <div class="top-bar"></div>

  <div class="header">
    <div class="header-left">
      {{#if company.logo}}<img src="{{company.logo}}" alt="Logo" style="max-height:50px;margin-bottom:6px;">{{/if}}
      <div class="company-name">{{company.name}}</div>
      <div class="company-sub">{{company.address}}</div>
      <div class="company-sub">GSTIN: {{company.gstin}} | PAN: {{company.pan}}</div>
    </div>
    <div style="text-align:right">
      <span class="badge">TAX INVOICE</span>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><span class="label">Invoice No</span><div class="value">{{invoice.number}}</div></div>
    <div class="meta-item"><span class="label">Invoice Date</span><div class="value">{{dateIN invoice.date}}</div></div>
    <div class="meta-item"><span class="label">Due Date</span><div class="value">{{dateIN invoice.dueDate}}</div></div>
    <div class="meta-item"><span class="label">Place of Supply</span><div class="value">{{invoice.placeOfSupply}}</div></div>
  </div>

  <div class="parties">
    <div class="party-card">
      <h4>Bill To</h4>
      <div class="name">{{customer.name}}</div>
      <div class="info">{{customer.address}}</div>
      <div class="info">Phone: {{customer.phone}}</div>
      {{#if customer.gstin}}<div class="info">GSTIN: {{customer.gstin}}</div>{{/if}}
    </div>
    <div class="party-card ship">
      <h4>Ship To</h4>
      <div class="name">{{customer.name}}</div>
      <div class="info">{{customer.shippingAddress}}</div>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th style="width:28px">#</th>
        <th>Description</th>
        {{#showField "hsn"}}<th class="center">HSN</th>{{/showField}}
        <th class="center">Qty</th>
        <th class="right">Rate</th>
        {{#showField "discount"}}<th class="right">Disc.</th>{{/showField}}
        <th class="right">Taxable</th>
        {{#isInterState}}
          <th class="right">IGST</th>
        {{else}}
          <th class="right">CGST</th>
          <th class="right">SGST</th>
        {{/isInterState}}
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{serialNo @index}}</td>
        <td><strong>{{this.name}}</strong>{{#if this.description}}<br><span style="color:#94a3b8;font-size:10px">{{this.description}}</span>{{/if}}</td>
        {{#showField "hsn"}}<td class="center">{{this.hsn}}</td>{{/showField}}
        <td class="center">{{this.qty}} {{this.unit}}</td>
        <td class="right">{{inr this.rate}}</td>
        {{#showField "discount"}}<td class="right">{{inr this.discount}}</td>{{/showField}}
        <td class="right">{{inr this.taxableAmount}}</td>
        {{#isInterState}}
          <td class="right">{{inr this.igst}}</td>
        {{else}}
          <td class="right">{{inr this.cgst}}</td>
          <td class="right">{{inr this.sgst}}</td>
        {{/isInterState}}
        <td class="right">{{inr this.total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="totals-wrap">
    <div class="totals-card">
      <div class="row"><span>Subtotal</span><span class="val">{{inr totals.subtotal}}</span></div>
      {{#showField "discount"}}<div class="row"><span>Discount</span><span class="val">- {{inr totals.totalDiscount}}</span></div>{{/showField}}
      {{#isInterState}}
        <div class="row"><span>IGST</span><span class="val">{{inr totals.totalIgst}}</span></div>
      {{else}}
        <div class="row"><span>CGST</span><span class="val">{{inr totals.totalCgst}}</span></div>
        <div class="row"><span>SGST</span><span class="val">{{inr totals.totalSgst}}</span></div>
      {{/isInterState}}
      {{#showField "cess"}}<div class="row"><span>Cess</span><span class="val">{{inr totals.totalCess}}</span></div>{{/showField}}
      {{#if totals.roundOff}}<div class="row"><span>Round Off</span><span class="val">{{inr totals.roundOff}}</span></div>{{/if}}
      <div class="row grand"><span>Grand Total</span><span class="val">{{inr totals.grandTotal}}</span></div>
    </div>
  </div>

  <div class="words-bar">
    <strong>Amount in Words:</strong> {{amountInWords totals.grandTotal}}
  </div>

  <div class="bottom">
    <div class="bank-info">
      <h4>Bank Details</h4>
      <div class="line">{{bank.name}} | A/C: {{bank.accountNo}}</div>
      <div class="line">IFSC: {{bank.ifsc}} | Branch: {{bank.branch}}</div>
    </div>
    <div class="sign-area">
      <div class="rule">Authorised Signatory</div>
    </div>
  </div>

  {{#if terms}}
  <div class="terms-block">
    <h4>Terms & Conditions</h4>
    <p>{{terms}}</p>
  </div>
  {{/if}}

</div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 3: RESTAURANT BILL
// ═══════════════════════════════════════════════════════════════════════════════

const RESTAURANT_BILL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Restaurant Bill</title>
<style>
  @page { size: 80mm auto; margin: 3mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; width: 76mm; margin: 0 auto; }
  .bill { padding: 4px; }
  .center { text-align: center; }
  .right { text-align: right; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  .double-divider { border-top: 2px double #000; margin: 6px 0; }
  .restaurant-name { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 2px; }
  .restaurant-sub { font-size: 10px; text-align: center; color: #555; }
  .meta-row { display: flex; justify-content: space-between; font-size: 11px; margin: 2px 0; }
  .bill-title { font-size: 14px; font-weight: 700; text-align: center; margin: 6px 0; letter-spacing: 2px; }
  table.items { width: 100%; border-collapse: collapse; }
  table.items th { font-size: 10px; text-align: left; border-bottom: 1px solid #000; padding: 3px 0; }
  table.items th.right, table.items td.right { text-align: right; }
  table.items td { padding: 3px 0; font-size: 11px; }
  .total-row { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; }
  .total-row.grand { font-size: 16px; font-weight: 700; }
  .footer-text { font-size: 10px; text-align: center; color: #555; margin-top: 8px; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="bill">

  {{#if company.logo}}<div class="center"><img src="{{company.logo}}" alt="Logo" style="max-height:40px;margin-bottom:4px;"></div>{{/if}}
  <div class="restaurant-name">{{company.name}}</div>
  <div class="restaurant-sub">{{company.address}}</div>
  <div class="restaurant-sub">Phone: {{company.phone}}</div>
  {{#if company.gstin}}<div class="restaurant-sub">GSTIN: {{company.gstin}}</div>{{/if}}

  <div class="divider"></div>
  <div class="bill-title">TAX INVOICE</div>
  <div class="divider"></div>

  <div class="meta-row"><span>Bill No: {{invoice.number}}</span><span>{{dateIN invoice.date}}</span></div>
  <div class="meta-row"><span>Table: {{invoice.tableNo}}</span><span>Server: {{invoice.serverName}}</span></div>
  {{#if customer.name}}<div class="meta-row"><span>Customer: {{customer.name}}</span></div>{{/if}}

  <div class="divider"></div>

  <table class="items">
    <thead>
      <tr>
        <th style="width:20px">#</th>
        <th>Item</th>
        <th class="right">Qty</th>
        <th class="right">Rate</th>
        <th class="right">Amt</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{serialNo @index}}</td>
        <td>{{this.name}}</td>
        <td class="right">{{this.qty}}</td>
        <td class="right">{{inr this.rate}}</td>
        <td class="right">{{inr this.total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="divider"></div>

  <div class="total-row"><span>Subtotal</span><span>{{inr totals.subtotal}}</span></div>
  {{#showField "discount"}}
    {{#if totals.totalDiscount}}<div class="total-row"><span>Discount</span><span>- {{inr totals.totalDiscount}}</span></div>{{/if}}
  {{/showField}}
  {{#isInterState}}
    <div class="total-row"><span>IGST</span><span>{{inr totals.totalIgst}}</span></div>
  {{else}}
    <div class="total-row"><span>CGST</span><span>{{inr totals.totalCgst}}</span></div>
    <div class="total-row"><span>SGST</span><span>{{inr totals.totalSgst}}</span></div>
  {{/isInterState}}
  {{#if totals.serviceCharge}}<div class="total-row"><span>Service Charge</span><span>{{inr totals.serviceCharge}}</span></div>{{/if}}
  {{#if totals.roundOff}}<div class="total-row"><span>Round Off</span><span>{{inr totals.roundOff}}</span></div>{{/if}}

  <div class="double-divider"></div>
  <div class="total-row grand"><span>TOTAL</span><span>{{inr totals.grandTotal}}</span></div>
  <div class="double-divider"></div>

  <div class="center" style="font-size:10px;margin-top:4px;">
    <strong>Amount in Words:</strong> {{amountInWords totals.grandTotal}}
  </div>

  <div class="divider"></div>

  <div class="footer-text">Thank you for dining with us!</div>
  {{#if terms}}<div class="footer-text">{{terms}}</div>{{/if}}
  <div class="footer-text" style="margin-top:4px;">*** This is a computer-generated bill ***</div>

</div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 4: QUOTATION — STANDARD
// ═══════════════════════════════════════════════════════════════════════════════

const QUOTATION_STANDARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Quotation</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #333; line-height: 1.4; }
  .quote-box { max-width: 210mm; margin: 0 auto; padding: 16px; border: 1px solid #ccc; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 12px; }
  .company-name { font-size: 20px; font-weight: 700; color: #0d9488; margin-bottom: 4px; }
  .company-detail { font-size: 11px; color: #555; }
  .quote-title { font-size: 22px; font-weight: 700; color: #0d9488; letter-spacing: 1px; }
  .quote-meta span { display: block; font-size: 11px; margin-top: 2px; }
  .parties { display: flex; gap: 16px; margin-bottom: 14px; }
  .party-box { flex: 1; border: 1px solid #ddd; border-radius: 4px; padding: 10px; }
  .party-box h4 { font-size: 10px; text-transform: uppercase; color: #888; margin-bottom: 4px; }
  .party-box .name { font-weight: 700; font-size: 13px; margin-bottom: 2px; }
  .party-box .detail { font-size: 11px; color: #555; }
  .subject-bar { background: #f0fdfa; border-left: 3px solid #0d9488; padding: 8px 12px; margin-bottom: 14px; font-size: 12px; }
  .subject-bar strong { color: #0d9488; }
  table.items { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  table.items th { background: #0d9488; color: #fff; font-size: 10px; text-transform: uppercase; padding: 6px 8px; text-align: left; }
  table.items th.right, table.items td.right { text-align: right; }
  table.items th.center, table.items td.center { text-align: center; }
  table.items td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
  table.items tr:nth-child(even) { background: #f9fafb; }
  .totals-section { display: flex; justify-content: flex-end; margin-bottom: 14px; }
  .totals-table { width: 280px; }
  .totals-table tr td { padding: 4px 8px; font-size: 11px; }
  .totals-table tr td:last-child { text-align: right; font-weight: 600; }
  .totals-table .grand-total { border-top: 2px solid #0d9488; font-size: 14px; color: #0d9488; }
  .amount-words { background: #f0fdfa; padding: 8px 12px; border-radius: 4px; font-size: 11px; margin-bottom: 14px; }
  .amount-words strong { color: #0d9488; }
  .validity { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 4px; padding: 8px 12px; font-size: 11px; margin-bottom: 14px; }
  .footer-section { display: flex; justify-content: space-between; margin-top: 10px; }
  .signature-box { text-align: center; width: 180px; }
  .signature-box .line { border-top: 1px solid #333; margin-top: 50px; padding-top: 4px; font-size: 10px; color: #888; }
  .terms { margin-top: 14px; border-top: 1px solid #eee; padding-top: 8px; }
  .terms h4 { font-size: 10px; text-transform: uppercase; color: #888; margin-bottom: 4px; }
  .terms p { font-size: 10px; color: #666; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .quote-box { border: none; padding: 0; }
  }
</style>
</head>
<body>
<div class="quote-box">

  <div class="header">
    <div>
      {{#if company.logo}}<img src="{{company.logo}}" alt="Logo" style="max-height:60px;margin-bottom:6px;">{{/if}}
      <div class="company-name">{{company.name}}</div>
      <div class="company-detail">{{company.address}}</div>
      <div class="company-detail">Phone: {{company.phone}} | Email: {{company.email}}</div>
      {{#if company.gstin}}<div class="company-detail"><strong>GSTIN:</strong> {{company.gstin}}</div>{{/if}}
    </div>
    <div style="text-align:right">
      <div class="quote-title">QUOTATION</div>
      <div class="quote-meta">
        <span><strong>Quote #:</strong> {{quotation.number}}</span>
        <span><strong>Date:</strong> {{dateIN quotation.date}}</span>
        <span><strong>Valid Until:</strong> {{dateIN quotation.validUntil}}</span>
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      <h4>Quotation To</h4>
      <div class="name">{{customer.name}}</div>
      <div class="detail">{{customer.address}}</div>
      <div class="detail">Phone: {{customer.phone}}</div>
      {{#if customer.email}}<div class="detail">Email: {{customer.email}}</div>{{/if}}
    </div>
  </div>

  {{#if quotation.subject}}
  <div class="subject-bar">
    <strong>Subject:</strong> {{quotation.subject}}
  </div>
  {{/if}}

  <table class="items">
    <thead>
      <tr>
        <th style="width:30px">#</th>
        <th>Item Description</th>
        {{#showField "hsn"}}<th class="center">HSN/SAC</th>{{/showField}}
        <th class="center">Qty</th>
        <th class="right">Rate</th>
        {{#showField "discount"}}<th class="right">Disc.</th>{{/showField}}
        <th class="right">Taxable</th>
        {{#isInterState}}
          <th class="right">IGST</th>
        {{else}}
          <th class="right">CGST</th>
          <th class="right">SGST</th>
        {{/isInterState}}
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{serialNo @index}}</td>
        <td><strong>{{this.name}}</strong>{{#if this.description}}<br><span style="color:#888">{{this.description}}</span>{{/if}}</td>
        {{#showField "hsn"}}<td class="center">{{this.hsn}}</td>{{/showField}}
        <td class="center">{{this.qty}} {{this.unit}}</td>
        <td class="right">{{inr this.rate}}</td>
        {{#showField "discount"}}<td class="right">{{inr this.discount}}</td>{{/showField}}
        <td class="right">{{inr this.taxableAmount}}</td>
        {{#isInterState}}
          <td class="right">{{inr this.igst}}</td>
        {{else}}
          <td class="right">{{inr this.cgst}}</td>
          <td class="right">{{inr this.sgst}}</td>
        {{/isInterState}}
        <td class="right">{{inr this.total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="totals-section">
    <table class="totals-table">
      <tr><td>Subtotal</td><td>{{inr totals.subtotal}}</td></tr>
      {{#showField "discount"}}<tr><td>Discount</td><td>- {{inr totals.totalDiscount}}</td></tr>{{/showField}}
      {{#isInterState}}
        <tr><td>IGST</td><td>{{inr totals.totalIgst}}</td></tr>
      {{else}}
        <tr><td>CGST</td><td>{{inr totals.totalCgst}}</td></tr>
        <tr><td>SGST</td><td>{{inr totals.totalSgst}}</td></tr>
      {{/isInterState}}
      <tr class="grand-total"><td><strong>Grand Total</strong></td><td><strong>{{inr totals.grandTotal}}</strong></td></tr>
    </table>
  </div>

  <div class="amount-words">
    <strong>Amount in Words:</strong> {{amountInWords totals.grandTotal}}
  </div>

  <div class="validity">
    This quotation is valid until <strong>{{dateIN quotation.validUntil}}</strong>. Prices may be revised after this date.
  </div>

  <div class="footer-section">
    <div></div>
    <div class="signature-box">
      <div class="line">Authorised Signatory</div>
    </div>
  </div>

  {{#if terms}}
  <div class="terms">
    <h4>Terms & Conditions</h4>
    <p>{{terms}}</p>
  </div>
  {{/if}}

  {{#if notes}}
  <div class="terms">
    <h4>Notes</h4>
    <p>{{notes}}</p>
  </div>
  {{/if}}

</div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 5: QUOTATION — DETAILED (minimal)
// ═══════════════════════════════════════════════════════════════════════════════

const QUOTATION_DETAILED_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Detailed Quotation</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
  .container { max-width: 210mm; margin: 0 auto; }
  h1 { font-size: 20px; color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 6px; margin-bottom: 10px; }
  .row { display: flex; gap: 16px; margin-bottom: 12px; }
  .col { flex: 1; }
  .label { font-size: 10px; color: #888; text-transform: uppercase; }
  .value { font-size: 12px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #f3f4f6; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #ddd; }
  td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
  .right { text-align: right; }
  .center { text-align: center; }
  .totals { width: 260px; margin-left: auto; margin-bottom: 12px; }
  .totals td { padding: 3px 8px; }
  .totals .grand { border-top: 2px solid #1a56db; font-size: 14px; font-weight: 700; color: #1a56db; }
  .words { background: #f0f5ff; padding: 8px; border-radius: 4px; font-size: 11px; margin-bottom: 12px; }
  .scope-section { margin: 14px 0; }
  .scope-section h3 { font-size: 13px; color: #1a56db; margin-bottom: 6px; }
  .scope-section p { font-size: 11px; color: #555; }
  .sign { text-align: right; margin-top: 40px; }
  .sign .line { border-top: 1px solid #333; display: inline-block; width: 160px; padding-top: 4px; font-size: 10px; color: #888; text-align: center; }
  .terms-list { font-size: 10px; color: #666; margin-top: 12px; padding-top: 8px; border-top: 1px solid #eee; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="container">

  <h1>DETAILED QUOTATION</h1>

  <div class="row">
    <div class="col">
      {{#if company.logo}}<img src="{{company.logo}}" alt="Logo" style="max-height:50px;margin-bottom:4px;"><br>{{/if}}
      <div class="value">{{company.name}}</div>
      <div style="font-size:11px;color:#555">{{company.address}}</div>
      <div style="font-size:11px;color:#555">Ph: {{company.phone}} | {{company.email}}</div>
      {{#if company.gstin}}<div style="font-size:11px;color:#555">GSTIN: {{company.gstin}}</div>{{/if}}
    </div>
    <div class="col" style="text-align:right">
      <div class="label">Quote No</div><div class="value">{{quotation.number}}</div>
      <div class="label" style="margin-top:4px">Date</div><div class="value">{{dateIN quotation.date}}</div>
      <div class="label" style="margin-top:4px">Valid Until</div><div class="value">{{dateIN quotation.validUntil}}</div>
    </div>
  </div>

  <div class="row">
    <div class="col" style="background:#f9fafb;padding:10px;border-radius:4px;">
      <div class="label">Quotation To</div>
      <div class="value">{{customer.name}}</div>
      <div style="font-size:11px;color:#555">{{customer.address}}</div>
      <div style="font-size:11px;color:#555">Ph: {{customer.phone}} | {{customer.email}}</div>
    </div>
  </div>

  {{#if quotation.subject}}
  <div class="scope-section">
    <h3>Subject</h3>
    <p>{{quotation.subject}}</p>
  </div>
  {{/if}}

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item / Description</th>
        {{#showField "hsn"}}<th class="center">HSN</th>{{/showField}}
        <th class="center">Qty</th>
        <th class="right">Rate</th>
        {{#showField "discount"}}<th class="right">Disc.</th>{{/showField}}
        <th class="right">Taxable</th>
        {{#isInterState}}<th class="right">IGST</th>{{else}}<th class="right">CGST</th><th class="right">SGST</th>{{/isInterState}}
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{serialNo @index}}</td>
        <td><strong>{{this.name}}</strong>{{#if this.description}}<br><span style="font-size:10px;color:#888">{{this.description}}</span>{{/if}}</td>
        {{#showField "hsn"}}<td class="center">{{this.hsn}}</td>{{/showField}}
        <td class="center">{{this.qty}} {{this.unit}}</td>
        <td class="right">{{inr this.rate}}</td>
        {{#showField "discount"}}<td class="right">{{inr this.discount}}</td>{{/showField}}
        <td class="right">{{inr this.taxableAmount}}</td>
        {{#isInterState}}<td class="right">{{inr this.igst}}</td>{{else}}<td class="right">{{inr this.cgst}}</td><td class="right">{{inr this.sgst}}</td>{{/isInterState}}
        <td class="right">{{inr this.total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <table class="totals">
    <tr><td>Subtotal</td><td class="right">{{inr totals.subtotal}}</td></tr>
    {{#showField "discount"}}<tr><td>Discount</td><td class="right">- {{inr totals.totalDiscount}}</td></tr>{{/showField}}
    {{#isInterState}}<tr><td>IGST</td><td class="right">{{inr totals.totalIgst}}</td></tr>{{else}}<tr><td>CGST</td><td class="right">{{inr totals.totalCgst}}</td></tr><tr><td>SGST</td><td class="right">{{inr totals.totalSgst}}</td></tr>{{/isInterState}}
    <tr class="grand"><td><strong>Grand Total</strong></td><td class="right"><strong>{{inr totals.grandTotal}}</strong></td></tr>
  </table>

  <div class="words"><strong>Amount in Words:</strong> {{amountInWords totals.grandTotal}}</div>

  {{#if notes}}
  <div class="scope-section"><h3>Notes</h3><p>{{notes}}</p></div>
  {{/if}}

  <div class="sign"><div class="line">Authorised Signatory</div></div>

  {{#if terms}}<div class="terms-list"><strong>Terms & Conditions:</strong><br>{{terms}}</div>{{/if}}

</div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 6: TOURISM ITINERARY QUOTE (minimal)
// ═══════════════════════════════════════════════════════════════════════════════

const TOURISM_ITINERARY_QUOTE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Tour Itinerary &amp; Quotation</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
  .container { max-width: 210mm; margin: 0 auto; }
  h1 { font-size: 20px; color: #b45309; border-bottom: 2px solid #b45309; padding-bottom: 6px; margin-bottom: 10px; }
  .row { display: flex; gap: 16px; margin-bottom: 12px; }
  .col { flex: 1; }
  .label { font-size: 10px; color: #888; text-transform: uppercase; }
  .value { font-size: 12px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #fffbeb; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #f59e0b; }
  td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
  .right { text-align: right; }
  .center { text-align: center; }
  .totals { width: 240px; margin-left: auto; margin-bottom: 12px; }
  .totals td { padding: 3px 8px; }
  .totals .grand { border-top: 2px solid #b45309; font-size: 14px; font-weight: 700; color: #b45309; }
  .day-card { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
  .day-card h3 { font-size: 13px; color: #b45309; margin-bottom: 4px; }
  .day-card p { font-size: 11px; color: #555; }
  .day-card .meta { font-size: 10px; color: #888; margin-top: 4px; }
  .section-title { font-size: 14px; color: #b45309; margin: 14px 0 6px; }
  .list-section { font-size: 11px; color: #555; margin-bottom: 10px; }
  .words { background: #fffbeb; padding: 8px; border-radius: 4px; font-size: 11px; margin-bottom: 12px; }
  .sign { text-align: right; margin-top: 40px; }
  .sign .line { border-top: 1px solid #333; display: inline-block; width: 160px; padding-top: 4px; font-size: 10px; color: #888; text-align: center; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="container">

  <h1>TOUR ITINERARY & QUOTATION</h1>

  <div class="row">
    <div class="col">
      {{#if company.logo}}<img src="{{company.logo}}" alt="Logo" style="max-height:50px;margin-bottom:4px;"><br>{{/if}}
      <div class="value">{{company.name}}</div>
      <div style="font-size:11px;color:#555">{{company.address}}</div>
      <div style="font-size:11px;color:#555">Ph: {{company.phone}} | {{company.email}}</div>
    </div>
    <div class="col" style="text-align:right">
      <div class="label">Quote No</div><div class="value">{{quotation.number}}</div>
      <div class="label" style="margin-top:4px">Date</div><div class="value">{{dateIN quotation.date}}</div>
      <div class="label" style="margin-top:4px">Valid Until</div><div class="value">{{dateIN quotation.validUntil}}</div>
    </div>
  </div>

  <div class="row">
    <div class="col" style="background:#f9fafb;padding:10px;border-radius:4px;">
      <div class="label">Guest Details</div>
      <div class="value">{{customer.name}}</div>
      <div style="font-size:11px;color:#555">{{customer.address}}</div>
      <div style="font-size:11px;color:#555">Ph: {{customer.phone}} | {{customer.email}}</div>
    </div>
  </div>

  {{#if quotation.subject}}
  <div style="background:#fffbeb;padding:8px 12px;border-radius:4px;margin-bottom:12px;">
    <strong style="color:#b45309">Tour:</strong> {{quotation.subject}}
  </div>
  {{/if}}

  <div class="section-title">Day-wise Itinerary</div>
  {{#each itinerary.days}}
  <div class="day-card">
    <h3>Day {{serialNo @index}}: {{this.title}}</h3>
    <p>{{this.description}}</p>
    <div class="meta">
      {{#if this.meals}}Meals: {{this.meals}}{{/if}}
      {{#if this.hotel}} | Hotel: {{this.hotel}}{{/if}}
    </div>
  </div>
  {{/each}}

  <div class="section-title">Cost Breakdown</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Particular</th>
        <th class="center">Qty</th>
        <th class="right">Rate</th>
        {{#showField "discount"}}<th class="right">Disc.</th>{{/showField}}
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{serialNo @index}}</td>
        <td>{{this.name}}{{#if this.description}}<br><span style="font-size:10px;color:#888">{{this.description}}</span>{{/if}}</td>
        <td class="center">{{this.qty}} {{this.unit}}</td>
        <td class="right">{{inr this.rate}}</td>
        {{#showField "discount"}}<td class="right">{{inr this.discount}}</td>{{/showField}}
        <td class="right">{{inr this.total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <table class="totals">
    <tr><td>Subtotal</td><td class="right">{{inr totals.subtotal}}</td></tr>
    {{#showField "discount"}}<tr><td>Discount</td><td class="right">- {{inr totals.totalDiscount}}</td></tr>{{/showField}}
    <tr><td>Tax</td><td class="right">{{inr totals.totalTax}}</td></tr>
    <tr class="grand"><td><strong>Total</strong></td><td class="right"><strong>{{inr totals.grandTotal}}</strong></td></tr>
  </table>

  <div class="words"><strong>Amount in Words:</strong> {{amountInWords totals.grandTotal}}</div>

  {{#if inclusions}}
  <div class="section-title">Inclusions</div>
  <div class="list-section">{{inclusions}}</div>
  {{/if}}

  {{#if exclusions}}
  <div class="section-title">Exclusions</div>
  <div class="list-section">{{exclusions}}</div>
  {{/if}}

  {{#if cancellationPolicy}}
  <div class="section-title">Cancellation Policy</div>
  <div class="list-section">{{cancellationPolicy}}</div>
  {{/if}}

  {{#if terms}}
  <div class="section-title">Terms & Conditions</div>
  <div class="list-section">{{terms}}</div>
  {{/if}}

  <div class="sign"><div class="line">Authorised Signatory</div></div>

</div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 7: PAYMENT RECEIPT (minimal)
// ═══════════════════════════════════════════════════════════════════════════════

const PAYMENT_RECEIPT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Payment Receipt</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
  .container { max-width: 210mm; margin: 0 auto; padding: 16px; border: 1px solid #ccc; }
  h1 { font-size: 20px; color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 6px; margin-bottom: 12px; }
  .row { display: flex; gap: 16px; margin-bottom: 12px; }
  .col { flex: 1; }
  .label { font-size: 10px; color: #888; text-transform: uppercase; }
  .value { font-size: 12px; font-weight: 600; }
  .detail-box { background: #f9fafb; padding: 12px; border-radius: 4px; margin-bottom: 12px; }
  .amount-box { background: #f0fdf4; border: 2px solid #16a34a; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0; }
  .amount-box .amount { font-size: 28px; font-weight: 800; color: #16a34a; }
  .amount-box .words { font-size: 11px; color: #555; margin-top: 4px; }
  table.details { width: 100%; border-collapse: collapse; margin: 12px 0; }
  table.details td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
  table.details td:first-child { color: #888; width: 40%; }
  .sign { text-align: right; margin-top: 40px; }
  .sign .line { border-top: 1px solid #333; display: inline-block; width: 160px; padding-top: 4px; font-size: 10px; color: #888; text-align: center; }
  .footer { font-size: 10px; color: #888; text-align: center; margin-top: 20px; border-top: 1px solid #eee; padding-top: 8px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .container { border: none; } }
</style>
</head>
<body>
<div class="container">

  <h1>PAYMENT RECEIPT</h1>

  <div class="row">
    <div class="col">
      {{#if company.logo}}<img src="{{company.logo}}" alt="Logo" style="max-height:50px;margin-bottom:4px;"><br>{{/if}}
      <div class="value">{{company.name}}</div>
      <div style="font-size:11px;color:#555">{{company.address}}</div>
      <div style="font-size:11px;color:#555">Ph: {{company.phone}}</div>
    </div>
    <div class="col" style="text-align:right">
      <div class="label">Receipt No</div><div class="value">{{receipt.number}}</div>
      <div class="label" style="margin-top:4px">Date</div><div class="value">{{dateIN receipt.date}}</div>
    </div>
  </div>

  <div class="detail-box">
    <div class="label">Received From</div>
    <div class="value">{{customer.name}}</div>
    <div style="font-size:11px;color:#555">{{customer.address}}</div>
    <div style="font-size:11px;color:#555">Ph: {{customer.phone}}</div>
  </div>

  <div class="amount-box">
    <div class="amount">{{inr receipt.amount}}</div>
    <div class="words">{{amountInWords receipt.amount}}</div>
  </div>

  <table class="details">
    <tr><td>Payment Mode</td><td>{{receipt.paymentMode}}</td></tr>
    {{#if receipt.referenceNo}}<tr><td>Reference / Txn No</td><td>{{receipt.referenceNo}}</td></tr>{{/if}}
    {{#if receipt.againstInvoice}}<tr><td>Against Invoice</td><td>{{receipt.againstInvoice}}</td></tr>{{/if}}
  </table>

  {{#if notes}}<div style="font-size:11px;color:#555;margin:12px 0"><strong>Notes:</strong> {{notes}}</div>{{/if}}

  <div class="sign"><div class="line">Authorised Signatory</div></div>

  <div class="footer">This is a computer-generated receipt and does not require a physical signature.</div>

</div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 8: PURCHASE ORDER (minimal)
// ═══════════════════════════════════════════════════════════════════════════════

const PURCHASE_ORDER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Purchase Order</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
  .container { max-width: 210mm; margin: 0 auto; padding: 16px; border: 1px solid #ccc; }
  h1 { font-size: 20px; color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 6px; margin-bottom: 12px; }
  .row { display: flex; gap: 16px; margin-bottom: 12px; }
  .col { flex: 1; }
  .label { font-size: 10px; color: #888; text-transform: uppercase; }
  .value { font-size: 12px; font-weight: 600; }
  .party-box { background: #f9fafb; padding: 10px; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #7c3aed; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
  td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
  .right { text-align: right; }
  .center { text-align: center; }
  .totals { width: 260px; margin-left: auto; margin-bottom: 12px; }
  .totals td { padding: 3px 8px; }
  .totals .grand { border-top: 2px solid #7c3aed; font-size: 14px; font-weight: 700; color: #7c3aed; }
  .words { background: #f5f3ff; padding: 8px; border-radius: 4px; font-size: 11px; margin-bottom: 12px; }
  .sign { text-align: right; margin-top: 40px; }
  .sign .line { border-top: 1px solid #333; display: inline-block; width: 160px; padding-top: 4px; font-size: 10px; color: #888; text-align: center; }
  .terms-section { font-size: 10px; color: #666; margin-top: 12px; border-top: 1px solid #eee; padding-top: 8px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .container { border: none; } }
</style>
</head>
<body>
<div class="container">

  <h1>PURCHASE ORDER</h1>

  <div class="row">
    <div class="col">
      {{#if company.logo}}<img src="{{company.logo}}" alt="Logo" style="max-height:50px;margin-bottom:4px;"><br>{{/if}}
      <div class="value">{{company.name}}</div>
      <div style="font-size:11px;color:#555">{{company.address}}</div>
      <div style="font-size:11px;color:#555">GSTIN: {{company.gstin}}</div>
    </div>
    <div class="col" style="text-align:right">
      <div class="label">PO No</div><div class="value">{{po.number}}</div>
      <div class="label" style="margin-top:4px">Date</div><div class="value">{{dateIN po.date}}</div>
      {{#if po.deliveryDate}}<div class="label" style="margin-top:4px">Delivery By</div><div class="value">{{dateIN po.deliveryDate}}</div>{{/if}}
    </div>
  </div>

  <div class="row">
    <div class="col party-box">
      <div class="label">Vendor</div>
      <div class="value">{{vendor.name}}</div>
      <div style="font-size:11px;color:#555">{{vendor.address}}</div>
      <div style="font-size:11px;color:#555">GSTIN: {{vendor.gstin}}</div>
      <div style="font-size:11px;color:#555">Ph: {{vendor.phone}} | {{vendor.email}}</div>
    </div>
    {{#if po.deliveryAddress}}
    <div class="col party-box">
      <div class="label">Deliver To</div>
      <div style="font-size:11px;color:#555">{{po.deliveryAddress}}</div>
    </div>
    {{/if}}
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item Description</th>
        {{#showField "hsn"}}<th class="center">HSN</th>{{/showField}}
        <th class="center">Qty</th>
        <th class="right">Rate</th>
        {{#showField "discount"}}<th class="right">Disc.</th>{{/showField}}
        <th class="right">Taxable</th>
        {{#isInterState}}<th class="right">IGST</th>{{else}}<th class="right">CGST</th><th class="right">SGST</th>{{/isInterState}}
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{serialNo @index}}</td>
        <td>{{this.name}}{{#if this.description}}<br><span style="font-size:10px;color:#888">{{this.description}}</span>{{/if}}</td>
        {{#showField "hsn"}}<td class="center">{{this.hsn}}</td>{{/showField}}
        <td class="center">{{this.qty}} {{this.unit}}</td>
        <td class="right">{{inr this.rate}}</td>
        {{#showField "discount"}}<td class="right">{{inr this.discount}}</td>{{/showField}}
        <td class="right">{{inr this.taxableAmount}}</td>
        {{#isInterState}}<td class="right">{{inr this.igst}}</td>{{else}}<td class="right">{{inr this.cgst}}</td><td class="right">{{inr this.sgst}}</td>{{/isInterState}}
        <td class="right">{{inr this.total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <table class="totals">
    <tr><td>Subtotal</td><td class="right">{{inr totals.subtotal}}</td></tr>
    {{#isInterState}}<tr><td>IGST</td><td class="right">{{inr totals.totalIgst}}</td></tr>{{else}}<tr><td>CGST</td><td class="right">{{inr totals.totalCgst}}</td></tr><tr><td>SGST</td><td class="right">{{inr totals.totalSgst}}</td></tr>{{/isInterState}}
    <tr class="grand"><td><strong>Grand Total</strong></td><td class="right"><strong>{{inr totals.grandTotal}}</strong></td></tr>
  </table>

  <div class="words"><strong>Amount in Words:</strong> {{amountInWords totals.grandTotal}}</div>

  <div class="sign"><div class="line">Authorised Signatory</div></div>

  {{#if terms}}<div class="terms-section"><strong>Terms & Conditions:</strong><br>{{terms}}</div>{{/if}}

</div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 9: DELIVERY CHALLAN (minimal)
// ═══════════════════════════════════════════════════════════════════════════════

const DELIVERY_CHALLAN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Delivery Challan</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
  .container { max-width: 210mm; margin: 0 auto; padding: 16px; border: 1px solid #ccc; }
  h1 { font-size: 20px; color: #0369a1; border-bottom: 2px solid #0369a1; padding-bottom: 6px; margin-bottom: 12px; }
  .row { display: flex; gap: 16px; margin-bottom: 12px; }
  .col { flex: 1; }
  .label { font-size: 10px; color: #888; text-transform: uppercase; }
  .value { font-size: 12px; font-weight: 600; }
  .party-box { background: #f9fafb; padding: 10px; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #0369a1; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
  td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
  .right { text-align: right; }
  .center { text-align: center; }
  .transport-info { background: #f0f9ff; padding: 10px; border-radius: 4px; margin-bottom: 12px; font-size: 11px; }
  .sign-row { display: flex; justify-content: space-between; margin-top: 40px; }
  .sign-col { text-align: center; width: 160px; }
  .sign-col .line { border-top: 1px solid #333; padding-top: 4px; font-size: 10px; color: #888; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .container { border: none; } }
</style>
</head>
<body>
<div class="container">

  <h1>DELIVERY CHALLAN</h1>

  <div class="row">
    <div class="col">
      {{#if company.logo}}<img src="{{company.logo}}" alt="Logo" style="max-height:50px;margin-bottom:4px;"><br>{{/if}}
      <div class="value">{{company.name}}</div>
      <div style="font-size:11px;color:#555">{{company.address}}</div>
      <div style="font-size:11px;color:#555">GSTIN: {{company.gstin}}</div>
    </div>
    <div class="col" style="text-align:right">
      <div class="label">Challan No</div><div class="value">{{challan.number}}</div>
      <div class="label" style="margin-top:4px">Date</div><div class="value">{{dateIN challan.date}}</div>
    </div>
  </div>

  <div class="row">
    <div class="col party-box">
      <div class="label">Deliver To</div>
      <div class="value">{{customer.name}}</div>
      <div style="font-size:11px;color:#555">{{customer.address}}</div>
      <div style="font-size:11px;color:#555">Ph: {{customer.phone}}</div>
    </div>
  </div>

  <div class="transport-info">
    {{#if challan.vehicleNo}}<strong>Vehicle No:</strong> {{challan.vehicleNo}} &nbsp; {{/if}}
    {{#if challan.transporterName}}<strong>Transporter:</strong> {{challan.transporterName}} &nbsp; {{/if}}
    {{#if challan.lrNo}}<strong>LR No:</strong> {{challan.lrNo}}{{/if}}
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item Description</th>
        {{#showField "hsn"}}<th class="center">HSN</th>{{/showField}}
        <th class="center">Qty</th>
        <th class="center">Unit</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{serialNo @index}}</td>
        <td>{{this.name}}{{#if this.description}}<br><span style="font-size:10px;color:#888">{{this.description}}</span>{{/if}}</td>
        {{#showField "hsn"}}<td class="center">{{this.hsn}}</td>{{/showField}}
        <td class="center">{{this.qty}}</td>
        <td class="center">{{this.unit}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  {{#if notes}}<div style="font-size:11px;color:#555;margin:12px 0"><strong>Notes:</strong> {{notes}}</div>{{/if}}

  <div class="sign-row">
    <div class="sign-col"><div class="line">Received By</div></div>
    <div class="sign-col"><div class="line">Authorised Signatory</div></div>
  </div>

</div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 10: SALE CHALLAN (minimal)
// ═══════════════════════════════════════════════════════════════════════════════

const SALE_CHALLAN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sale Challan</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
  .container { max-width: 210mm; margin: 0 auto; padding: 16px; border: 1px solid #ccc; }
  h1 { font-size: 20px; color: #059669; border-bottom: 2px solid #059669; padding-bottom: 6px; margin-bottom: 12px; }
  .row { display: flex; gap: 16px; margin-bottom: 12px; }
  .col { flex: 1; }
  .label { font-size: 10px; color: #888; text-transform: uppercase; }
  .value { font-size: 12px; font-weight: 600; }
  .party-box { background: #f9fafb; padding: 10px; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #059669; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
  td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
  .right { text-align: right; }
  .center { text-align: center; }
  .transport-info { background: #ecfdf5; padding: 10px; border-radius: 4px; margin-bottom: 12px; font-size: 11px; }
  .sign-row { display: flex; justify-content: space-between; margin-top: 40px; }
  .sign-col { text-align: center; width: 160px; }
  .sign-col .line { border-top: 1px solid #333; padding-top: 4px; font-size: 10px; color: #888; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .container { border: none; } }
</style>
</head>
<body>
<div class="container">

  <h1>SALE CHALLAN</h1>

  <div class="row">
    <div class="col">
      {{#if company.logo}}<img src="{{company.logo}}" alt="Logo" style="max-height:50px;margin-bottom:4px;"><br>{{/if}}
      <div class="value">{{company.name}}</div>
      <div style="font-size:11px;color:#555">{{company.address}}</div>
      <div style="font-size:11px;color:#555">GSTIN: {{company.gstin}}</div>
    </div>
    <div class="col" style="text-align:right">
      <div class="label">Challan No</div><div class="value">{{challan.number}}</div>
      <div class="label" style="margin-top:4px">Date</div><div class="value">{{dateIN challan.date}}</div>
    </div>
  </div>

  <div class="row">
    <div class="col party-box">
      <div class="label">Customer</div>
      <div class="value">{{customer.name}}</div>
      <div style="font-size:11px;color:#555">{{customer.address}}</div>
      <div style="font-size:11px;color:#555">Ph: {{customer.phone}}</div>
    </div>
  </div>

  <div class="transport-info">
    {{#if challan.vehicleNo}}<strong>Vehicle No:</strong> {{challan.vehicleNo}} &nbsp; {{/if}}
    {{#if challan.transporterName}}<strong>Transporter:</strong> {{challan.transporterName}} &nbsp; {{/if}}
    {{#if challan.lrNo}}<strong>LR No:</strong> {{challan.lrNo}}{{/if}}
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item Description</th>
        {{#showField "hsn"}}<th class="center">HSN</th>{{/showField}}
        <th class="center">Qty</th>
        <th class="center">Unit</th>
        <th class="right">Rate</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{serialNo @index}}</td>
        <td>{{this.name}}{{#if this.description}}<br><span style="font-size:10px;color:#888">{{this.description}}</span>{{/if}}</td>
        {{#showField "hsn"}}<td class="center">{{this.hsn}}</td>{{/showField}}
        <td class="center">{{this.qty}}</td>
        <td class="center">{{this.unit}}</td>
        <td class="right">{{inr this.rate}}</td>
        <td class="right">{{inr this.total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  {{#if notes}}<div style="font-size:11px;color:#555;margin:12px 0"><strong>Notes:</strong> {{notes}}</div>{{/if}}

  <div class="sign-row">
    <div class="sign-col"><div class="line">Received By</div></div>
    <div class="sign-col"><div class="line">Authorised Signatory</div></div>
  </div>

</div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 11: CREDIT NOTE (minimal)
// ═══════════════════════════════════════════════════════════════════════════════

const CREDIT_NOTE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Credit Note</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
  .container { max-width: 210mm; margin: 0 auto; padding: 16px; border: 1px solid #ccc; }
  h1 { font-size: 20px; color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 6px; margin-bottom: 12px; }
  .row { display: flex; gap: 16px; margin-bottom: 12px; }
  .col { flex: 1; }
  .label { font-size: 10px; color: #888; text-transform: uppercase; }
  .value { font-size: 12px; font-weight: 600; }
  .party-box { background: #f9fafb; padding: 10px; border-radius: 4px; }
  .reason-box { background: #fef2f2; border-left: 3px solid #dc2626; padding: 8px 12px; margin-bottom: 12px; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #dc2626; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
  td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
  .right { text-align: right; }
  .center { text-align: center; }
  .totals { width: 260px; margin-left: auto; margin-bottom: 12px; }
  .totals td { padding: 3px 8px; }
  .totals .grand { border-top: 2px solid #dc2626; font-size: 14px; font-weight: 700; color: #dc2626; }
  .words { background: #fef2f2; padding: 8px; border-radius: 4px; font-size: 11px; margin-bottom: 12px; }
  .sign { text-align: right; margin-top: 40px; }
  .sign .line { border-top: 1px solid #333; display: inline-block; width: 160px; padding-top: 4px; font-size: 10px; color: #888; text-align: center; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .container { border: none; } }
</style>
</head>
<body>
<div class="container">

  <h1>CREDIT NOTE</h1>

  <div class="row">
    <div class="col">
      {{#if company.logo}}<img src="{{company.logo}}" alt="Logo" style="max-height:50px;margin-bottom:4px;"><br>{{/if}}
      <div class="value">{{company.name}}</div>
      <div style="font-size:11px;color:#555">{{company.address}}</div>
      <div style="font-size:11px;color:#555">GSTIN: {{company.gstin}}</div>
    </div>
    <div class="col" style="text-align:right">
      <div class="label">Credit Note No</div><div class="value">{{creditNote.number}}</div>
      <div class="label" style="margin-top:4px">Date</div><div class="value">{{dateIN creditNote.date}}</div>
      {{#if creditNote.againstInvoice}}<div class="label" style="margin-top:4px">Against Invoice</div><div class="value">{{creditNote.againstInvoice}}</div>{{/if}}
    </div>
  </div>

  <div class="row">
    <div class="col party-box">
      <div class="label">Customer</div>
      <div class="value">{{customer.name}}</div>
      <div style="font-size:11px;color:#555">{{customer.address}}</div>
      {{#if customer.gstin}}<div style="font-size:11px;color:#555">GSTIN: {{customer.gstin}}</div>{{/if}}
    </div>
  </div>

  {{#if creditNote.reason}}
  <div class="reason-box"><strong>Reason:</strong> {{creditNote.reason}}</div>
  {{/if}}

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item Description</th>
        {{#showField "hsn"}}<th class="center">HSN</th>{{/showField}}
        <th class="center">Qty</th>
        <th class="right">Rate</th>
        <th class="right">Taxable</th>
        {{#isInterState}}<th class="right">IGST</th>{{else}}<th class="right">CGST</th><th class="right">SGST</th>{{/isInterState}}
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{serialNo @index}}</td>
        <td>{{this.name}}{{#if this.description}}<br><span style="font-size:10px;color:#888">{{this.description}}</span>{{/if}}</td>
        {{#showField "hsn"}}<td class="center">{{this.hsn}}</td>{{/showField}}
        <td class="center">{{this.qty}} {{this.unit}}</td>
        <td class="right">{{inr this.rate}}</td>
        <td class="right">{{inr this.taxableAmount}}</td>
        {{#isInterState}}<td class="right">{{inr this.igst}}</td>{{else}}<td class="right">{{inr this.cgst}}</td><td class="right">{{inr this.sgst}}</td>{{/isInterState}}
        <td class="right">{{inr this.total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <table class="totals">
    <tr><td>Subtotal</td><td class="right">{{inr totals.subtotal}}</td></tr>
    {{#isInterState}}<tr><td>IGST</td><td class="right">{{inr totals.totalIgst}}</td></tr>{{else}}<tr><td>CGST</td><td class="right">{{inr totals.totalCgst}}</td></tr><tr><td>SGST</td><td class="right">{{inr totals.totalSgst}}</td></tr>{{/isInterState}}
    <tr class="grand"><td><strong>Credit Total</strong></td><td class="right"><strong>{{inr totals.grandTotal}}</strong></td></tr>
  </table>

  <div class="words"><strong>Amount in Words:</strong> {{amountInWords totals.grandTotal}}</div>

  {{#if notes}}<div style="font-size:11px;color:#555;margin:12px 0"><strong>Notes:</strong> {{notes}}</div>{{/if}}

  <div class="sign"><div class="line">Authorised Signatory</div></div>

</div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 12: SALES REPORT (minimal)
// ═══════════════════════════════════════════════════════════════════════════════

const SALES_REPORT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sales Report</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
  .container { max-width: 290mm; margin: 0 auto; }
  h1 { font-size: 18px; color: #1a56db; margin-bottom: 4px; }
  .sub { font-size: 11px; color: #888; margin-bottom: 12px; }
  .summary-row { display: flex; gap: 16px; margin-bottom: 14px; }
  .summary-card { flex: 1; background: #f0f5ff; border-radius: 6px; padding: 12px; text-align: center; }
  .summary-card .num { font-size: 20px; font-weight: 800; color: #1a56db; }
  .summary-card .lbl { font-size: 10px; color: #888; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #1a56db; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
  td { padding: 5px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
  tr:nth-child(even) { background: #f9fafb; }
  .right { text-align: right; }
  .center { text-align: center; }
  .footer { font-size: 10px; color: #888; margin-top: 12px; text-align: right; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="container">

  {{#if company.logo}}<img src="{{company.logo}}" alt="Logo" style="max-height:40px;margin-bottom:6px;">{{/if}}
  <h1>{{report.title}}</h1>
  <div class="sub">{{company.name}} | Period: {{report.dateRange}} | Generated: {{dateIN report.generatedAt}}</div>

  <div class="summary-row">
    <div class="summary-card">
      <div class="num">{{summary.totalInvoices}}</div>
      <div class="lbl">Invoices</div>
    </div>
    <div class="summary-card">
      <div class="num">{{inr summary.totalSales}}</div>
      <div class="lbl">Total Sales</div>
    </div>
    <div class="summary-card">
      <div class="num">{{inr summary.totalTax}}</div>
      <div class="lbl">Total Tax</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Date</th>
        <th>Invoice No</th>
        <th>Customer</th>
        <th class="right">Taxable Amt</th>
        <th class="right">CGST</th>
        <th class="right">SGST</th>
        <th class="right">IGST</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each rows}}
      <tr>
        <td>{{serialNo @index}}</td>
        <td>{{dateIN this.date}}</td>
        <td>{{this.invoiceNo}}</td>
        <td>{{this.customerName}}</td>
        <td class="right">{{inr this.taxableAmount}}</td>
        <td class="right">{{inr this.cgst}}</td>
        <td class="right">{{inr this.sgst}}</td>
        <td class="right">{{inr this.igst}}</td>
        <td class="right">{{inr this.total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="footer">Report generated on {{dateIN report.generatedAt}}</div>

</div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 13: CUSTOMER STATEMENT (minimal)
// ═══════════════════════════════════════════════════════════════════════════════

const CUSTOMER_STATEMENT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Customer Statement</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
  .container { max-width: 210mm; margin: 0 auto; padding: 16px; border: 1px solid #ccc; }
  h1 { font-size: 20px; color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 6px; margin-bottom: 12px; }
  .row { display: flex; gap: 16px; margin-bottom: 12px; }
  .col { flex: 1; }
  .label { font-size: 10px; color: #888; text-transform: uppercase; }
  .value { font-size: 12px; font-weight: 600; }
  .party-box { background: #f9fafb; padding: 10px; border-radius: 4px; }
  .period-bar { background: #f0f5ff; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #1a56db; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
  td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
  tr:nth-child(even) { background: #f9fafb; }
  .right { text-align: right; }
  .center { text-align: center; }
  .closing { background: #f0f5ff; border: 2px solid #1a56db; border-radius: 6px; padding: 12px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; }
  .closing .lbl { font-size: 12px; color: #555; }
  .closing .amt { font-size: 20px; font-weight: 800; color: #1a56db; }
  .footer { font-size: 10px; color: #888; text-align: center; margin-top: 16px; border-top: 1px solid #eee; padding-top: 8px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .container { border: none; } }
</style>
</head>
<body>
<div class="container">

  <h1>STATEMENT OF ACCOUNT</h1>

  <div class="row">
    <div class="col">
      {{#if company.logo}}<img src="{{company.logo}}" alt="Logo" style="max-height:50px;margin-bottom:4px;"><br>{{/if}}
      <div class="value">{{company.name}}</div>
      <div style="font-size:11px;color:#555">{{company.address}}</div>
      <div style="font-size:11px;color:#555">Ph: {{company.phone}} | {{company.email}}</div>
    </div>
    <div class="col party-box">
      <div class="label">Customer</div>
      <div class="value">{{customer.name}}</div>
      <div style="font-size:11px;color:#555">{{customer.address}}</div>
      <div style="font-size:11px;color:#555">Ph: {{customer.phone}}</div>
    </div>
  </div>

  <div class="period-bar">
    <strong>Period:</strong> {{dateIN statement.fromDate}} to {{dateIN statement.toDate}}
    &nbsp; | &nbsp; <strong>Opening Balance:</strong> {{inr statement.openingBalance}}
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Particulars</th>
        <th>Voucher No</th>
        <th class="right">Debit</th>
        <th class="right">Credit</th>
        <th class="right">Balance</th>
      </tr>
    </thead>
    <tbody>
      {{#each rows}}
      <tr>
        <td>{{dateIN this.date}}</td>
        <td>{{this.particular}}</td>
        <td>{{this.voucherNo}}</td>
        <td class="right">{{#if this.debit}}{{inr this.debit}}{{else}}-{{/if}}</td>
        <td class="right">{{#if this.credit}}{{inr this.credit}}{{else}}-{{/if}}</td>
        <td class="right">{{inr this.balance}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="closing">
    <div>
      <div class="lbl">Total Debit: <strong>{{inr summary.totalDebit}}</strong></div>
      <div class="lbl">Total Credit: <strong>{{inr summary.totalCredit}}</strong></div>
    </div>
    <div style="text-align:right">
      <div style="font-size:10px;color:#888">CLOSING BALANCE</div>
      <div class="amt">{{inr summary.closingBalance}}</div>
    </div>
  </div>

  <div class="footer">This is a computer-generated statement and does not require a signature.</div>

</div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE DEFINITIONS ARRAY
// ═══════════════════════════════════════════════════════════════════════════════

export const DOCUMENT_TEMPLATES = [
  {
    code: 'gst-invoice-standard',
    name: 'GST Invoice - Standard',
    description: 'Professional GST-compliant tax invoice with classic layout. Supports intra-state (CGST+SGST) and inter-state (IGST) billing.',
    documentType: DocumentType.GST_INVOICE,
    htmlTemplate: GST_INVOICE_STANDARD_HTML,
    cssStyles: null,
    defaultSettings: DEFAULT_SETTINGS,
    availableFields: INVOICE_FIELDS,
    industryCode: null,
    sortOrder: 1,
    isDefault: true,
  },
  {
    code: 'gst-invoice-modern',
    name: 'GST Invoice - Modern',
    description: 'Modern, visually rich GST invoice with gradient accents and card-based layout. Ideal for brands seeking a contemporary look.',
    documentType: DocumentType.GST_INVOICE,
    htmlTemplate: GST_INVOICE_MODERN_HTML,
    cssStyles: null,
    defaultSettings: { ...DEFAULT_SETTINGS, colors: { primary: '#0f172a', secondary: '#7c3aed' } },
    availableFields: INVOICE_FIELDS,
    industryCode: null,
    sortOrder: 2,
    isDefault: false,
  },
  {
    code: 'restaurant-bill',
    name: 'Restaurant Bill',
    description: 'Compact 80mm thermal-printer-friendly bill for restaurants and food outlets. Includes table number, server, and service charge.',
    documentType: DocumentType.GST_INVOICE,
    htmlTemplate: RESTAURANT_BILL_HTML,
    cssStyles: null,
    defaultSettings: RESTAURANT_SETTINGS,
    availableFields: [...INVOICE_FIELDS, 'invoice.tableNo', 'invoice.serverName', 'totals.serviceCharge'],
    industryCode: 'RESTAURANT_FOOD',
    sortOrder: 3,
    isDefault: false,
  },
  {
    code: 'quotation-standard',
    name: 'Quotation - Standard',
    description: 'Professional quotation template with validity notice, subject line, and full GST tax breakdown.',
    documentType: DocumentType.QUOTATION,
    htmlTemplate: QUOTATION_STANDARD_HTML,
    cssStyles: null,
    defaultSettings: { ...DEFAULT_SETTINGS, colors: { primary: '#0d9488', secondary: '#6b7280' } },
    availableFields: QUOTATION_FIELDS,
    industryCode: null,
    sortOrder: 4,
    isDefault: true,
  },
  {
    code: 'quotation-detailed',
    name: 'Quotation - Detailed',
    description: 'Detailed quotation with scope sections, notes area, and comprehensive item breakdown.',
    documentType: DocumentType.QUOTATION,
    htmlTemplate: QUOTATION_DETAILED_HTML,
    cssStyles: null,
    defaultSettings: DEFAULT_SETTINGS,
    availableFields: QUOTATION_FIELDS,
    industryCode: null,
    sortOrder: 5,
    isDefault: false,
  },
  {
    code: 'tourism-itinerary-quote',
    name: 'Tour Itinerary & Quotation',
    description: 'Travel and tourism quotation with day-wise itinerary, inclusions/exclusions, and cancellation policy.',
    documentType: DocumentType.QUOTATION,
    htmlTemplate: TOURISM_ITINERARY_QUOTE_HTML,
    cssStyles: null,
    defaultSettings: { ...DEFAULT_SETTINGS, colors: { primary: '#b45309', secondary: '#f59e0b' } },
    availableFields: TOURISM_QUOTE_FIELDS,
    industryCode: 'TRAVEL_TOURISM',
    sortOrder: 6,
    isDefault: false,
  },
  {
    code: 'payment-receipt',
    name: 'Payment Receipt',
    description: 'Clean payment receipt showing amount received, payment mode, and reference details.',
    documentType: DocumentType.RECEIPT,
    htmlTemplate: PAYMENT_RECEIPT_HTML,
    cssStyles: null,
    defaultSettings: RECEIPT_SETTINGS,
    availableFields: RECEIPT_FIELDS,
    industryCode: null,
    sortOrder: 7,
    isDefault: true,
  },
  {
    code: 'purchase-order-standard',
    name: 'Purchase Order - Standard',
    description: 'Standard purchase order template with vendor details, delivery date, and GST breakdown.',
    documentType: DocumentType.PURCHASE_ORDER,
    htmlTemplate: PURCHASE_ORDER_HTML,
    cssStyles: null,
    defaultSettings: { ...DEFAULT_SETTINGS, colors: { primary: '#7c3aed', secondary: '#6b7280' } },
    availableFields: PO_FIELDS,
    industryCode: null,
    sortOrder: 8,
    isDefault: true,
  },
  {
    code: 'delivery-challan',
    name: 'Delivery Challan',
    description: 'Delivery challan for goods dispatch with vehicle details, transporter info, and receiver acknowledgement.',
    documentType: DocumentType.DELIVERY_CHALLAN,
    htmlTemplate: DELIVERY_CHALLAN_HTML,
    cssStyles: null,
    defaultSettings: { ...DEFAULT_SETTINGS, colors: { primary: '#0369a1', secondary: '#6b7280' } },
    availableFields: CHALLAN_FIELDS,
    industryCode: null,
    sortOrder: 9,
    isDefault: true,
  },
  {
    code: 'sale-challan',
    name: 'Sale Challan',
    description: 'Sale challan for goods sold with transport details, quantities, and rates.',
    documentType: DocumentType.SALE_CHALLAN,
    htmlTemplate: SALE_CHALLAN_HTML,
    cssStyles: null,
    defaultSettings: { ...DEFAULT_SETTINGS, colors: { primary: '#059669', secondary: '#6b7280' } },
    availableFields: CHALLAN_FIELDS,
    industryCode: null,
    sortOrder: 10,
    isDefault: true,
  },
  {
    code: 'credit-note',
    name: 'Credit Note',
    description: 'Credit note for returns, adjustments, or billing corrections with GST reversal details.',
    documentType: DocumentType.CREDIT_NOTE,
    htmlTemplate: CREDIT_NOTE_HTML,
    cssStyles: null,
    defaultSettings: { ...DEFAULT_SETTINGS, colors: { primary: '#dc2626', secondary: '#6b7280' } },
    availableFields: CREDIT_NOTE_FIELDS,
    industryCode: null,
    sortOrder: 11,
    isDefault: true,
  },
  {
    code: 'sales-report',
    name: 'Sales Report',
    description: 'Tabular sales report with summary cards, date-wise invoice listing, and tax breakdowns.',
    documentType: DocumentType.SALES_REPORT,
    htmlTemplate: SALES_REPORT_HTML,
    cssStyles: null,
    defaultSettings: { ...REPORT_SETTINGS, paper: { size: 'A4', orientation: 'landscape' } },
    availableFields: SALES_REPORT_FIELDS,
    industryCode: null,
    sortOrder: 12,
    isDefault: true,
  },
  {
    code: 'customer-statement',
    name: 'Customer Statement',
    description: 'Statement of account showing all transactions with running balance for a customer over a period.',
    documentType: DocumentType.CUSTOMER_STATEMENT,
    htmlTemplate: CUSTOMER_STATEMENT_HTML,
    cssStyles: null,
    defaultSettings: REPORT_SETTINGS,
    availableFields: STATEMENT_FIELDS,
    industryCode: null,
    sortOrder: 13,
    isDefault: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export async function seedDocumentTemplates(prisma: PrismaClient): Promise<void> {
  console.log('  Seeding document templates...');

  let created = 0;
  let updated = 0;

  for (const tmpl of DOCUMENT_TEMPLATES) {
    const existing = await prisma.documentTemplate.findFirst({
      where: { code: tmpl.code, tenantId: null },
    });

    if (existing) {
      await prisma.documentTemplate.update({
        where: { id: existing.id },
        data: {
          name: tmpl.name,
          description: tmpl.description,
          documentType: tmpl.documentType,
          htmlTemplate: tmpl.htmlTemplate,
          cssStyles: tmpl.cssStyles,
          defaultSettings: tmpl.defaultSettings,
          availableFields: tmpl.availableFields,
          industryCode: tmpl.industryCode,
          sortOrder: tmpl.sortOrder,
          isDefault: tmpl.isDefault,
          isSystem: true,
        },
      });
      updated++;
    } else {
      await prisma.documentTemplate.create({
        data: {
          code: tmpl.code,
          name: tmpl.name,
          description: tmpl.description,
          documentType: tmpl.documentType,
          htmlTemplate: tmpl.htmlTemplate,
          cssStyles: tmpl.cssStyles,
          defaultSettings: tmpl.defaultSettings,
          availableFields: tmpl.availableFields,
          industryCode: tmpl.industryCode,
          sortOrder: tmpl.sortOrder,
          isDefault: tmpl.isDefault,
          isSystem: true,
          tenantId: null,
        },
      });
      created++;
    }
  }

  console.log(`  Document templates: ${created} created, ${updated} updated (${DOCUMENT_TEMPLATES.length} total)`);
}
