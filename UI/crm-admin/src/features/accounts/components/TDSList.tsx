'use client';

import { useMemo, useState } from 'react';
import {
  TableFull,
  Badge,
  Icon,
  Input,
  DatePicker,
  Button,
  Modal,
} from '@/components/ui';
import type { TableFilterConfig } from '@/components/ui';
import { useTDSList, useTDSSummary, useDepositTDS } from '../hooks/useAccounts';

// ── Columns ───────────────────────────────────────────────────────────

const TDS_COLUMNS = [
  { id: 'section',       label: 'Section',        visible: true },
  { id: 'sectionName',   label: 'Section Name',   visible: true },
  { id: 'deducteeName',  label: 'Deductee Name',  visible: true },
  { id: 'deducteePAN',   label: 'PAN',            visible: true },
  { id: 'grossAmount',   label: 'Gross Amount',   visible: true },
  { id: 'tdsRate',       label: 'TDS Rate %',     visible: true },
  { id: 'tdsAmount',     label: 'TDS Amount',     visible: true },
  { id: 'netAmount',     label: 'Net Amount',     visible: true },
  { id: 'deductionDate', label: 'Deduction Date', visible: true },
  { id: 'depositDate',   label: 'Deposit Date',   visible: true },
  { id: 'status',        label: 'Status',         visible: true },
];

// ── Filter config (left panel) ────────────────────────────────────────

const FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: 'Section',
      defaultOpen: true,
      filters: [
        {
          columnId: 'section',
          label: 'TDS Section',
          filterType: 'master',
          queryParam: 'section',
          options: [
            { value: '194C', label: '194C – Contractors' },
            { value: '194J', label: '194J – Professional/Technical' },
            { value: '194H', label: '194H – Commission/Brokerage' },
            { value: '194I', label: '194I – Rent' },
            { value: '194A', label: '194A – Interest (Non-Bank)' },
          ],
        },
      ],
    },
    {
      title: 'Quarter',
      defaultOpen: true,
      filters: [
        {
          columnId: 'quarter',
          label: 'Quarter',
          filterType: 'master',
          queryParam: 'quarter',
          options: [
            { value: 'Q1', label: 'Q1 (Apr–Jun)' },
            { value: 'Q2', label: 'Q2 (Jul–Sep)' },
            { value: 'Q3', label: 'Q3 (Oct–Dec)' },
            { value: 'Q4', label: 'Q4 (Jan–Mar)' },
          ],
        },
      ],
    },
    {
      title: 'Status',
      defaultOpen: true,
      filters: [
        {
          columnId: 'status',
          label: 'Status',
          filterType: 'master',
          queryParam: 'status',
          options: [
            { value: 'DEDUCTED',     label: 'Deducted' },
            { value: 'DEPOSITED',    label: 'Deposited' },
            { value: 'RETURN_FILED', label: 'Return Filed' },
          ],
        },
      ],
    },
    {
      title: 'Date',
      defaultOpen: false,
      filters: [
        { columnId: 'deductionDate', label: 'Deduction Date', filterType: 'date', queryParam: 'deductionDate' },
        { columnId: 'depositDate',   label: 'Deposit Date',   filterType: 'date', queryParam: 'depositDate' },
      ],
    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────

function fmt(n: number | string | null | undefined): string {
  if (n == null) return '—';
  return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function statusVariant(s: string): 'success' | 'warning' | 'primary' | 'secondary' {
  return s === 'DEPOSITED' ? 'success' : s === 'DEDUCTED' ? 'warning' : s === 'RETURN_FILED' ? 'primary' : 'secondary';
}

function flattenTDS(items: any[]): Record<string, any>[] {
  return items.map((r) => ({
    id:            r.id,
    _raw:          r,
    section:       r.section ?? '—',
    sectionName:   r.sectionName ?? '—',
    deducteeName:  r.deducteeName ?? '—',
    deducteePAN:   r.deducteePAN ?? '—',
    grossAmount:   fmt(r.grossAmount),
    tdsRate:       r.tdsRate != null ? `${r.tdsRate}%` : '—',
    tdsAmount:     fmt(r.tdsAmount),
    netAmount:     fmt(r.netAmount),
    deductionDate: r.deductionDate ? new Date(r.deductionDate).toLocaleDateString('en-IN') : '—',
    depositDate:   r.depositDate   ? new Date(r.depositDate).toLocaleDateString('en-IN')   : '—',
    status:        <Badge variant={statusVariant(r.status ?? '')}>{r.status ?? '—'}</Badge>,
  }));
}

// ── KPI chip (for header) ─────────────────────────────────────────────

function KpiChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '4px 14px', borderRadius: 8,
      background: '#f8fafc', border: '1px solid #e5e7eb', minWidth: 100,
    }}>
      <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────

export function TDSList() {
  const [filterParams, setFilterParams] = useState<Record<string, string>>({});
  const [financialYear, setFinancialYear] = useState('');

  // Deposit modal state
  const [selectedTDS, setSelectedTDS] = useState<any | null>(null);
  const [depositDate,  setDepositDate]  = useState('');
  const [challanNumber, setChallanNumber] = useState('');

  const { data }        = useTDSList({ ...filterParams, ...(financialYear && { financialYear }) } as any);
  const { data: sumData } = useTDSSummary(financialYear || undefined);
  const depositMut      = useDepositTDS();

  const items: any[] = useMemo(() => {
    const r = (data as any)?.data ?? data ?? [];
    return Array.isArray(r) ? r : (r as any)?.data ?? [];
  }, [data]);

  const tableData = useMemo(() => flattenTDS(items), [items]);

  const summary = ((sumData as any)?.data ?? {}) as Record<string, any>;
  const totalDeducted  = summary.totalDeducted  as number | undefined;
  const totalDeposited = summary.totalDeposited as number | undefined;
  const totalPending   = summary.totalPending   as number | undefined;

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTDS?.id || !depositDate || !challanNumber) return;
    depositMut.mutate(
      { id: String(selectedTDS.id), depositDate, challanNumber },
      { onSuccess: () => setSelectedTDS(null) },
    );
  };

  // ── Header actions: KPI chips + FY input ──
  const headerActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <KpiChip label="Total Deducted"  value={fmt(totalDeducted)}  color="#2563eb" />
      <KpiChip label="Total Deposited" value={fmt(totalDeposited)} color="#16a34a" />
      <KpiChip label="Pending Deposit" value={fmt(totalPending)}   color="#d97706" />
      {/* Financial year inline input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 8,
        background: '#f8fafc', border: '1px solid #e5e7eb',
      }}>
        <Icon name="calendar" size={13} />
        <input
          type="text"
          value={financialYear}
          onChange={(e) => setFinancialYear(e.target.value)}
          placeholder="FY e.g. 2025-26"
          style={{
            width: 110, fontSize: 12, border: 'none', outline: 'none',
            background: 'transparent', color: '#374151',
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      <TableFull
        data={tableData as Record<string, any>[]}
        title="TDS Records"
        columns={TDS_COLUMNS}
        tableKey="tds-records"
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={FILTER_CONFIG}
        onFilterChange={(p) => setFilterParams(p)}
        headerActions={headerActions}
        onRowEdit={(row: any) => {
          setSelectedTDS(row._raw ?? row);
          setDepositDate('');
          setChallanNumber('');
        }}
      />

      {/* Deposit Modal */}
      {selectedTDS && (
        <Modal
          open={!!selectedTDS}
          onClose={() => setSelectedTDS(null)}
          title="Record TDS Deposit"
        >
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <span className="text-gray-500">Deductee</span>
                <p className="font-medium">{selectedTDS.deducteeName ?? '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Section</span>
                <p className="font-medium">{selectedTDS.section ?? '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">TDS Amount</span>
                <p className="font-semibold text-blue-600">{fmt(selectedTDS.tdsAmount)}</p>
              </div>
              <div>
                <span className="text-gray-500">Status</span>
                <Badge variant={statusVariant(selectedTDS.status ?? '')}>{selectedTDS.status ?? '—'}</Badge>
              </div>
            </div>
            <form onSubmit={handleDeposit}>
              <div className="grid grid-cols-1 gap-4">
                <DatePicker
                  label="Deposit Date"
                  value={depositDate}
                  onChange={(v) => setDepositDate(v ?? '')}
                />
                <Input
                  label="Challan Number"
                  leftIcon={<Icon name="hash" size={16} />}
                  value={challanNumber}
                  onChange={(v: string) => setChallanNumber(v)}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={() => setSelectedTDS(null)}>Cancel</Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={depositMut.isPending || !depositDate || !challanNumber}
                >
                  <Icon name="check" size={16} />
                  {depositMut.isPending ? 'Recording…' : 'Record Deposit'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}
