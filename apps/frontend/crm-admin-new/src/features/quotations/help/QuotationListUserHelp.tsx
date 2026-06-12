'use client';

import { Icon } from '@/components/ui';

export function QuotationListUserHelp() {
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
          The Quotations list shows every quotation created for your leads and
          contacts. Each quotation contains line items with product details,
          pricing, discounts, and GST calculations (CGST/SGST for same-state or
          IGST for inter-state transactions). From here you can create, edit,
          send, revise, clone, or cancel quotations and track their lifecycle
          through statuses like Draft, Sent, Accepted, and Rejected.
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
          <li>Click <strong>+ Create</strong> to start a new quotation</li>
          <li>Select the <strong>Lead</strong> (and optionally a contact person / organization)</li>
          <li>Add line items &mdash; enter product name, quantity, unit price, discount, and GST rate</li>
          <li>Choose <strong>Same State</strong> (CGST + SGST) or <strong>Inter State</strong> (IGST) tax region</li>
          <li>Optionally apply a <strong>global discount</strong> (percentage or flat amount)</li>
          <li>Review the auto-calculated summary: subtotal, tax breakdown, round-off, and total</li>
          <li>Fill in validity dates, payment terms, delivery terms, and warranty terms</li>
          <li>Save the quotation &mdash; it starts in <strong>Draft</strong> status</li>
          <li>Send the quotation via Email, WhatsApp, Portal, or download as PDF</li>
          <li>Once accepted, the quotation can be <strong>converted to an invoice</strong> in the Finance module</li>
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
            <strong>GST Compliance:</strong> Make sure each line item has the correct HSN code and
            GST rate. The system auto-splits tax into CGST/SGST or IGST based on
            the tax region you select.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <strong>Revise & Clone:</strong> If a customer requests changes after sending, use
            <strong> Revise</strong> to create a new version linked to the original. Use
            <strong> Clone</strong> to duplicate a quotation for a different lead.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            <strong>Validity Dates:</strong> Set &quot;Valid From&quot; and &quot;Valid Until&quot; dates so customers
            know when the pricing expires. Expired quotations are automatically
            flagged.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            <strong>Optional Items:</strong> Mark line items as &quot;optional&quot; to give the customer
            flexibility &mdash; optional items are shown separately and excluded from
            the mandatory total.
          </div>
        </div>
      </section>
    </div>
  );
}
