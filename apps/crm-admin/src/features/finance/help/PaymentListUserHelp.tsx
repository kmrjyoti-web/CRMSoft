'use client';

import { Icon } from '@/components/ui';

export function PaymentListUserHelp() {
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
          The Payments screen shows all recorded payments across your invoices.
          Each payment is linked to a specific invoice and tracks the amount, payment
          method (Cash, Cheque, UPI, Bank Transfer, Credit/Debit Card, Net Banking,
          Razorpay, Stripe, etc.), current status, and timestamp. Click any row to
          view the full payment details in a side panel.
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
          <li>Open an invoice that has an outstanding balance</li>
          <li>Click <strong>Record Payment</strong> to log a new payment against that invoice</li>
          <li>Select the payment method (Cash, UPI, Cheque, Bank Transfer, etc.)</li>
          <li>Enter the amount received and any reference details (transaction ID, cheque number)</li>
          <li>Save &mdash; the invoice&rsquo;s Paid Amount and Balance Amount update automatically</li>
          <li>View recorded payments in this list, filtered by status, date range, or invoice</li>
          <li>If a refund is needed, process it from the payment detail &mdash; the invoice balance adjusts accordingly</li>
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
            <strong>Payment Methods</strong> &mdash; Each method captures different reference fields:
            Cheque captures cheque number, date, and bank name; UPI captures the transaction ID;
            Bank Transfer captures the transaction reference.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <strong>Payment Status</strong> &mdash; Payments progress through statuses: Pending &rarr;
            Authorized &rarr; Captured &rarr; Paid. Failed payments are flagged with a failure reason.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            <strong>Refunds</strong> &mdash; Partial or full refunds can be issued against any paid payment.
            The status changes to Refunded or Partially Refunded, and the linked invoice balance updates.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            <strong>View-Only List</strong> &mdash; Payments are recorded from the invoice screen.
            This list is a read-only view for tracking and auditing all payment activity.
          </div>
        </div>
      </section>
    </div>
  );
}
