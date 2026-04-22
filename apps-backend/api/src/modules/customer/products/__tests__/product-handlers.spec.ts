import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductHandler } from '../application/commands/create-product/create-product.handler';
import { CreateProductCommand } from '../application/commands/create-product/create-product.command';
import { DeactivateProductHandler } from '../application/commands/deactivate-product/deactivate-product.handler';
import { DeactivateProductCommand } from '../application/commands/deactivate-product/deactivate-product.command';
import { ManageProductImagesHandler } from '../application/commands/manage-product-images/manage-product-images.handler';
import { ManageProductImagesCommand } from '../application/commands/manage-product-images/manage-product-images.command';
import { GetProductByIdHandler } from '../application/queries/get-product-by-id/get-product-by-id.handler';
import { GetProductByIdQuery } from '../application/queries/get-product-by-id/get-product-by-id.query';
import { ListProductsHandler } from '../application/queries/list-products/list-products.handler';
import { ListProductsQuery } from '../application/queries/list-products/list-products.query';
import { GetProductPricingHandler } from '../application/queries/get-product-pricing/get-product-pricing.handler';
import { GetProductPricingQuery } from '../application/queries/get-product-pricing/get-product-pricing.query';

const mockProduct = {
  id: 'prod-1', name: 'Paracetamol 500mg', code: 'PRD-00001', slug: 'paracetamol-500mg',
  salePrice: 50, mrp: 60, gstRate: 12, isMaster: true, isActive: true, status: 'ACTIVE',
  parentId: null,
};

const mockPrisma = {
  working: {
    product: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    productTaxDetail: {
      createMany: jest.fn(),
    },
    productFilter: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    productPrice: {
      findMany: jest.fn(),
    },
    productRelation: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
} as any;
(mockPrisma as any).working = mockPrisma.working;

describe('Product Command & Query Handlers', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── CreateProductHandler ───────────────────────────────────────────────────
  describe('CreateProductHandler', () => {
    let handler: CreateProductHandler;
    beforeEach(() => { handler = new CreateProductHandler(mockPrisma); });

    it('should create product with auto-generated code', async () => {
      mockPrisma.working.product.count.mockResolvedValue(0);
      mockPrisma.working.product.findFirst.mockResolvedValue(null); // no duplicate code or slug
      mockPrisma.working.product.create.mockResolvedValue(mockProduct);
      mockPrisma.working.productTaxDetail.createMany.mockResolvedValue({ count: 2 });

      const result = await handler.execute(
        new CreateProductCommand({ name: 'Paracetamol 500mg', gstRate: 12 } as any, 'user-1'),
      );
      expect(result).toEqual(mockProduct);
      expect(mockPrisma.working.productTaxDetail.createMany).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException for duplicate code', async () => {
      mockPrisma.working.product.count.mockResolvedValue(0);
      mockPrisma.working.product.findFirst.mockResolvedValue(mockProduct); // duplicate found
      await expect(
        handler.execute(new CreateProductCommand({ name: 'Test', code: 'PRD-00001' } as any, 'user-1')),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when parent not found', async () => {
      mockPrisma.working.product.count.mockResolvedValue(5);
      mockPrisma.working.product.findFirst.mockResolvedValue(null); // no dup code
      mockPrisma.working.product.findUnique.mockResolvedValue(null); // parent not found
      await expect(
        handler.execute(new CreateProductCommand({ name: 'Variant', parentId: 'nonexistent' } as any, 'user-1')),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not create tax details when gstRate not provided', async () => {
      mockPrisma.working.product.count.mockResolvedValue(0);
      mockPrisma.working.product.findFirst.mockResolvedValue(null);
      mockPrisma.working.product.create.mockResolvedValue({ ...mockProduct, gstRate: null });
      await handler.execute(new CreateProductCommand({ name: 'NoTax Product' } as any, 'user-1'));
      expect(mockPrisma.working.productTaxDetail.createMany).not.toHaveBeenCalled();
    });
  });

  // ─── DeactivateProductHandler ───────────────────────────────────────────────
  describe('DeactivateProductHandler', () => {
    let handler: DeactivateProductHandler;
    beforeEach(() => { handler = new DeactivateProductHandler(mockPrisma); });

    it('should deactivate product and cascade to children', async () => {
      mockPrisma.working.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.working.product.update.mockResolvedValue({ ...mockProduct, isActive: false });
      mockPrisma.working.product.updateMany.mockResolvedValue({ count: 2 });

      const result = await handler.execute(new DeactivateProductCommand('prod-1'));
      expect(result).toEqual({ id: 'prod-1', deactivated: true });
      expect(mockPrisma.working.product.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { parentId: 'prod-1' } }),
      );
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrisma.working.product.findUnique.mockResolvedValue(null);
      await expect(handler.execute(new DeactivateProductCommand('nonexistent'))).rejects.toThrow(NotFoundException);
    });
  });

  // ─── ManageProductImagesHandler ─────────────────────────────────────────────
  describe('ManageProductImagesHandler', () => {
    let handler: ManageProductImagesHandler;
    beforeEach(() => { handler = new ManageProductImagesHandler(mockPrisma); });

    it('should update product image', async () => {
      mockPrisma.working.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.working.product.update.mockResolvedValue({ ...mockProduct, image: 'new-image.jpg' });

      const result = await handler.execute(
        new ManageProductImagesCommand('prod-1', [{ url: 'new-image.jpg', alt: 'Product' }]),
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrisma.working.product.findUnique.mockResolvedValue(null);
      await expect(
        handler.execute(new ManageProductImagesCommand('nonexistent', [])),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── GetProductByIdHandler ───────────────────────────────────────────────────
  describe('GetProductByIdHandler', () => {
    let handler: GetProductByIdHandler;
    beforeEach(() => { handler = new GetProductByIdHandler(mockPrisma); });

    it('should return product with related data', async () => {
      mockPrisma.working.product.findUnique.mockResolvedValue({
        ...mockProduct, children: [], taxDetails: [], prices: [],
      });
      const result = await handler.execute(new GetProductByIdQuery('prod-1'));
      expect(result.id).toBe('prod-1');
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrisma.working.product.findUnique.mockResolvedValue(null);
      await expect(handler.execute(new GetProductByIdQuery('nonexistent'))).rejects.toThrow(NotFoundException);
    });
  });

  // ─── ListProductsHandler ────────────────────────────────────────────────────
  describe('ListProductsHandler', () => {
    let handler: ListProductsHandler;
    beforeEach(() => { handler = new ListProductsHandler(mockPrisma); });

    it('should return paginated product list', async () => {
      mockPrisma.working.product.findMany.mockResolvedValue([mockProduct]);
      mockPrisma.working.product.count.mockResolvedValue(1);

      const query = new ListProductsQuery(1, 20, 'name', 'asc');
      const result = await handler.execute(query);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply search filter across name, code, shortDescription', async () => {
      mockPrisma.working.product.findMany.mockResolvedValue([]);
      mockPrisma.working.product.count.mockResolvedValue(0);

      const query = new ListProductsQuery(1, 20, 'name', 'asc', 'paracetamol');
      await handler.execute(query);
      const where = mockPrisma.working.product.findMany.mock.calls[0][0].where;
      expect(where.OR).toBeDefined();
      expect(where.OR).toHaveLength(3);
    });

    it('should apply price range filter', async () => {
      mockPrisma.working.product.findMany.mockResolvedValue([]);
      mockPrisma.working.product.count.mockResolvedValue(0);

      const query = new ListProductsQuery(1, 20, 'name', 'asc', undefined, undefined, undefined, undefined, undefined, undefined, 10, 100);
      await handler.execute(query);
      const where = mockPrisma.working.product.findMany.mock.calls[0][0].where;
      expect(where.salePrice).toEqual({ gte: 10, lte: 100 });
    });

    it('should propagate DB error', async () => {
      mockPrisma.working.product.findMany.mockRejectedValue(new Error('DB error'));
      await expect(handler.execute(new ListProductsQuery(1, 20, 'name', 'asc'))).rejects.toThrow('DB error');
    });
  });

  // ─── GetProductPricingHandler ────────────────────────────────────────────────
  describe('GetProductPricingHandler', () => {
    let handler: GetProductPricingHandler;
    beforeEach(() => { handler = new GetProductPricingHandler(mockPrisma); });

    it('should return pricing tiers for a product', async () => {
      mockPrisma.working.product.findUnique.mockResolvedValue({ id: 'prod-1' });
      mockPrisma.working.productPrice.findMany.mockResolvedValue([
        { id: 'price-1', productId: 'prod-1', amount: 50, priceType: 'RETAIL' },
      ]);
      const result = await handler.execute(new GetProductPricingQuery('prod-1'));
      expect(result.productId).toBe('prod-1');
      expect(Array.isArray(result.prices)).toBe(true);
      expect(result.grouped).toBeDefined();
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrisma.working.product.findUnique.mockResolvedValue(null);
      await expect(handler.execute(new GetProductPricingQuery('nonexistent'))).rejects.toThrow(NotFoundException);
    });
  });
});
