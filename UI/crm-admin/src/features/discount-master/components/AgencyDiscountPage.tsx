'use client';

import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { TableFull, Badge } from '@/components/ui';
import { useSidePanelStore } from '@/stores/side-panel.store';
import { useAgencyDiscounts, useDeleteAgencyDiscount } from '../hooks/useDiscount';
import type { AgencyDiscount } from '../types/discount.types';
import { AgencyDiscountForm } from './AgencyDiscountForm';

const COLUMNS = [
  { id: 'agentName',       label: 'Agent / Party',  visible: true },
  { id: 'agentType',       label: 'Type',           visible: true },
  { id: 'discountPercent', label: 'Discount %',     visible: true },
  { id: 'applicableOn',    label: 'Applicable On',  visible: true },
  { id: 'validFrom',       label: 'Valid From',     visible: true },
  { id: 'validTo',         label: 'Valid To',       visible: true },
  { id: 'status',          label: 'Status',         visible: true },
];

const AGENT_TYPE_COLORS: Record<string, 'primary' | 'warning' | 'secondary'> = {
  AGENT: 'primary', DISTRIBUTOR: 'warning', DEALER: 'secondary',
};

export function AgencyDiscountPage() {
  const { data } = useAgencyDiscounts();
  const deleteMut = useDeleteAgencyDiscount();
  const { openPanel } = useSidePanelStore();

  const openForm = (discount?: AgencyDiscount) => {
    const panelId = discount ? `edit-agency-discount-${discount.id}` : 'create-agency-discount';
    openPanel({
      id: panelId,
      title: discount ? 'Edit Agency Discount' : 'New Agency Discount',
      content: <AgencyDiscountForm panelId={panelId} discount={discount} />,
      footerButtons: [
        {
          id: 'cancel',
          label: 'Cancel',
          showAs: 'text' as const,
          variant: 'secondary' as const,
          onClick: () => useSidePanelStore.getState().closePanel(panelId),
        },
        {
          id: 'submit',
          label: discount ? 'Update Discount' : 'Save Discount',
          icon: 'save',
          showAs: 'both' as const,
          variant: 'primary' as const,
          onClick: () => {
            document.getElementById(`agency-discount-form-${panelId}`)
              ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          },
        },
      ],
    });
  };

  const items: AgencyDiscount[] = useMemo(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const rows = useMemo(() => items.map((d) => ({
    id: d.id,
    _raw: d,
    agentName:       d.agentName,
    agentType:       <Badge variant={AGENT_TYPE_COLORS[d.agentType] ?? 'secondary'}>{d.agentType}</Badge>,
    discountPercent: <span style={{ fontWeight: 600, color: '#dc2626' }}>{d.discountPercent}%</span>,
    applicableOn:    d.applicableOn,
    validFrom:       d.validFrom ? new Date(d.validFrom).toLocaleDateString('en-IN') : '—',
    validTo:         d.validTo   ? new Date(d.validTo).toLocaleDateString('en-IN')   : '—',
    status:          <Badge variant={d.isActive ? 'success' : 'secondary'}>{d.isActive ? 'Active' : 'Inactive'}</Badge>,
  })), [items]);

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete discount for "${row.agentName}"?`)) return;
    try {
      await deleteMut.mutateAsync(row.id);
      toast.success('Discount deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <TableFull
      data={rows}
      title="Agency General Discount"
      tableKey="agency-discounts"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={(row: any) => openForm(row._raw)}
      onRowDelete={handleDelete}
      onCreate={() => openForm()}
    />
  );
}
