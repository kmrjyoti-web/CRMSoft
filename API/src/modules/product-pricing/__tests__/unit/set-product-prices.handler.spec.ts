import { NotFoundException } from '@nestjs/common';
import { SetProductPricesHandler } from '../../application/commands/set-product-prices/set-product-prices.handler';
import { SetProductPricesCommand } from '../../application/commands/set-product-prices/set-product-prices.command';

describe('SetProductPricesHandler', () => {
  let handler: SetProductPricesHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      product: {
        findUnique: jest.fn().mockResolvedValue({ id: 'prod-1' }),
      },
      productPrice: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) => ({
          id: 'pp-1',
          ...args.data,
        })),
        update: jest.fn().mockImplementation((args) => ({
          id: args.where.id,
          ...args.data,
        })),
      },
    };
    handler = new SetProductPricesHandler(prisma);
  });

  it('should create prices when none exist', async () => {
    const prices = [
      { priceType: 'SALE_PRICE', amount: 1499 },
      { priceType: 'MRP', amount: 1999 },
    ] as any[];

    const result = await handler.execute(
      new SetProductPricesCommand('prod-1', prices),
    );

    expect(result).toEqual({ productId: 'prod-1', pricesSet: 2 });
    expect(prisma.productPrice.findFirst).toHaveBeenCalledTimes(2);
    expect(prisma.productPrice.create).toHaveBeenCalledTimes(2);
    expect(prisma.productPrice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          productId: 'prod-1',
          priceType: 'SALE_PRICE',
          amount: 1499,
        }),
      }),
    );
  });

  it('should throw NotFoundException for invalid product', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(
      handler.execute(
        new SetProductPricesCommand('non-existent', [
          { priceType: 'SALE_PRICE', amount: 100 },
        ] as any[]),
      ),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.productPrice.findFirst).not.toHaveBeenCalled();
  });
});
