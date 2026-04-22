'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function InvoiceListDevHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="database" size={14} className="text-blue-600" />
          </span>
          Prisma Model (key fields)
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model Invoice {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, invoiceNo (unique)</p>
          <p className="ml-4 text-gray-500">status: DRAFT | SENT | PARTIALLY_PAID | PAID | OVERDUE | CANCELLED | VOID</p>
          <p className="ml-4 text-gray-500">quotationId? &rarr; Quotation, leadId?, contactId?, organizationId?</p>
          <p className="ml-4 text-gray-500">billingName, billingAddress?, billingCity?, billingState?, billingPincode?, billingGstNumber?</p>
          <p className="ml-4 text-gray-500">shippingName?, shippingAddress?, shippingCity?, shippingState?, shippingPincode?</p>
          <p className="ml-4 text-gray-500">sellerName, sellerAddress?, sellerCity?, sellerState?, sellerGstNumber?, sellerPanNumber?</p>
          <p className="ml-4 text-gray-500">invoiceDate, dueDate, supplyDate?</p>
          <p className="ml-4 text-gray-500">subtotal, discountAmount, taxableAmount (Decimal)</p>
          <p className="ml-4 text-gray-500">cgstAmount, sgstAmount, igstAmount, cessAmount, totalTax (Decimal)</p>
          <p className="ml-4 text-gray-500">roundOff, totalAmount, paidAmount, balanceAmount (Decimal)</p>
          <p className="ml-4 text-gray-500">isInterState Boolean</p>
          <p className="ml-4 text-gray-500">lineItems[] &rarr; InvoiceLineItem, payments[] &rarr; Payment, creditNotes[] &rarr; CreditNote</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
        <div className="mt-2 rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model InvoiceLineItem {'{'}</p>
          <p className="ml-4 text-gray-500">id, invoiceId, productName, hsnCode?, quantity, unitPrice</p>
          <p className="ml-4 text-gray-500">discountAmount, lineTotal, gstRate?, cgstAmount, sgstAmount, igstAmount</p>
          <p className="ml-4 text-gray-500">cessRate?, cessAmount, taxAmount, totalWithTax, sortOrder</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="globe" size={14} className="text-green-600" />
          </span>
          API Endpoints
        </h3>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/api/v1/invoices', desc: 'List (paginated, filter: status, contactId, orgId, fromDate, toDate)' },
            { method: 'GET', path: '/api/v1/invoices/:id', desc: 'Detail with lineItems, payments, creditNotes' },
            { method: 'POST', path: '/api/v1/invoices', desc: 'Create invoice with lineItems[]' },
            { method: 'PUT', path: '/api/v1/invoices/:id', desc: 'Update (billing/shipping/notes only, not line items)' },
            { method: 'POST', path: '/api/v1/invoices/generate', desc: 'Generate from quotation (quotationId + dueDate)' },
            { method: 'POST', path: '/api/v1/invoices/:id/send', desc: 'Mark as SENT' },
            { method: 'POST', path: '/api/v1/invoices/:id/cancel', desc: 'Cancel with reason' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'PUT' ? 'warning' : 'danger'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
            <Icon name="layers" size={14} className="text-purple-600" />
          </span>
          Frontend Architecture
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="text-gray-500">app/(main)/finance/invoices/page.tsx</p>
          <p className="ml-4 text-blue-700">&larr; InvoiceList.tsx</p>
          <p className="ml-8 text-gray-500">&boxur;&boxh; TableFull (columns: invoiceNo, billingName, status, totalAmount, paidAmount, balanceAmount, dueDate)</p>
          <p className="ml-8 text-gray-500">&boxur;&boxh; useEntityPanel &rarr; InvoiceForm (sidebar CRUD)</p>
          <p className="ml-8 text-gray-500">&boxur;&boxh; useTableFilters(INVOICE_FILTER_CONFIG)</p>
          <p className="ml-8 text-gray-500">&boxur;&boxh; flattenInvoices() — formats currency, dates</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>invoiceService</Code> in finance.service.ts</p>
          <p className="text-gray-500">Query key: <Code>[&quot;invoices&quot;, params]</Code></p>
          <p className="text-gray-500">Hooks: <Code>useInvoicesList</Code>, <Code>useInvoiceDetail</Code>, <Code>useCreateInvoice</Code>, <Code>useUpdateInvoice</Code>, <Code>useGenerateInvoice</Code>, <Code>useSendInvoice</Code>, <Code>useCancelInvoice</Code></p>
          <p className="text-gray-500">Types: <Code>InvoiceListItem</Code>, <Code>InvoiceDetail</Code>, <Code>InvoiceCreateData</Code>, <Code>InvoiceUpdateData</Code></p>
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
            <Icon name="alert-triangle" size={14} className="text-red-600" />
          </span>
          Key Patterns
        </h3>
        <ul className="space-y-2 text-xs">
          <li className="flex items-start gap-2">
            <Icon name="alert-triangle" size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <span><strong>GST logic</strong> &mdash; <Code>isInterState</Code> toggles between CGST+SGST and IGST on all line items</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span><strong>Generate from quotation</strong> uses <Code>POST /invoices/generate</Code> (not <Code>POST /invoices</Code>)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Cancel uses <Code>POST /invoices/:id/cancel</Code> with a reason (not DELETE)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Price fields are <Code>Decimal</Code> &mdash; frontend formats with <Code>formatCurrency()</Code> (INR, en-IN locale)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Recording a payment invalidates both <Code>[&quot;payments&quot;]</Code> and <Code>[&quot;invoices&quot;]</Code> query keys</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Related services: <Code>creditNoteService</Code> and <Code>refundService</Code> in the same service file</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
