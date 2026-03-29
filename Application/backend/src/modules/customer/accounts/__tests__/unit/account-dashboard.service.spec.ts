import { AccountDashboardService } from '../../services/account-dashboard.service';

function makeService(overrides: Record<string, any> = {}) {
  const prisma: any = {
    invoice: {
      findMany: jest.fn().mockResolvedValue(
        overrides.invoices ?? [
          { balanceAmount: 5000, totalAmount: 10000, invoiceDate: new Date() },
          { balanceAmount: 3000, totalAmount: 8000, invoiceDate: new Date() },
        ],
      ),
    },
    purchaseInvoice: {
      findMany: jest.fn().mockResolvedValue(
        overrides.purchaseInvoices ?? [
          { balanceAmount: 2000, grandTotal: 4000, invoiceDate: new Date() },
        ],
      ),
    },
    ledgerMaster: {
      findFirst: jest.fn().mockResolvedValue(
        overrides.cashLedger !== undefined ? overrides.cashLedger : { currentBalance: 1000 },
      ),
    },
    bankAccount: {
      findMany: jest.fn().mockResolvedValue(
        overrides.bankAccounts ?? [{ currentBalance: 5000 }, { currentBalance: 3000 }],
      ),
    },
    gSTReturn: {
      findFirst: jest.fn().mockResolvedValue(
        overrides.gstReturn !== undefined ? overrides.gstReturn : { netTaxPayable: 1500 },
      ),
    },
    paymentRecord: {
      findMany: jest.fn().mockResolvedValue(overrides.recentPayments ?? []),
      count: jest.fn().mockResolvedValue(overrides.pendingApprovals ?? 2),
    },
  };
  prisma.working = prisma;
  return { service: new AccountDashboardService(prisma), prisma };
}

describe('AccountDashboardService', () => {
  it('should return correct totalReceivable', async () => {
    const { service } = makeService();
    const result = await service.getDashboard('tenant-1');
    expect(result.totalReceivable).toBe(8000); // 5000 + 3000
  });

  it('should return correct totalPayable', async () => {
    const { service } = makeService();
    const result = await service.getDashboard('tenant-1');
    expect(result.totalPayable).toBe(2000);
  });

  it('should return correct cashAndBank total', async () => {
    const { service } = makeService();
    const result = await service.getDashboard('tenant-1');
    // cash: 1000, bank: 5000+3000=8000 → total: 9000
    expect(result.cashAndBank).toBe(9000);
    expect(result.cashBalance).toBe(1000);
    expect(result.bankBalance).toBe(8000);
  });

  it('should return gstDue from latest GSTR-3B', async () => {
    const { service } = makeService();
    const result = await service.getDashboard('tenant-1');
    expect(result.gstDue).toBe(1500);
  });

  it('should return 0 gstDue when no pending GST return', async () => {
    const { service } = makeService({ gstReturn: null });
    const result = await service.getDashboard('tenant-1');
    expect(result.gstDue).toBe(0);
  });

  it('should return pendingApprovals count', async () => {
    const { service } = makeService({ pendingApprovals: 3 });
    const result = await service.getDashboard('tenant-1');
    expect(result.pendingApprovals).toBe(3);
  });

  it('should return monthlyData with 6 months', async () => {
    const { service } = makeService();
    const result = await service.getDashboard('tenant-1');
    expect(result.monthlyData).toHaveLength(6);
    expect(result.monthlyData[0]).toHaveProperty('month');
    expect(result.monthlyData[0]).toHaveProperty('revenue');
    expect(result.monthlyData[0]).toHaveProperty('expenses');
  });

  it('should return 0 cash when no cash ledger found', async () => {
    const { service } = makeService({ cashLedger: null });
    const result = await service.getDashboard('tenant-1');
    expect(result.cashBalance).toBe(0);
  });

  it('should include receivableCount and payableCount', async () => {
    const { service } = makeService();
    const result = await service.getDashboard('tenant-1');
    expect(result.receivableCount).toBe(2);
    expect(result.payableCount).toBe(1);
  });

  it('should query receivables with correct statuses', async () => {
    const { service, prisma } = makeService();
    await service.getDashboard('tenant-1');
    const invoiceCall = prisma.invoice.findMany.mock.calls.find(
      (call: any[]) => call[0]?.where?.status?.in,
    );
    expect(invoiceCall[0].where.status.in).toContain('SENT');
    expect(invoiceCall[0].where.status.in).toContain('OVERDUE');
  });
});
