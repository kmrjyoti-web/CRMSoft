'use client';

import { useMemo, useState } from 'react';

import {
  TableFull,
  Card,
  Input,
  Button,
  Badge,
  Icon,
} from '@/components/ui';

import {
  useGSTList,
  useGenerateGSTR1,
  useGenerateGSTR3B,
} from '../hooks/useAccounts';

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const GST_RETURN_COLUMNS = [
  { id: 'returnType', label: 'Return Type', visible: true },
  { id: 'period', label: 'Period', visible: true },
  { id: 'financialYear', label: 'Financial Year', visible: true },
  { id: 'outputCGST', label: 'Output CGST', visible: true },
  { id: 'outputSGST', label: 'Output SGST', visible: true },
  { id: 'outputIGST', label: 'Output IGST', visible: true },
  { id: 'netTaxPayable', label: 'Net Tax Payable', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'filedAt', label: 'Filed At', visible: true },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return '\u2014';
  return `\u20B9${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function statusVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'FILED':
      return 'success';
    case 'GENERATED':
      return 'warning';
    case 'DRAFT':
      return 'default';
    case 'OVERDUE':
      return 'danger';
    default:
      return 'default';
  }
}

function flattenGSTReturns(
  items: Record<string, unknown>[],
): Record<string, unknown>[] {
  return items.map((r) => ({
    id: r.id,
    returnType: r.returnType ?? '\u2014',
    period: r.period ?? '\u2014',
    financialYear: r.financialYear ?? '\u2014',
    outputCGST: formatCurrency(r.outputCGST as number | null),
    outputSGST: formatCurrency(r.outputSGST as number | null),
    outputIGST: formatCurrency(r.outputIGST as number | null),
    netTaxPayable: formatCurrency(r.netTaxPayable as number | null),
    status: r.status ?? '\u2014',
    filedAt: r.filedAt
      ? new Date(r.filedAt as string).toLocaleDateString('en-IN')
      : '\u2014',
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GSTDashboard() {
  const [period, setPeriod] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<Record<
    string,
    unknown
  > | null>(null);

  const { data, isLoading } = useGSTList({ period });
  const generateGSTR1 = useGenerateGSTR1();
  const generateGSTR3B = useGenerateGSTR3B();

  const responseData = data?.data;
  const items: Record<string, unknown>[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as {
      data?: Record<string, unknown>[];
    };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenGSTReturns(items), [items]);

  const handleGenerateGSTR1 = () => {
    if (!period) return;
    generateGSTR1.mutate(period);
  };

  const handleGenerateGSTR3B = () => {
    if (!period) return;
    generateGSTR3B.mutate(period);
  };

  const handleRowClick = (row: Record<string, unknown>) => {
    setSelectedReturn(row);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Period Selector & Actions */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="receipt" size={20} />
            GST Returns Dashboard
          </h3>
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-56">
              <Input
                label="Period (Month-Year)"
                leftIcon={<Icon name="calendar" size={16} />}
                type="text"
                placeholder="YYYY-MM"
                value={period}
                onChange={(v: string) => setPeriod(v)}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleGenerateGSTR1}
              disabled={!period || generateGSTR1.isPending}
            >
              <Icon name="file-text" size={16} />
              {generateGSTR1.isPending ? 'Generating...' : 'Generate GSTR-1'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleGenerateGSTR3B}
              disabled={!period || generateGSTR3B.isPending}
            >
              <Icon name="file-spreadsheet" size={16} />
              {generateGSTR3B.isPending ? 'Generating...' : 'Generate GSTR-3B'}
            </Button>
          </div>
        </div>
      </Card>

      {/* GST Returns Table */}
      <TableFull
        data={tableData as Record<string, any>[]}
        title="GST Returns"
        columns={GST_RETURN_COLUMNS}
        tableKey="gst-returns"
        defaultViewMode="table"
        defaultDensity="compact"
        onRowEdit={handleRowClick}
      />

      {/* GST Return Detail Panel */}
      {selectedReturn && (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-500">
                Return Detail
              </h4>
              <Button
                variant="ghost"
                onClick={() => setSelectedReturn(null)}
              >
                <Icon name="x" size={16} />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Return Type</span>
                <p className="font-medium">
                  {(selectedReturn.returnType as string) ?? '\u2014'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Period</span>
                <p className="font-medium">
                  {(selectedReturn.period as string) ?? '\u2014'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Financial Year</span>
                <p className="font-medium">
                  {(selectedReturn.financialYear as string) ?? '\u2014'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Status</span>
                <p>
                  <Badge
                    variant={statusVariant(
                      (selectedReturn.status as string) ?? '',
                    )}
                  >
                    {(selectedReturn.status as string) ?? '\u2014'}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="text-gray-500">Output CGST</span>
                <p className="font-medium">
                  {(selectedReturn.outputCGST as string) ?? '\u2014'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Output SGST</span>
                <p className="font-medium">
                  {(selectedReturn.outputSGST as string) ?? '\u2014'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Output IGST</span>
                <p className="font-medium">
                  {(selectedReturn.outputIGST as string) ?? '\u2014'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Net Tax Payable</span>
                <p className="font-semibold text-blue-600">
                  {(selectedReturn.netTaxPayable as string) ?? '\u2014'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Filed At</span>
                <p className="font-medium">
                  {(selectedReturn.filedAt as string) ?? '\u2014'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
