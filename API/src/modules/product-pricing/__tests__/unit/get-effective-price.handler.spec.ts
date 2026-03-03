import { NotFoundException } from '@nestjs/common';
import { GetEffectivePriceHandler } from '../../application/queries/get-effective-price/get-effective-price.handler';
import { GetEffectivePriceQuery } from '../../application/queries/get-effective-price/get-effective-price.query';

describe('GetEffectivePriceHandler', () => {
  let handler: GetEffectivePriceHandler;
  let prisma: any;

  const mockProduct = {
    id: 'prod-1',
    name: 'Test Product',
    gstRate: 18,
    cessRate: 0,
    taxType: 'GST',
    taxInclusive: false,
    salePrice: 1000,
    mrp: 1200,
  };

  beforeEach(() => {
    prisma = {
      product: {
        findUnique: jest.fn().mockResolvedValue(mockProduct),
      },
      customerGroupMapping: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      productPrice: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    handler = new GetEffectivePriceHandler(prisma);
  });

  it('should return fallback salePrice when no ProductPrice entries exist', async () => {
    const result = await handler.execute(
      new GetEffectivePriceQuery('prod-1'),
    );

    expect(result.productId).toBe('prod-1');
    expect(result.basePrice).toBe(1000);
    expect(result.priceType).toBe('SALE_PRICE');
    expect(result.priceGroup).toBeNull();
    expect(result.slabApplied).toBeNull();
    expect(result.currency).toBe('INR');
  });

  it('should return matching slab price when quantity matches', async () => {
    prisma.productPrice.findMany.mockResolvedValue([
      {
        id: 'pp-1',
        productId: 'prod-1',
        priceType: 'SALE_PRICE',
        amount: 900,
        minQty: 10,
        maxQty: 50,
        priceGroupId: null,
        priceGroup: null,
        isActive: true,
        validFrom: null,
        validTo: null,
      },
    ]);

    const result = await handler.execute(
      new GetEffectivePriceQuery('prod-1', undefined, undefined, 20, false),
    );

    expect(result.basePrice).toBe(900);
    expect(result.slabApplied).toEqual({ minQty: 10, maxQty: 50 });
  });

  it('should return group-specific base price', async () => {
    prisma.customerGroupMapping.findFirst.mockResolvedValue({
      priceGroupId: 'grp-1',
      priceGroup: { id: 'grp-1', priority: 10 },
    });

    prisma.productPrice.findMany.mockResolvedValue([
      {
        id: 'pp-grp',
        productId: 'prod-1',
        priceType: 'SALE_PRICE',
        amount: 850,
        minQty: null,
        maxQty: null,
        priceGroupId: 'grp-1',
        priceGroup: { id: 'grp-1', name: 'Wholesale', priority: 10 },
        isActive: true,
        validFrom: null,
        validTo: null,
      },
      {
        id: 'pp-default',
        productId: 'prod-1',
        priceType: 'SALE_PRICE',
        amount: 1000,
        minQty: null,
        maxQty: null,
        priceGroupId: null,
        priceGroup: null,
        isActive: true,
        validFrom: null,
        validTo: null,
      },
    ]);

    const result = await handler.execute(
      new GetEffectivePriceQuery('prod-1', 'contact-1'),
    );

    expect(result.basePrice).toBe(850);
    expect(result.priceGroup).toBe('Wholesale');
    expect(result.priceType).toBe('SALE_PRICE');
  });

  it('should calculate CGST+SGST for intra-state', async () => {
    const result = await handler.execute(
      new GetEffectivePriceQuery('prod-1', undefined, undefined, 1, false),
    );

    // basePrice=1000, gstRate=18%, intra-state -> CGST 9% + SGST 9%
    expect(result.tax.cgst).toEqual({ rate: 9, amount: 90 });
    expect(result.tax.sgst).toEqual({ rate: 9, amount: 90 });
    expect(result.tax.igst).toBeNull();
    expect(result.tax.totalTax).toBe(180);
  });

  it('should calculate IGST for inter-state', async () => {
    const result = await handler.execute(
      new GetEffectivePriceQuery('prod-1', undefined, undefined, 1, true),
    );

    // basePrice=1000, gstRate=18%, inter-state -> IGST 18%
    expect(result.tax.igst).toEqual({ rate: 18, amount: 180 });
    expect(result.tax.cgst).toBeNull();
    expect(result.tax.sgst).toBeNull();
    expect(result.tax.totalTax).toBe(180);
  });

  it('should handle tax-inclusive pricing (reverse calculate base)', async () => {
    prisma.product.findUnique.mockResolvedValue({
      ...mockProduct,
      taxInclusive: true,
      salePrice: 1180,
    });

    const result = await handler.execute(
      new GetEffectivePriceQuery('prod-1', undefined, undefined, 1, false),
    );

    // taxInclusive: base = 1180 / (1 + 0.18) = 1000
    expect(result.basePrice).toBe(1000);
    expect(result.grandTotal).toBe(1180);
    expect(result.tax.totalTax).toBe(180);
  });
});
