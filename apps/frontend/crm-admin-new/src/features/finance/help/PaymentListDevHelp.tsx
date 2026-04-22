'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function PaymentListDevHelp() {
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
          <p className="font-semibold text-gray-700">model Payment {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, paymentNo (unique)</p>
          <p className="ml-4 text-gray-500">invoiceId &rarr; Invoice</p>
          <p className="ml-4 text-gray-500">amount Decimal, currency String (default &quot;INR&quot;)</p>
          <p className="ml-4 text-gray-500">status: PENDING | AUTHORIZED | CAPTURED | PAID | FAILED | REFUNDED | PARTIALLY_REFUNDED</p>
          <p className="ml-4 text-gray-500">method: CASH | CHEQUE | BANK_TRANSFER | UPI | CREDIT_CARD | DEBIT_CARD | NET_BANKING | WALLET | RAZORPAY | STRIPE | OTHER</p>
          <p className="ml-4 text-gray-500">gateway: RAZORPAY | STRIPE | MANUAL</p>
          <p className="ml-4 text-gray-500">gatewayOrderId?, gatewayPaymentId?</p>
          <p className="ml-4 text-gray-500">chequeNumber?, chequeDate?, chequeBankName?</p>
          <p className="ml-4 text-gray-500">transactionRef?, upiTransactionId?</p>
          <p className="ml-4 text-gray-500">paidAt?, notes?, failureReason?</p>
          <p className="ml-4 text-gray-500">recordedById &rarr; User</p>
          <p className="ml-4 text-gray-500">receipt? &rarr; PaymentReceipt, refunds[] &rarr; Refund</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
        <div className="mt-2 rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model Refund {'{'}</p>
          <p className="ml-4 text-gray-500">id, refundNo, paymentId &rarr; Payment</p>
          <p className="ml-4 text-gray-500">amount Decimal, reason String</p>
          <p className="ml-4 text-gray-500">status: REFUND_PENDING | REFUND_PROCESSED | REFUND_FAILED | REFUND_CANCELLED</p>
          <p className="ml-4 text-gray-500">gatewayRefundId?, processedAt?, failureReason?</p>
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
            { method: 'GET', path: '/api/v1/payments', desc: 'List (filter: invoiceId, status, fromDate, toDate)' },
            { method: 'GET', path: '/api/v1/payments/:id', desc: 'Detail with invoice, receipt, refunds' },
            { method: 'POST', path: '/api/v1/payments/record', desc: 'Record a payment against an invoice' },
            { method: 'POST', path: '/api/v1/refunds', desc: 'Create refund against a payment' },
            { method: 'GET', path: '/api/v1/credit-notes', desc: 'List credit notes (filter: invoiceId, status)' },
            { method: 'GET', path: '/api/v1/credit-notes/:id', desc: 'Credit note detail' },
            { method: 'POST', path: '/api/v1/credit-notes', desc: 'Create credit note for an invoice' },
            { method: 'POST', path: '/api/v1/credit-notes/:id/issue', desc: 'Issue a draft credit note' },
            { method: 'POST', path: '/api/v1/credit-notes/:id/apply', desc: 'Apply credit note to another invoice' },
            { method: 'POST', path: '/api/v1/credit-notes/:id/cancel', desc: 'Cancel a credit note' },
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
          <p className="text-gray-500">app/(main)/finance/payments/page.tsx</p>
          <p className="ml-4 text-blue-700">&larr; PaymentList.tsx</p>
          <p className="ml-8 text-gray-500">&boxur;&boxh; TableFull (columns: paymentNo, invoiceNo, amount, method, status, paidAt)</p>
          <p className="ml-8 text-gray-500">&boxur;&boxh; useEntityPanel (viewOnly: true &mdash; read-only side panel)</p>
          <p className="ml-8 text-gray-500">&boxur;&boxh; useTableFilters(PAYMENT_FILTER_CONFIG)</p>
          <p className="ml-8 text-gray-500">&boxur;&boxh; flattenPayments() &mdash; joins invoice.invoiceNo, formats currency/dates</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>paymentService</Code>, <Code>creditNoteService</Code>, <Code>refundService</Code> in finance.service.ts</p>
          <p className="text-gray-500">Query key: <Code>[&quot;payments&quot;, params]</Code></p>
          <p className="text-gray-500">Hooks: <Code>usePaymentsList</Code>, <Code>usePaymentDetail</Code>, <Code>useRecordPayment</Code></p>
          <p className="text-gray-500">Credit note hooks: <Code>useCreateCreditNote</Code>, <Code>useIssueCreditNote</Code>, <Code>useApplyCreditNote</Code>, <Code>useCancelCreditNote</Code></p>
          <p className="text-gray-500">Refund hook: <Code>useCreateRefund</Code></p>
          <p className="text-gray-500">Types: <Code>PaymentListItem</Code>, <Code>PaymentDetail</Code>, <Code>RecordPaymentData</Code>, <Code>Refund</Code>, <Code>CreditNote</Code></p>
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
            <span><strong>View-only list</strong> &mdash; PaymentList uses <Code>viewOnly: true</Code> in useEntityPanel (no create button, side panel is read-only)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Recording a payment uses <Code>POST /payments/record</Code> (not <Code>POST /payments</Code>)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span><Code>useRecordPayment</Code> invalidates both <Code>[&quot;payments&quot;]</Code> and <Code>[&quot;invoices&quot;]</Code> query keys to sync balances</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span><Code>useCreateRefund</Code> also cross-invalidates both payments and invoices query caches</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Payment methods conditionally show extra fields: cheque fields for CHEQUE, upiTransactionId for UPI, transactionRef for BANK_TRANSFER</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Amount fields are <Code>Decimal</Code> &mdash; frontend formats with <Code>formatCurrency()</Code> using INR symbol and en-IN locale</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
