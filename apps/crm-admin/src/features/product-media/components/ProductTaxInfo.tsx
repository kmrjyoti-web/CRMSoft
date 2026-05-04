'use client';

import { Icon, Card, Badge } from '@/components/ui';

// ── Props ─────────────────────────────────────────────────────────────

interface ProductTaxInfoProps {
  hsnCode?: string;
  gstRate?: number;
  cessRate?: number;
  taxInclusive?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────

export function ProductTaxInfo({ hsnCode, gstRate, cessRate, taxInclusive }: ProductTaxInfoProps) {
  const halfRate = gstRate != null ? gstRate / 2 : 0;
  const cgst = halfRate;
  const sgst = halfRate;
  const igst = gstRate ?? 0;

  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="file-text" size={16} />
          Tax Information
        </h3>
        <Badge variant={taxInclusive ? 'success' : 'warning'}>
          {taxInclusive ? 'Tax Inclusive' : 'Tax Exclusive'}
        </Badge>
      </div>

      {/* HSN/SAC Code */}
      <div style={{ marginBottom: 16, padding: '12px 14px', backgroundColor: '#f9fafb', borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 4 }}>HSN/SAC Code</div>
        <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace' }}>
          {hsnCode || '--'}
        </div>
      </div>

      {/* GST Rate */}
      <div style={{ marginBottom: 16, padding: '12px 14px', backgroundColor: '#f0fdf4', borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 4 }}>GST Rate</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>
          {gstRate != null ? `${gstRate}%` : '--'}
        </div>
      </div>

      {/* GST Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            padding: '12px 10px',
            backgroundColor: '#eff6ff',
            borderRadius: 6,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>CGST</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#2563eb' }}>
            {gstRate != null ? `${cgst}%` : '--'}
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>Central GST</div>
        </div>

        <div
          style={{
            padding: '12px 10px',
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>SGST</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#16a34a' }}>
            {gstRate != null ? `${sgst}%` : '--'}
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>State GST</div>
        </div>

        <div
          style={{
            padding: '12px 10px',
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>IGST</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#d97706' }}>
            {gstRate != null ? `${igst}%` : '--'}
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>Integrated GST</div>
        </div>
      </div>

      {/* Cess */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: cessRate && cessRate > 0 ? '#fef2f2' : '#f9fafb',
          borderRadius: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 4 }}>Cess Rate</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {cessRate != null && cessRate > 0 ? `${cessRate}%` : 'N/A'}
            </div>
          </div>
          {cessRate != null && cessRate > 0 && (
            <Badge variant="danger">Cess Applicable</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
