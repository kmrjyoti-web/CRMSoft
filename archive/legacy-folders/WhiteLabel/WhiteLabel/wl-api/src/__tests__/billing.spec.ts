import { BillingService } from '../modules/billing/billing.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Simple Decimal-like helper so Prisma numeric mocks work correctly
class Decimal {
  constructor(public val: number) {}
  toNumber() { return this.val; }
  toString() { return String(this.val); }
  valueOf() { return this.val; }
}

const mockPrisma = {
  whiteLabelPartner: {
    findUnique: jest.fn(),
  },
  partnerServicePricing: {
    findUnique: jest.fn(),
  },
  partnerCustomerPricing: {
    findUnique: jest.fn(),
  },
  servicePricingTier: {
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  partnerUsageLog: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  partnerInvoice: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
  },
};

const mockAudit = { log: jest.fn() };

const makeService = () => new BillingService(mockPrisma as any, mockAudit as any);

describe('BillingService', () => {
  afterEach(() => jest.clearAllMocks());

  it('recordUsage() creates a new usage log entry when no existing record for that period', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: 'p1', partnerCode: 'acme' });
    mockPrisma.partnerServicePricing.findUnique.mockResolvedValue({
      pricePerUnit: new Decimal(12),
    });
    mockPrisma.partnerCustomerPricing.findUnique.mockResolvedValue({
      customerPricePerUnit: new Decimal(20),
    });
    mockPrisma.servicePricingTier.findUnique.mockResolvedValue({
      serviceCode: 'AI_TOKENS',
      baseCostPerUnit: new Decimal(10),
    });
    // No existing record → create path
    mockPrisma.partnerUsageLog.findUnique.mockResolvedValue(null);
    const usageLog = {
      id: 'ul1',
      partnerId: 'p1',
      serviceCode: 'AI_TOKENS',
      totalUnitsConsumed: 100,
      totalCostToYou: 1000,
      totalChargedToPartner: 1200,
      totalChargedToCustomers: 2000,
      yourProfit: 200,
      partnerProfit: 800,
    };
    mockPrisma.partnerUsageLog.create.mockResolvedValue(usageLog);

    const svc = makeService();
    const result = await svc.recordUsage({ partnerId: 'p1', serviceCode: 'AI_TOKENS', units: 100 });

    expect(result.totalUnitsConsumed).toBe(100);
    expect(mockPrisma.partnerUsageLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ partnerId: 'p1', serviceCode: 'AI_TOKENS' }),
      }),
    );
  });

  it('generateInvoice() creates invoice with 18% GST calculated on subtotal', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: 'p1', partnerCode: 'acme' });
    mockPrisma.partnerInvoice.findFirst.mockResolvedValue(null); // no existing invoice
    // getUsageSummary path
    const usageLogs = [
      {
        serviceCode: 'AI_TOKENS',
        totalUnitsConsumed: new Decimal(100),
        totalChargedToPartner: new Decimal(1000),
        totalCostToYou: new Decimal(800),
        totalChargedToCustomers: new Decimal(1500),
        yourProfit: new Decimal(200),
        partnerProfit: new Decimal(500),
        partner: { companyName: 'Acme Corp' },
      },
    ];
    mockPrisma.partnerUsageLog.findMany.mockResolvedValue(usageLogs);
    // Invoice number counter
    mockPrisma.partnerInvoice.count.mockResolvedValue(0);

    const year = new Date().getFullYear();
    const createdInvoice = {
      id: 'inv1',
      partnerId: 'p1',
      period: '2026-03',
      invoiceNumber: `WL-INV-${year}-0001`,
      subtotal: 1000,
      gstAmount: 180,
      totalAmount: 1180,
      status: 'DRAFT',
    };
    mockPrisma.partnerInvoice.create.mockResolvedValue(createdInvoice);

    const svc = makeService();
    const result = await svc.generateInvoice('p1', '2026-03');

    expect(result.status).toBe('DRAFT');
    expect(result.subtotal).toBe(1000);
    expect(result.gstAmount).toBe(180);
    expect(result.totalAmount).toBe(1180);
    expect(mockPrisma.partnerInvoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          partnerId: 'p1',
          period: '2026-03',
          gstAmount: 180,       // 18% of 1000
          totalAmount: 1180,    // 1000 + 180
          status: 'DRAFT',
        }),
      }),
    );
  });

  it('generateInvoice() computes ₹180 GST and ₹1180 total for 100 units at ₹10 base (1000 subtotal)', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: 'p1', partnerCode: 'acme' });
    mockPrisma.partnerInvoice.findFirst.mockResolvedValue(null);

    const usageLogs = [
      {
        serviceCode: 'SMS',
        totalUnitsConsumed: new Decimal(100),
        totalChargedToPartner: new Decimal(1000),  // 100 units * ₹10
        totalCostToYou: new Decimal(800),
        totalChargedToCustomers: new Decimal(1500),
        yourProfit: new Decimal(200),
        partnerProfit: new Decimal(500),
        partner: { companyName: 'Acme Corp' },
      },
    ];
    mockPrisma.partnerUsageLog.findMany.mockResolvedValue(usageLogs);
    mockPrisma.partnerInvoice.count.mockResolvedValue(2);

    // Capture what was passed to partnerInvoice.create
    mockPrisma.partnerInvoice.create.mockImplementation(async ({ data }: { data: any }) => ({
      id: 'inv2',
      ...data,
    }));

    const svc = makeService();
    const result = await svc.generateInvoice('p1', '2026-03');

    // subtotal = totalChargedToPartner = 1000
    // gstAmount = 1000 * 0.18 = 180
    // totalAmount = 1000 + 180 = 1180
    expect(result.subtotal).toBe(1000);
    expect(result.gstAmount).toBe(180);
    expect(result.totalAmount).toBe(1180);
  });

  it('sendInvoice() updates status to SENT; throws BadRequestException if invoice is already PAID', async () => {
    // Already PAID — should throw
    mockPrisma.partnerInvoice.findUnique.mockResolvedValueOnce({ id: 'inv1', status: 'PAID' });
    const svc = makeService();
    await expect(svc.sendInvoice('inv1')).rejects.toThrow(BadRequestException);

    // DRAFT → SENT success path
    jest.clearAllMocks();
    mockPrisma.partnerInvoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'DRAFT' });
    const sentInvoice = { id: 'inv1', status: 'SENT' };
    mockPrisma.partnerInvoice.update.mockResolvedValue(sentInvoice);

    const result = await svc.sendInvoice('inv1');
    expect(result.status).toBe('SENT');
    expect(mockPrisma.partnerInvoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'inv1' },
        data: expect.objectContaining({ status: 'SENT' }),
      }),
    );
  });

  it('markPaid() updates invoice status to PAID and records transactionRef', async () => {
    mockPrisma.partnerInvoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'SENT' });
    const paid = { id: 'inv1', status: 'PAID', razorpayPaymentId: 'pay_abc123', paidAt: new Date() };
    mockPrisma.partnerInvoice.update.mockResolvedValue(paid);

    const svc = makeService();
    const result = await svc.markPaid('inv1', 'pay_abc123');

    expect(result.status).toBe('PAID');
    expect(result.razorpayPaymentId).toBe('pay_abc123');
    expect(result.paidAt).toBeDefined();
    expect(mockPrisma.partnerInvoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PAID', razorpayPaymentId: 'pay_abc123' }),
      }),
    );
  });

  it('getUsageSummary() returns aggregated usage with per-service breakdown and totals', async () => {
    const usageLogs = [
      {
        serviceCode: 'AI_TOKENS',
        totalUnitsConsumed: new Decimal(500),
        totalCostToYou: new Decimal(4000),
        totalChargedToPartner: new Decimal(6000),
        totalChargedToCustomers: new Decimal(10000),
        yourProfit: new Decimal(2000),
        partnerProfit: new Decimal(4000),
        partner: { companyName: 'Acme Corp' },
      },
      {
        serviceCode: 'SMS',
        totalUnitsConsumed: new Decimal(200),
        totalCostToYou: new Decimal(400),
        totalChargedToPartner: new Decimal(600),
        totalChargedToCustomers: new Decimal(1000),
        yourProfit: new Decimal(200),
        partnerProfit: new Decimal(400),
        partner: { companyName: 'Acme Corp' },
      },
    ];
    mockPrisma.partnerUsageLog.findMany.mockResolvedValue(usageLogs);

    const svc = makeService();
    const result = await svc.getUsageSummary('p1', '2026-03');

    expect(result.partnerId).toBe('p1');
    expect(result.period).toBe('2026-03');
    expect(result.services).toHaveLength(2);
    // Totals: totalChargedToPartner = 6000 + 600 = 6600
    expect(result.totals.totalChargedToPartner).toBe(6600);
    expect(result.totals.yourProfit).toBe(2200);
    expect(result.totals.partnerProfit).toBe(4400);
    expect(mockPrisma.partnerUsageLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { partnerId: 'p1', period: '2026-03' } }),
    );
  });
});
