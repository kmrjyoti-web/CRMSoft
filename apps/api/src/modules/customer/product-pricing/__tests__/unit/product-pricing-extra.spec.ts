import { NotFoundException, BadRequestException } from '@nestjs/common';
import { GetPriceListHandler } from '../../application/queries/get-price-list/get-price-list.handler';
import { GetPriceListQuery } from '../../application/queries/get-price-list/get-price-list.query';
import { SetSlabPriceHandler } from '../../application/commands/set-slab-price/set-slab-price.handler';
import { SetSlabPriceCommand } from '../../application/commands/set-slab-price/set-slab-price.command';
import { SetGroupPriceHandler } from '../../application/commands/set-group-price/set-group-price.handler';
import { SetGroupPriceCommand } from '../../application/commands/set-group-price/set-group-price.command';

const mockProduct = { id: 'prod-1', name: 'Widget', code: 'PRD-001', mrp: 1000, salePrice: 900 };

// --- GetPriceListHandler ---

function makePriceListPrisma(overrides: Record<string, any> = {}) {
  const product = 'product' in overrides ? overrides.product : mockProduct;
  const prisma: any = {
    product: {
      findUnique: jest.fn().mockResolvedValue(product),
    },
    productPrice: {
      findMany: jest.fn().mockResolvedValue(overrides.prices ?? []),
    },
  };
  prisma.working = prisma;
  return prisma;
}

describe('GetPriceListHandler', () => {
  it('should return product with grouped prices', async () => {
    const prices = [
      { id: 'p1', priceType: 'SALE', amount: 800, minQty: 1, priceGroup: null },
      { id: 'p2', priceType: 'SALE', amount: 750, minQty: 10, priceGroup: null },
      { id: 'p3', priceType: 'WHOLESALE', amount: 700, minQty: 1, priceGroup: null },
    ];
    const prisma = makePriceListPrisma({ prices });
    const handler = new GetPriceListHandler(prisma);

    const result = await handler.execute(new GetPriceListQuery('prod-1'));

    expect(result.product.id).toBe('prod-1');
    expect(result.totalPriceEntries).toBe(3);
    expect(result.pricesByType['SALE']).toHaveLength(2);
    expect(result.pricesByType['WHOLESALE']).toHaveLength(1);
  });

  it('should throw NotFoundException when product not found', async () => {
    const prisma = makePriceListPrisma({ product: null });
    const handler = new GetPriceListHandler(prisma);

    await expect(handler.execute(new GetPriceListQuery('missing'))).rejects.toThrow(NotFoundException);
  });

  it('should return empty pricesByType when no prices exist', async () => {
    const prisma = makePriceListPrisma({ prices: [] });
    const handler = new GetPriceListHandler(prisma);

    const result = await handler.execute(new GetPriceListQuery('prod-1'));

    expect(result.totalPriceEntries).toBe(0);
    expect(result.pricesByType).toEqual({});
  });
});

// --- SetSlabPriceHandler ---

function makeSlabPrisma(overrides: Record<string, any> = {}) {
  const product = 'product' in overrides ? overrides.product : { id: 'prod-1' };
  const prisma: any = {
    product: {
      findUnique: jest.fn().mockResolvedValue(product),
    },
    productPrice: {
      deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
      createMany: jest.fn().mockResolvedValue({ count: overrides.createCount ?? 2 }),
    },
  };
  prisma.working = prisma;
  return prisma;
}

describe('SetSlabPriceHandler', () => {
  const validSlabs = [
    { minQty: 1, maxQty: 9, amount: 100 },
    { minQty: 10, maxQty: undefined, amount: 80 },
  ];

  it('should set slab prices successfully', async () => {
    const prisma = makeSlabPrisma({ createCount: 2 });
    const handler = new SetSlabPriceHandler(prisma);

    const result = await handler.execute(new SetSlabPriceCommand('prod-1', 'SALE', validSlabs));

    expect(result).toEqual({ productId: 'prod-1', priceType: 'SALE', slabCount: 2 });
    expect(prisma.productPrice.deleteMany).toHaveBeenCalled();
    expect(prisma.productPrice.createMany).toHaveBeenCalled();
  });

  it('should throw NotFoundException when product not found', async () => {
    const prisma = makeSlabPrisma({ product: null });
    const handler = new SetSlabPriceHandler(prisma);

    await expect(
      handler.execute(new SetSlabPriceCommand('missing', 'SALE', validSlabs)),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for empty slabs array', async () => {
    const prisma = makeSlabPrisma();
    const handler = new SetSlabPriceHandler(prisma);

    await expect(
      handler.execute(new SetSlabPriceCommand('prod-1', 'SALE', [])),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for overlapping slabs', async () => {
    const prisma = makeSlabPrisma();
    const handler = new SetSlabPriceHandler(prisma);

    const overlappingSlabs = [
      { minQty: 1, maxQty: 10, amount: 100 },
      { minQty: 8, maxQty: undefined, amount: 80 },
    ];

    await expect(
      handler.execute(new SetSlabPriceCommand('prod-1', 'SALE', overlappingSlabs)),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when non-last slab has open maxQty', async () => {
    const prisma = makeSlabPrisma();
    const handler = new SetSlabPriceHandler(prisma);

    const invalidSlabs = [
      { minQty: 1, maxQty: undefined, amount: 100 },
      { minQty: 10, maxQty: undefined, amount: 80 },
    ];

    await expect(
      handler.execute(new SetSlabPriceCommand('prod-1', 'SALE', invalidSlabs)),
    ).rejects.toThrow(BadRequestException);
  });
});

// --- SetGroupPriceHandler ---

function makeGroupPrisma(overrides: Record<string, any> = {}) {
  const group = 'group' in overrides ? overrides.group : { id: 'grp-1', name: 'Retail' };
  const prisma: any = {
    product: {
      findUnique: jest.fn().mockImplementation((args: any) => {
        if (args?.where?.id === 'prod-1') return Promise.resolve({ id: 'prod-1' });
        return Promise.resolve(null);
      }),
    },
    customerPriceGroup: {
      findUnique: jest.fn().mockResolvedValue(group),
    },
    productPrice: {
      findFirst: jest.fn().mockResolvedValue(overrides.existing ?? null),
      create: jest.fn().mockImplementation((args: any) => Promise.resolve({ id: 'price-1', ...args.data })),
      update: jest.fn().mockImplementation((args: any) => Promise.resolve({ id: args.where.id, ...args.data })),
    },
  };
  prisma.working = prisma;
  return prisma;
}

describe('SetGroupPriceHandler', () => {
  it('should create new group price', async () => {
    const prisma = makeGroupPrisma();
    const handler = new SetGroupPriceHandler(prisma);

    const result = await handler.execute(new SetGroupPriceCommand('prod-1', 'grp-1', 'SALE', 850));

    expect(prisma.productPrice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ productId: 'prod-1', priceGroupId: 'grp-1', amount: 850 }),
      }),
    );
    expect(result).toMatchObject({ id: 'price-1' });
  });

  it('should update existing group price', async () => {
    const existing = { id: 'price-existing', amount: 800 };
    const prisma = makeGroupPrisma({ existing });
    const handler = new SetGroupPriceHandler(prisma);

    await handler.execute(new SetGroupPriceCommand('prod-1', 'grp-1', 'SALE', 750));

    expect(prisma.productPrice.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'price-existing' }, data: { amount: 750, isActive: true } }),
    );
    expect(prisma.productPrice.create).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when product not found', async () => {
    const prisma = makeGroupPrisma();
    prisma.product.findUnique.mockResolvedValue(null);
    const handler = new SetGroupPriceHandler(prisma);

    await expect(
      handler.execute(new SetGroupPriceCommand('missing', 'grp-1', 'SALE', 100)),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when price group not found', async () => {
    const prisma = makeGroupPrisma({ group: null });
    const handler = new SetGroupPriceHandler(prisma);

    await expect(
      handler.execute(new SetGroupPriceCommand('prod-1', 'missing-grp', 'SALE', 100)),
    ).rejects.toThrow(NotFoundException);
  });
});
