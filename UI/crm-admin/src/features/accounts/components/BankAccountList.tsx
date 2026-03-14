'use client';

import { useMemo, useState } from 'react';

import {
  TableFull,
  Card,
  Input,
  SelectInput,
  Button,
  Badge,
  Icon,
  CurrencyInput,
  CheckboxInput,
} from '@/components/ui';

import { useBankList, useCreateBank } from '../hooks/useAccounts';

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const BANK_COLUMNS = [
  { id: 'bankName', label: 'Bank Name', visible: true },
  { id: 'accountNumber', label: 'Account Number', visible: true },
  { id: 'accountType', label: 'Account Type', visible: true },
  { id: 'ifscCode', label: 'IFSC Code', visible: true },
  { id: 'branchName', label: 'Branch Name', visible: true },
  { id: 'currentBalance', label: 'Current Balance', visible: true },
  { id: 'isDefault', label: 'Default', visible: true },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return '\u2014';
  return `\u20B9${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function flattenBankAccounts(
  items: Record<string, unknown>[],
): Record<string, unknown>[] {
  return items.map((bank) => ({
    id: bank.id,
    bankName: bank.bankName ?? '\u2014',
    accountNumber: bank.accountNumber ?? '\u2014',
    accountType: bank.accountType ?? '\u2014',
    ifscCode: bank.ifscCode ?? '\u2014',
    branchName: bank.branchName ?? '\u2014',
    currentBalance: formatCurrency(bank.currentBalance as number | null),
    isDefault: bank.isDefault ? 'Yes' : 'No',
  }));
}

// ---------------------------------------------------------------------------
// Inline Create Form
// ---------------------------------------------------------------------------

const ACCOUNT_TYPE_OPTIONS = [
  { label: 'Savings', value: 'SAVINGS' },
  { label: 'Current', value: 'CURRENT' },
  { label: 'Overdraft (OD)', value: 'OD' },
];

const INITIAL_FORM = {
  bankName: '',
  accountNumber: '',
  accountType: 'SAVINGS',
  ifscCode: '',
  branchName: '',
  openingBalance: null as number | null,
  isDefault: false,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BankAccountList() {
  const { data, isLoading } = useBankList();
  const createBank = useCreateBank();

  const [form, setForm] = useState(INITIAL_FORM);

  const responseData = data?.data;
  const items: Record<string, unknown>[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: Record<string, unknown>[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenBankAccounts(items), [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bankName || !form.accountNumber) return;
    createBank.mutate({ ...form, openingBalance: form.openingBalance ?? undefined }, {
      onSuccess: () => setForm(INITIAL_FORM),
    });
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Bank Accounts"
        columns={BANK_COLUMNS}
        tableKey="bank-accounts"
        defaultViewMode="table"
        defaultDensity="compact"
      />

      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="plus-circle" size={20} />
            Add New Bank Account
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Bank Name"
                leftIcon={<Icon name="building-2" size={16} />}
                value={form.bankName}
                onChange={(v: string) => setForm((s) => ({ ...s, bankName: v }))}
              />
              <Input
                label="Account Number"
                leftIcon={<Icon name="hash" size={16} />}
                value={form.accountNumber}
                onChange={(v: string) =>
                  setForm((s) => ({ ...s, accountNumber: v }))
                }
              />
              <SelectInput
                label="Account Type"
                leftIcon={<Icon name="wallet" size={16} />}
                options={ACCOUNT_TYPE_OPTIONS}
                value={form.accountType}
                onChange={(v) =>
                  setForm((s) => ({
                    ...s,
                    accountType: String(v ?? 'SAVINGS'),
                  }))
                }
              />
              <Input
                label="IFSC Code"
                leftIcon={<Icon name="landmark" size={16} />}
                value={form.ifscCode}
                onChange={(v: string) => setForm((s) => ({ ...s, ifscCode: v }))}
              />
              <Input
                label="Branch Name"
                leftIcon={<Icon name="map-pin" size={16} />}
                value={form.branchName}
                onChange={(v: string) =>
                  setForm((s) => ({ ...s, branchName: v }))
                }
              />
              <CurrencyInput
                label="Opening Balance"
                value={form.openingBalance}
                onChange={(v: number | null) =>
                  setForm((s) => ({ ...s, openingBalance: v }))
                }
              />
            </div>

            <div className="flex items-center gap-4 mt-4">
              <CheckboxInput
                label="Set as Default Account"
                checked={form.isDefault}
                onChange={(checked: boolean) =>
                  setForm((s) => ({ ...s, isDefault: checked }))
                }
              />
              <Button
                type="submit"
                variant="primary"
                disabled={
                  createBank.isPending || !form.bankName || !form.accountNumber
                }
              >
                <Icon name="plus" size={16} />
                {createBank.isPending ? 'Adding...' : 'Add Bank Account'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
