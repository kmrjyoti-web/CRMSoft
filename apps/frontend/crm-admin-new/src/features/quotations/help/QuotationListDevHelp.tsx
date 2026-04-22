'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function QuotationListDevHelp() {
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
          <p className="font-semibold text-gray-700">model Quotation {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, quotationNo, version</p>
          <p className="ml-4 text-gray-500">status (DRAFT|INTERNAL_REVIEW|SENT|VIEWED|NEGOTIATION|ACCEPTED|REJECTED|EXPIRED|REVISED|CANCELLED)</p>
          <p className="ml-4 text-gray-500">title?, summary?, coverNote?</p>
          <p className="ml-4 text-gray-500">subtotal, discountType?, discountValue?, discountAmount (Decimal)</p>
          <p className="ml-4 text-gray-500">taxableAmount, cgstAmount, sgstAmount, igstAmount, cessAmount, totalTax</p>
          <p className="ml-4 text-gray-500">roundOff, totalAmount (Decimal)</p>
          <p className="ml-4 text-gray-500">priceType? (FIXED|RANGE|NEGOTIABLE), minAmount?, maxAmount?, plusMinusPercent?</p>
          <p className="ml-4 text-gray-500">validFrom?, validUntil?</p>
          <p className="ml-4 text-gray-500">paymentTerms?, deliveryTerms?, warrantyTerms?, termsConditions?</p>
          <p className="ml-4 text-gray-500">tags String[], internalNotes?</p>
          <p className="ml-4 text-gray-500">parentQuotationId? &rarr; self (revision chain)</p>
          <p className="ml-4 text-gray-500">leadId &rarr; Lead, contactPersonId? &rarr; Contact, organizationId? &rarr; Organization</p>
          <p className="ml-4 text-gray-500">acceptedAt?, acceptedNote?, rejectedAt?, rejectedReason?</p>
          <p className="ml-4 text-gray-500">lineItems[] &rarr; QuotationLineItem, sendLogs[] &rarr; QuotationSendLog</p>
          <p className="text-gray-700">{'}'}</p>
        </div>

        <div className="mt-3 rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model QuotationLineItem {'{'}</p>
          <p className="ml-4 text-gray-500">id, quotationId, productName, description?, hsnCode?</p>
          <p className="ml-4 text-gray-500">quantity, unit?, unitPrice, mrp? (Decimal)</p>
          <p className="ml-4 text-gray-500">discountType?, discountValue?, discountAmount</p>
          <p className="ml-4 text-gray-500">lineTotal, gstRate?, cgstAmount, sgstAmount, igstAmount</p>
          <p className="ml-4 text-gray-500">cessRate?, cessAmount, taxAmount, totalWithTax</p>
          <p className="ml-4 text-gray-500">sortOrder, isOptional, notes?</p>
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
            { method: 'GET', path: '/api/v1/quotations', desc: 'List (paginated, filterable by status/leadId/userId/date)' },
            { method: 'GET', path: '/api/v1/quotations/:id', desc: 'Detail with lineItems[] and sendLogs[]' },
            { method: 'POST', path: '/api/v1/quotations', desc: 'Create with inline items[]' },
            { method: 'PUT', path: '/api/v1/quotations/:id', desc: 'Update header fields (not items)' },
            { method: 'DELETE', path: '/api/v1/quotations/:id', desc: 'Cancel quotation (soft delete)' },
            { method: 'POST', path: '/api/v1/quotations/:id/items', desc: 'Add line item' },
            { method: 'PUT', path: '/api/v1/quotations/:id/items/:itemId', desc: 'Update line item' },
            { method: 'DELETE', path: '/api/v1/quotations/:id/items/:itemId', desc: 'Remove line item' },
            { method: 'POST', path: '/api/v1/quotations/:id/recalculate', desc: 'Server-side GST recalculation' },
            { method: 'POST', path: '/api/v1/quotations/:id/send', desc: 'Send via channel (EMAIL|WHATSAPP|PORTAL|MANUAL|DOWNLOAD)' },
            { method: 'POST', path: '/api/v1/quotations/:id/accept', desc: 'Mark accepted (with optional note)' },
            { method: 'POST', path: '/api/v1/quotations/:id/reject', desc: 'Mark rejected (reason required)' },
            { method: 'POST', path: '/api/v1/quotations/:id/revise', desc: 'Create new version (parentQuotationId linked)' },
            { method: 'POST', path: '/api/v1/quotations/:id/clone', desc: 'Duplicate quotation' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge
                variant={
                  ep.method === 'GET'
                    ? 'primary'
                    : ep.method === 'POST'
                      ? 'success'
                      : ep.method === 'PUT'
                        ? 'warning'
                        : 'danger'
                }
              >
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
          <p className="text-gray-500">app/(main)/quotations/page.tsx</p>
          <p className="ml-4 text-blue-700">&larr; QuotationList.tsx</p>
          <p className="ml-8 text-gray-500">&larr; TableFull (columns: quotationNo, title, lead, status, totalAmount, validUntil)</p>
          <p className="ml-8 text-gray-500">&larr; useEntityPanel &rarr; QuotationForm (sidebar CRUD)</p>
          <p className="ml-8 text-gray-500">&larr; useTableFilters(QUOTATION_FILTER_CONFIG)</p>
          <p className="ml-4 text-blue-700">&larr; QuotationForm.tsx</p>
          <p className="ml-8 text-gray-500">&larr; useFieldArray for line items</p>
          <p className="ml-8 text-gray-500">&larr; calculateLineItem / calculateSummary (gst.ts)</p>
          <p className="ml-8 text-gray-500">&larr; LookupSelect (GST_RATE, DISCOUNT_TYPE, UNIT_OF_MEASURE, QUOTATION_PRICE_TYPE)</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>quotationsService</Code> in quotations.service.ts</p>
          <p className="text-gray-500">Query key: <Code>[&quot;quotations&quot;, params]</Code></p>
          <p className="text-gray-500">13 React Query hooks: <Code>useQuotationsList</Code>, <Code>useQuotationDetail</Code>, <Code>useCreateQuotation</Code>, <Code>useUpdateQuotation</Code>, <Code>useCancelQuotation</Code>, <Code>useAddLineItem</Code>, <Code>useUpdateLineItem</Code>, <Code>useRemoveLineItem</Code>, <Code>useRecalculate</Code>, <Code>useSendQuotation</Code>, <Code>useAcceptQuotation</Code>, <Code>useRejectQuotation</Code>, <Code>useReviseQuotation</Code>, <Code>useCloneQuotation</Code></p>
          <p className="text-gray-500">GST utils: <Code>calculateLineItem()</Code> and <Code>calculateSummary()</Code> in utils/gst.ts</p>
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
            <span><strong>GST split logic:</strong> Same-state = CGST (rate/2) + SGST (rate/2); Inter-state = IGST (full rate). Controlled by <Code>isInterState</Code> toggle in QuotationForm.</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="alert-triangle" size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <span><strong>Create includes items:</strong> <Code>POST /quotations</Code> accepts an <Code>items[]</Code> array &mdash; line items are created atomically with the quotation header.</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span><strong>Update is header-only:</strong> <Code>PUT /quotations/:id</Code> updates metadata only. Line items are managed via separate <Code>/items</Code> sub-resource endpoints.</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span><strong>Cancel uses DELETE:</strong> <Code>DELETE /quotations/:id</Code> performs a soft cancel (status &rarr; CANCELLED), not a hard delete.</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span><strong>Revision chain:</strong> <Code>revise()</Code> creates a new quotation with <Code>parentQuotationId</Code> pointing to the original, incrementing <Code>version</Code>.</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span><strong>Live calculation:</strong> QuotationForm uses <Code>watch()</Code> + <Code>useMemo</Code> to recalculate subtotal, tax, and total in real-time as the user edits line items.</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span><strong>Currency format:</strong> All amounts use INR (<Code>&#x20B9;</Code>) with <Code>en-IN</Code> locale formatting and 2 decimal places.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
