import { NotFoundException } from '@nestjs/common';
import { GetProductByIdHandler } from '../../application/queries/get-product-by-id/get-product-by-id.handler';
import { GetProductByIdQuery } from '../../application/queries/get-product-by-id/get-product-by-id.query';
import { GetProductTreeHandler } from '../../application/queries/get-product-tree/get-product-tree.handler';
import { GetProductTreeQuery } from '../../application/queries/get-product-tree/get-product-tree.query';

function makePrisma(overrides: Record<string, any> = {}) {
  const prisma: any = {
    product: {
      findUnique: jest.fn().mockResolvedValue(overrides.product ?? null),
      findMany: jest.fn().mockResolvedValue(overrides.products ?? []),
    },
  };
  prisma.working = prisma;
  return prisma;
}

const mockProduct = {
  id: 'prod-1',
  name: 'Wireless Mouse',
  code: 'PRD-001',
  parent: null,
  brand: null,
  manufacturer: null,
  children: [],
  prices: [],
  taxDetails: [],
  unitConversions: [],
  filters: [],
  relatedFrom: [],
  relatedTo: [],
};

// --- GetProductByIdHandler ---

describe('GetProductByIdHandler', () => {
  it('should return product with all relations', async () => {
    const prisma = makePrisma({ product: mockProduct });
    const handler = new GetProductByIdHandler(prisma);

    const result = await handler.execute(new GetProductByIdQuery('prod-1'));

    expect(result).toMatchObject({ id: 'prod-1', name: 'Wireless Mouse' });
    expect(prisma.product.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'prod-1' } }),
    );
  });

  it('should throw NotFoundException when product not found', async () => {
    const prisma = makePrisma({ product: null });
    const handler = new GetProductByIdHandler(prisma);

    await expect(handler.execute(new GetProductByIdQuery('missing-id'))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should include children, prices, and taxDetails in the query', async () => {
    const prisma = makePrisma({ product: mockProduct });
    const handler = new GetProductByIdHandler(prisma);

    await handler.execute(new GetProductByIdQuery('prod-1'));

    expect(prisma.product.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          children: expect.anything(),
          prices: true,
          taxDetails: true,
        }),
      }),
    );
  });
});

// --- GetProductTreeHandler ---

const masterProducts = [
  {
    id: 'master-1',
    name: 'Electronics',
    isMaster: true,
    isActive: true,
    sortOrder: 1,
    children: [{ id: 'child-1', name: 'Mouse', isActive: true, sortOrder: 1 }],
  },
  {
    id: 'master-2',
    name: 'Accessories',
    isMaster: true,
    isActive: true,
    sortOrder: 2,
    children: [],
  },
];

describe('GetProductTreeHandler', () => {
  it('should return only master active products', async () => {
    const prisma = makePrisma({ products: masterProducts });
    const handler = new GetProductTreeHandler(prisma);

    const result = await handler.execute(new GetProductTreeQuery());

    expect(result).toHaveLength(2);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isMaster: true, isActive: true },
      }),
    );
  });

  it('should order by sortOrder ascending', async () => {
    const prisma = makePrisma({ products: masterProducts });
    const handler = new GetProductTreeHandler(prisma);

    await handler.execute(new GetProductTreeQuery());

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { sortOrder: 'asc' } }),
    );
  });

  it('should include children with active filter', async () => {
    const prisma = makePrisma({ products: masterProducts });
    const handler = new GetProductTreeHandler(prisma);

    await handler.execute(new GetProductTreeQuery());

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          children: expect.objectContaining({
            where: { isActive: true },
          }),
        }),
      }),
    );
  });

  it('should return empty array when no master products exist', async () => {
    const prisma = makePrisma({ products: [] });
    const handler = new GetProductTreeHandler(prisma);

    const result = await handler.execute(new GetProductTreeQuery());

    expect(result).toEqual([]);
  });
});
