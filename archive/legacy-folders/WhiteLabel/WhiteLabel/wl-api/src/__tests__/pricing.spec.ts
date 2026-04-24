import { PricingService } from '../modules/pricing/pricing.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Simple Decimal-like helper for test mocks
class Decimal {
  constructor(public val: number) {}
  toNumber() { return this.val; }
  toString() { return String(this.val); }
}

const mockPrisma = {
  servicePricingTier: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  partnerServicePricing: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  partnerCustomerPricing: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
};

const makeService = () => new PricingService(mockPrisma as any);

describe('PricingService', () => {
  afterEach(() => jest.clearAllMocks());

  it('create service tier saves base cost', async () => {
    const tier = { serviceCode: 'TEST_SVC', serviceName: 'Test Service', baseCostPerUnit: new Decimal(5) };
    mockPrisma.servicePricingTier.create.mockResolvedValue(tier);
    const svc = makeService();
    const result = await svc.createService({ serviceCode: 'TEST_SVC', serviceName: 'Test Service', baseCostPerUnit: 5 });
    expect(result.serviceCode).toBe('TEST_SVC');
  });

  it('set partner pricing validates >= base cost', async () => {
    mockPrisma.servicePricingTier.findUnique.mockResolvedValue({ serviceCode: 'AI_TOKENS', baseCostPerUnit: new Decimal(10) });
    const svc = makeService();
    await expect(svc.setPartnerPricing({ partnerId: 'p1', serviceCode: 'AI_TOKENS', pricePerUnit: 5 }))
      .rejects.toThrow(BadRequestException);
  });

  it('set partner pricing succeeds when >= base cost', async () => {
    mockPrisma.servicePricingTier.findUnique.mockResolvedValue({ serviceCode: 'AI_TOKENS', baseCostPerUnit: new Decimal(10) });
    mockPrisma.partnerServicePricing.upsert.mockResolvedValue({ partnerId: 'p1', serviceCode: 'AI_TOKENS', pricePerUnit: new Decimal(12) });
    const svc = makeService();
    const result = await svc.setPartnerPricing({ partnerId: 'p1', serviceCode: 'AI_TOKENS', pricePerUnit: 12 });
    expect(result.pricePerUnit).toBeDefined();
  });

  it('set customer pricing validates >= partner minimum', async () => {
    mockPrisma.partnerServicePricing.findUnique.mockResolvedValue({ customerMinPrice: new Decimal(15) });
    const svc = makeService();
    await expect(svc.setCustomerPricing({ partnerId: 'p1', serviceCode: 'AI_TOKENS', customerPricePerUnit: 10 }))
      .rejects.toThrow(BadRequestException);
  });

  it('get pricing chain returns all 3 tiers with margins', async () => {
    mockPrisma.servicePricingTier.findUnique.mockResolvedValue({ serviceCode: 'AI_TOKENS', baseCostPerUnit: new Decimal(10) });
    mockPrisma.partnerServicePricing.findUnique.mockResolvedValue({ pricePerUnit: new Decimal(12), customerMinPrice: new Decimal(14) });
    mockPrisma.partnerCustomerPricing.findUnique.mockResolvedValue({ customerPricePerUnit: new Decimal(20) });
    const svc = makeService();
    const result = await svc.getPricingChain('p1', 'AI_TOKENS');
    expect(result.service).toBeDefined();
    expect(result.partnerPricing).toBeDefined();
    expect(result.customerPricing).toBeDefined();
    expect(result.margins.yourMarginPerUnit).toBe(2);
    expect(result.margins.partnerMarginPerUnit).toBe(8);
  });

  it('get pricing chain throws 404 for unknown service', async () => {
    mockPrisma.servicePricingTier.findUnique.mockResolvedValue(null);
    mockPrisma.partnerServicePricing.findUnique.mockResolvedValue(null);
    mockPrisma.partnerCustomerPricing.findUnique.mockResolvedValue(null);
    const svc = makeService();
    await expect(svc.getPricingChain('p1', 'UNKNOWN')).rejects.toThrow(NotFoundException);
  });
});
