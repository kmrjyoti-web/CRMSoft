'use client';

import { Icon } from '@/components/ui';

export function InvoiceListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="file-text" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Invoices screen is your central hub for managing all customer invoices.
          Each invoice tracks billing details, line items with GST calculations
          (CGST/SGST for intra-state, IGST for inter-state), payment status, and
          outstanding balances. Invoices can be created manually or generated directly
          from accepted quotations.
        </p>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="activity" size={14} className="text-green-600" />
          </span>
          Typical Workflow
        </h3>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>Click <strong>+ Create</strong> to create a new invoice, or generate one from a quotation</li>
          <li>Enter billing name, address, GST number, and shipping details</li>
          <li>Add line items with product name, quantity, unit price, HSN code, and GST rate</li>
          <li>Review the auto-calculated subtotal, discount, tax breakdown, and total amount</li>
          <li>Save as <strong>Draft</strong>, then <strong>Send</strong> to the customer</li>
          <li>Record payments as they come in &mdash; the balance updates automatically</li>
          <li>Once fully paid, the invoice status moves to <strong>Paid</strong></li>
        </ol>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <Icon name="info" size={14} className="text-amber-600" />
          </span>
          Tips
        </h3>
        <div className="space-y-2">
          <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <strong>GST Calculation</strong> &mdash; Mark the invoice as &quot;Inter-State&quot;
            when the buyer is in a different state. This switches from CGST+SGST to IGST automatically.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <strong>Generate from Quotation</strong> &mdash; Use the &quot;Generate Invoice&quot; option to
            pre-fill all line items, pricing, and customer details from an accepted quotation.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            <strong>Partial Payments</strong> &mdash; Invoices support multiple partial payments.
            The Paid Amount and Balance Amount columns update in real time as payments are recorded.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            <strong>Credit Notes</strong> &mdash; If you need to adjust an invoice after sending,
            issue a credit note instead of cancelling and recreating the invoice.
          </div>
        </div>
      </section>
    </div>
  );
}
