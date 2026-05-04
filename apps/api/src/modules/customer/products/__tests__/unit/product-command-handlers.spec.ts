import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateProductHandler } from '../../application/commands/update-product/update-product.handler';
import { UpdateProductCommand } from '../../application/commands/update-product/update-product.command';
import { DeactivateProductHandler } from '../../application/commands/deactivate-product/deactivate-product.handler';
import { DeactivateProductCommand } from '../../application/commands/deactivate-product/deactivate-product.command';
import { LinkProductsHandler } from '../../application/commands/link-products/link-products.handler';
import { LinkProductsCommand } from '../../application/commands/link-products/link-products.command';

// --- UpdateProductHandler ---

function makeUpdatePrisma(overrides: Record<string, any> = {}) {
  const prisma: any = {
    product: {
      findUnique: jest.fn().mockImplementation((args: any) => {
        if (args.where?.slug) return Promise.resolve(null);
        return Promise.resolve(overrides.existing ?? { id: 'prod-1', name: 'Old Name', slug: 'old-name' });
      }),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue(overrides.children ?? []),
      update: jest.fn().mockImplementation((args: any) => Promise.resolve({ id: args.where.id, ...args.data })),
    },
    productTaxDetail: {
      deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
      createMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
  };
  prisma.working = prisma;
  return prisma;
}

describe('UpdateProductHandler', () => {
  it('should update product fields', async () => {
    const prisma = makeUpdatePrisma();
    const handler = new UpdateProductHandler(prisma);

    const result = await handler.execute(
      new UpdateProductCommand('prod-1', { mrp: 500 } as any),
    );

    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'prod-1' } }),
    );
    expect(result).toMatchObject({ id: 'prod-1' });
  });

  it('should throw NotFoundException when product not found', async () => {
    const prisma = makeUpdatePrisma({ existing: null });
    prisma.product.findUnique.mockResolvedValue(null);
    const handler = new UpdateProductHandler(prisma);

    await expect(
      handler.execute(new UpdateProductCommand('missing', { name: 'X' } as any)),
    ).rejects.toThrow(NotFoundException);
  });

  it('should regenerate slug when name changes', async () => {
    const prisma = makeUpdatePrisma({ existing: { id: 'prod-1', name: 'Old Name', slug: 'old-name' } });
    const handler = new UpdateProductHandler(prisma);

    await handler.execute(new UpdateProductCommand('prod-1', { name: 'New Name' } as any));

    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'new-name' }),
      }),
    );
  });

  it('should throw BadRequestException when product set as own parent', async () => {
    const prisma = makeUpdatePrisma();
    const handler = new UpdateProductHandler(prisma);

    await expect(
      handler.execute(new UpdateProductCommand('prod-1', { parentId: 'prod-1' } as any)),
    ).rejects.toThrow(BadRequestException);
  });

  it('should recreate tax details when gstRate changes', async () => {
    const prisma = makeUpdatePrisma();
    const handler = new UpdateProductHandler(prisma);

    await handler.execute(new UpdateProductCommand('prod-1', { gstRate: 12 } as any));

    expect(prisma.productTaxDetail.deleteMany).toHaveBeenCalledWith({ where: { productId: 'prod-1' } });
    expect(prisma.productTaxDetail.createMany).toHaveBeenCalledWith({
      data: [
        { productId: 'prod-1', taxName: 'CGST', taxRate: 6, description: 'Central GST' },
        { productId: 'prod-1', taxName: 'SGST', taxRate: 6, description: 'State GST' },
      ],
    });
  });

  it('should add CESS entry when cessRate provided with gstRate', async () => {
    const prisma = makeUpdatePrisma();
    const handler = new UpdateProductHandler(prisma);

    await handler.execute(new UpdateProductCommand('prod-1', { gstRate: 18, cessRate: 1 } as any));

    expect(prisma.productTaxDetail.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ taxName: 'CESS', taxRate: 1 }),
      ]),
    });
  });
});

// --- DeactivateProductHandler ---

function makeDeactivatePrisma(overrides: Record<string, any> = {}) {
  const defaultProduct = 'product' in overrides ? overrides.product : { id: 'prod-1', isActive: true };
  const prisma: any = {
    product: {
      findUnique: jest.fn().mockResolvedValue(defaultProduct),
      update: jest.fn().mockResolvedValue({ id: 'prod-1', isActive: false }),
      updateMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
  };
  prisma.working = prisma;
  return prisma;
}

describe('DeactivateProductHandler', () => {
  it('should deactivate product and cascade to children', async () => {
    const prisma = makeDeactivatePrisma();
    const handler = new DeactivateProductHandler(prisma);

    const result = await handler.execute(new DeactivateProductCommand('prod-1'));

    expect(result).toEqual({ id: 'prod-1', deactivated: true });
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prod-1' },
        data: { isActive: false, status: 'INACTIVE' },
      }),
    );
    expect(prisma.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { parentId: 'prod-1' },
        data: { isActive: false, status: 'INACTIVE' },
      }),
    );
  });

  it('should throw NotFoundException when product not found', async () => {
    const prisma = makeDeactivatePrisma({ product: null });
    const handler = new DeactivateProductHandler(prisma);

    await expect(handler.execute(new DeactivateProductCommand('missing'))).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.product.update).not.toHaveBeenCalled();
  });
});

// --- LinkProductsHandler ---

function makeLinkPrisma(overrides: Record<string, any> = {}) {
  const prisma: any = {
    productRelation: {
      findFirst: jest.fn().mockResolvedValue(overrides.existing ?? null),
      create: jest.fn().mockImplementation((args: any) => Promise.resolve({ id: 'rel-1', ...args.data })),
      update: jest.fn().mockImplementation((args: any) => Promise.resolve({ id: args.where.id, ...args.data })),
    },
  };
  prisma.working = prisma;
  return prisma;
}

describe('LinkProductsHandler', () => {
  it('should create a new product relation', async () => {
    const prisma = makeLinkPrisma();
    const handler = new LinkProductsHandler(prisma);

    const result = await handler.execute(new LinkProductsCommand('prod-a', 'prod-b', 'ACCESSORY'));

    expect(prisma.productRelation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ fromProductId: 'prod-a', toProductId: 'prod-b' }),
      }),
    );
    expect(result).toMatchObject({ id: 'rel-1' });
  });

  it('should throw BadRequestException when linking product to itself', async () => {
    const prisma = makeLinkPrisma();
    const handler = new LinkProductsHandler(prisma);

    await expect(
      handler.execute(new LinkProductsCommand('prod-1', 'prod-1', 'ACCESSORY')),
    ).rejects.toThrow(BadRequestException);
  });

  it('should create bidirectional relation for VARIANT type', async () => {
    const prisma = makeLinkPrisma();
    const handler = new LinkProductsHandler(prisma);

    await handler.execute(new LinkProductsCommand('prod-a', 'prod-b', 'VARIANT'));

    expect(prisma.productRelation.create).toHaveBeenCalledTimes(2);
    const calls = prisma.productRelation.create.mock.calls;
    const reverseCall = calls.find((c: any) =>
      c[0].data.fromProductId === 'prod-b' && c[0].data.toProductId === 'prod-a',
    );
    expect(reverseCall).toBeDefined();
  });

  it('should create bidirectional relation for SUBSTITUTE type', async () => {
    const prisma = makeLinkPrisma();
    const handler = new LinkProductsHandler(prisma);

    await handler.execute(new LinkProductsCommand('prod-a', 'prod-b', 'SUBSTITUTE'));

    expect(prisma.productRelation.create).toHaveBeenCalledTimes(2);
  });

  it('should NOT create reverse for non-bidirectional relation type', async () => {
    const prisma = makeLinkPrisma();
    const handler = new LinkProductsHandler(prisma);

    await handler.execute(new LinkProductsCommand('prod-a', 'prod-b', 'ACCESSORY'));

    expect(prisma.productRelation.create).toHaveBeenCalledTimes(1);
  });

  it('should reactivate existing relation instead of creating duplicate', async () => {
    const existing = { id: 'rel-existing', isActive: false };
    const prisma = makeLinkPrisma({ existing });
    const handler = new LinkProductsHandler(prisma);

    await handler.execute(new LinkProductsCommand('prod-a', 'prod-b', 'ACCESSORY'));

    expect(prisma.productRelation.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'rel-existing' }, data: { isActive: true } }),
    );
    expect(prisma.productRelation.create).not.toHaveBeenCalled();
  });
});
