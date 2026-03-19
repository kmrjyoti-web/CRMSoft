'use client';

import { useMemo, useState } from 'react';

import {
  Card,
  SelectInput,
  Input,
  Button,
  Badge,
  Icon,
  CurrencyInput,
  DatePicker,
  TableFull,
} from '@/components/ui';

import {
  useBankList,
  useBankReconciliation,
  useSubmitReconciliation,
} from '../hooks/useAccounts';

import { formatCurrency } from "@/lib/format-currency";

// ---------------------------------------------------------------------------
// Column definitions for unreconciled payments
// ---------------------------------------------------------------------------

const UNRECONCILED_COLUMNS = [
  { id: 'paymentNo', label: 'Payment No', visible: true },
  { id: 'date', label: 'Date', visible: true },
  { id: 'description', label: 'Description', visible: true },
  { id: 'amount', label: 'Amount', visible: true },
  { id: 'type', label: 'Type', visible: true },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


function flattenUnreconciledPayments(
  items: Record<string, unknown>[],
): Record<string, unknown>[] {
  return items.map((p) => ({
    id: p.id,
    paymentNo: p.paymentNo ?? '\u2014',
    date: p.date
      ? new Date(p.date as string).toLocaleDateString('en-IN')
      : '\u2014',
    description: p.description ?? '\u2014',
    amount: formatCurrency(p.amount as number | null),
    type: p.type ?? '\u2014',
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BankReconciliation() {
  const { data: bankData } = useBankList();
  const submitReconciliation = useSubmitReconciliation();

  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [statementBalance, setStatementBalance] = useState<number | null>(null);
  const [reconciliationDate, setReconciliationDate] = useState<string>('');

  const { data: reconData, isLoading: reconLoading } =
    useBankReconciliation(selectedBankId ?? '');

  // Build bank options
  const bankItems: Record<string, unknown>[] = useMemo(() => {
    const raw = bankData?.data;
    if (Array.isArray(raw)) return raw;
    const nested = raw as unknown as { data?: Record<string, unknown>[] };
    return nested?.data ?? [];
  }, [bankData]);

  const bankOptions = useMemo(
    () =>
      bankItems.map((b) => ({
        label: `${b.bankName} - ${b.accountNumber}`,
        value: String(b.id),
      })),
    [bankItems],
  );

  // Reconciliation response data
  const reconResponse = reconData?.data as Record<string, unknown> | undefined;
  const bankAccount = reconResponse?.bankAccount as
    | Record<string, unknown>
    | undefined;
  const bookBalance = reconResponse?.bookBalance as number | undefined;
  const unreconciledPayments = useMemo(() => {
    const raw = reconResponse?.unreconciledPayments;
    return Array.isArray(raw) ? raw : [];
  }, [reconResponse]);

  const flatPayments = useMemo(
    () => flattenUnreconciledPayments(unreconciledPayments),
    [unreconciledPayments],
  );

  const difference =
    statementBalance != null && bookBalance != null
      ? statementBalance - bookBalance
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId || statementBalance == null || !reconciliationDate)
      return;
    submitReconciliation.mutate({
      bankAccountId: selectedBankId,
      reconciliationDate,
      statementBalance,
    });
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Bank Selector */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="git-compare" size={20} />
            Bank Reconciliation
          </h3>
          <div className="max-w-md">
            <SelectInput
              label="Select Bank Account"
              leftIcon={<Icon name="building-2" size={16} />}
              options={bankOptions}
              value={selectedBankId}
              onChange={(v) => setSelectedBankId(v ? String(v) : null)}
            />
          </div>
        </div>
      </Card>

      {/* Reconciliation Content */}
      {selectedBankId && (
        <>
          {/* Bank Info Card */}
          {bankAccount && (
            <Card>
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">
                  Account Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Bank</span>
                    <p className="font-medium">
                      {(bankAccount.bankName as string) ?? '\u2014'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Account No</span>
                    <p className="font-medium">
                      {(bankAccount.accountNumber as string) ?? '\u2014'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">IFSC</span>
                    <p className="font-medium">
                      {(bankAccount.ifscCode as string) ?? '\u2014'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Book Balance</span>
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(bookBalance)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Unreconciled Payments Table */}
          <TableFull
            data={flatPayments as Record<string, any>[]}
            title="Unreconciled Payments"
            columns={UNRECONCILED_COLUMNS}
            tableKey="bank-reconciliation-payments"
            defaultViewMode="table"
            defaultDensity="compact"
          />

          {/* Reconciliation Form */}
          <Card>
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-500 mb-4">
                Submit Reconciliation
              </h4>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <DatePicker
                    label="Reconciliation Date"
                    value={reconciliationDate}
                    onChange={(v) => setReconciliationDate(v ?? '')}
                  />
                  <CurrencyInput
                    label="Statement Balance"
                    value={statementBalance}
                    onChange={(v: number | null) => setStatementBalance(v)}
                  />
                  <div>
                    <span className="text-sm text-gray-500">Difference</span>
                    <p
                      className={`text-lg font-bold ${
                        difference != null && difference !== 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {difference != null ? formatCurrency(difference) : '\u2014'}
                    </p>
                    {difference != null && difference === 0 && (
                      <Badge variant="success">Balanced</Badge>
                    )}
                    {difference != null && difference !== 0 && (
                      <Badge variant="warning">Mismatch</Badge>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={
                      submitReconciliation.isPending ||
                      statementBalance == null ||
                      !reconciliationDate
                    }
                  >
                    <Icon name="check-circle" size={16} />
                    {submitReconciliation.isPending
                      ? 'Submitting...'
                      : 'Submit Reconciliation'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
