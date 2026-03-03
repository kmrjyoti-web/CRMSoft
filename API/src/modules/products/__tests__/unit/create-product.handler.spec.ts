import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateProductHandler } from '../../application/commands/create-product/create-product.handler';
import { CreateProductCommand } from '../../application/commands/create-product/create-product.command';

describe('CreateProductHandler', () => {
  let handler: CreateProductHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      product: {
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) => ({
          id: 'prod-1',
          ...args.data,
        })),
      },
      productTaxDetail: {
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    handler = new CreateProductHandler(prisma);
  });

  it('should create a product with auto-generated code', async () => {
    prisma.product.count.mockResolvedValue(7);

    const result = await handler.execute(
      new CreateProductCommand(
        { name: 'Wireless Mouse' } as any,
        'user-1',
      ),
    );

    expect(result.code).toBe('PRD-00008');
    expect(prisma.product.count).toHaveBeenCalled();
    expect(prisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: 'PRD-00008' }),
      }),
    );
  });

  it('should throw ConflictException for duplicate code', async () => {
    prisma.product.findFirst.mockResolvedValueOnce(null); // slug check
    prisma.product.findFirst.mockReset();
    prisma.product.findFirst.mockImplementation((args: any) => {
      if (args.where.code === 'PRD-DUP') return { id: 'existing' };
      return null;
    });

    await expect(
      handler.execute(
        new CreateProductCommand(
          { name: 'Duplicate', code: 'PRD-DUP' } as any,
          'user-1',
        ),
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('should auto-generate slug from name', async () => {
    const result = await handler.execute(
      new CreateProductCommand(
        { name: 'Wireless Mouse Pro' } as any,
        'user-1',
      ),
    );

    expect(result.slug).toBe('wireless-mouse-pro');
    expect(prisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'wireless-mouse-pro' }),
      }),
    );
  });

  it('should set isMaster=false when parentId is provided', async () => {
    prisma.product.findUnique.mockImplementation((args: any) => {
      if (args.where.id === 'parent-1') return { id: 'parent-1' };
      return null;
    });

    const result = await handler.execute(
      new CreateProductCommand(
        { name: 'Child Product', parentId: 'parent-1', isMaster: true } as any,
        'user-1',
      ),
    );

    expect(result.isMaster).toBe(false);
    expect(result.parentId).toBe('parent-1');
    expect(prisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isMaster: false, parentId: 'parent-1' }),
      }),
    );
  });

  it('should create tax detail entries when gstRate is provided', async () => {
    await handler.execute(
      new CreateProductCommand(
        { name: 'Taxable Product', gstRate: 18, cessRate: 1 } as any,
        'user-1',
      ),
    );

    expect(prisma.productTaxDetail.createMany).toHaveBeenCalledWith({
      data: [
        { productId: 'prod-1', taxName: 'CGST', taxRate: 9, description: 'Central GST' },
        { productId: 'prod-1', taxName: 'SGST', taxRate: 9, description: 'State GST' },
        { productId: 'prod-1', taxName: 'CESS', taxRate: 1, description: 'Compensation Cess' },
      ],
    });
  });
});
