import { QuotationAnalyticsService } from '../../services/quotation-analytics.service';

describe('QuotationAnalyticsService', () => {
  let service: QuotationAnalyticsService;
  let prisma: any;

  const mockQuotations = [
    { id: 'q-1', status: 'ACCEPTED', totalAmount: 50000, createdAt: new Date('2026-01-15'), acceptedAt: new Date('2026-01-25'), discountValue: 10, lead: { organization: { industry: 'Healthcare' } }, lineItems: [{ productId: 'p-1', productName: 'CRM', productCode: 'PRD-001', quantity: 1, lineTotal: 50000, discountAmount: 0 }] },
    { id: 'q-2', status: 'REJECTED', totalAmount: 80000, createdAt: new Date('2026-01-10'), acceptedAt: null, rejectedReason: 'Too expensive', lead: { organization: { industry: 'Healthcare' } }, lineItems: [{ productId: 'p-1', productName: 'CRM', productCode: 'PRD-001', quantity: 2, lineTotal: 80000, discountAmount: 0 }] },
    { id: 'q-3', status: 'ACCEPTED', totalAmount: 30000, createdAt: new Date('2026-02-01'), acceptedAt: new Date('2026-02-10'), discountValue: 5, lead: { organization: { industry: 'Education' } }, lineItems: [{ productId: 'p-2', productName: 'Support', productCode: 'PRD-002', quantity: 1, lineTotal: 30000, discountAmount: 0 }] },
    { id: 'q-4', status: 'SENT', totalAmount: 25000, createdAt: new Date('2026-02-15'), acceptedAt: null, lead: { organization: null }, lineItems: [] },
  ];

  beforeEach(() => {
    prisma = {
      quotation: {
        findMany: jest.fn().mockResolvedValue(mockQuotations),
      },
    };
(prisma as any).working = prisma;
    service = new QuotationAnalyticsService(prisma);
  });

  it('should calculate conversion rate correctly', async () => {
    const result = await service.getOverview({});
    // 2 accepted, 1 rejected => 2/(2+1) = 66.7%
    expect(result.conversionRate).toBe(66.7);
    expect(result.totalQuotations).toBe(4);
  });

  it('should group industry analysis by organization industry', async () => {
    const result = await service.getIndustryAnalysis({});
    const healthcare = result.find((r: any) => r.industry === 'Healthcare');
    expect(healthcare).toBeDefined();
    expect(healthcare!.totalQuotations).toBe(2);
    expect(healthcare!.accepted).toBe(1);
    expect(healthcare!.rejected).toBe(1);
    expect(healthcare!.conversionRate).toBe(50);
  });

  it('should count product appearances across accepted quotations', async () => {
    const result = await service.getProductAnalysis({});
    const crm = result.find((r: any) => r.productName === 'CRM');
    expect(crm).toBeDefined();
    expect(crm!.timesQuoted).toBe(2); // q-1 and q-2
    expect(crm!.totalRevenue).toBe(50000); // only from accepted q-1
  });

  it('should return best quotations by value', async () => {
    prisma.quotation.findMany.mockResolvedValue([
      { id: 'q-1', totalAmount: 50000, lineItems: [], lead: { organization: {} }, createdByUser: {} },
    ]);
    const result = await service.getBestQuotations({ limit: 5 });
    expect(result).toHaveLength(1);
  });

  it('should build overview with month-over-month trend', async () => {
    const result = await service.getOverview({});
    expect(result.thisMonth).toBeDefined();
    expect(result.lastMonth).toBeDefined();
    expect(result.trend).toBeDefined();
  });

  it('should handle empty data gracefully', async () => {
    prisma.quotation.findMany.mockResolvedValue([]);
    const result = await service.getOverview({});
    expect(result.totalQuotations).toBe(0);
    expect(result.conversionRate).toBe(0);
  });
});
