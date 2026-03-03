import { ListProductsHandler } from '../../application/queries/list-products/list-products.handler';
import { ListProductsQuery } from '../../application/queries/list-products/list-products.query';

describe('ListProductsHandler', () => {
  let handler: ListProductsHandler;
  let prisma: any;

  const mockProducts = [
    { id: 'p1', name: 'Product A', code: 'PRD-00001', status: 'ACTIVE', salePrice: 500, tags: ['electronics'] },
    { id: 'p2', name: 'Product B', code: 'PRD-00002', status: 'ACTIVE', salePrice: 1200, tags: ['furniture'] },
  ];

  beforeEach(() => {
    prisma = {
      product: {
        findMany: jest.fn().mockResolvedValue(mockProducts),
        count: jest.fn().mockResolvedValue(2),
      },
    };
    handler = new ListProductsHandler(prisma);
  });

  it('should return paginated products', async () => {
    const result = await handler.execute(
      new ListProductsQuery(1, 10, 'createdAt', 'desc'),
    );

    expect(result).toEqual({ data: mockProducts, total: 2, page: 1, limit: 10 });
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    );
    expect(prisma.product.count).toHaveBeenCalled();
  });

  it('should apply search filter across name/code/shortDescription', async () => {
    await handler.execute(
      new ListProductsQuery(1, 10, 'name', 'asc', 'mouse'),
    );

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'mouse', mode: 'insensitive' } },
            { code: { contains: 'mouse', mode: 'insensitive' } },
            { shortDescription: { contains: 'mouse', mode: 'insensitive' } },
          ],
        }),
      }),
    );
  });

  it('should filter by status and price range', async () => {
    await handler.execute(
      new ListProductsQuery(
        1, 10, 'createdAt', 'desc',
        undefined,   // search
        'ACTIVE',    // status
        undefined,   // parentId
        undefined,   // isMaster
        undefined,   // brandId
        undefined,   // manufacturerId
        100,         // minPrice
        2000,        // maxPrice
      ),
    );

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'ACTIVE',
          salePrice: { gte: 100, lte: 2000 },
        }),
      }),
    );
  });

  it('should filter by tags using hasSome', async () => {
    await handler.execute(
      new ListProductsQuery(
        1, 10, 'createdAt', 'desc',
        undefined,   // search
        undefined,   // status
        undefined,   // parentId
        undefined,   // isMaster
        undefined,   // brandId
        undefined,   // manufacturerId
        undefined,   // minPrice
        undefined,   // maxPrice
        undefined,   // taxType
        undefined,   // licenseRequired
        'electronics, wireless',  // tags
      ),
    );

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tags: { hasSome: ['electronics', 'wireless'] },
        }),
      }),
    );
  });
});
