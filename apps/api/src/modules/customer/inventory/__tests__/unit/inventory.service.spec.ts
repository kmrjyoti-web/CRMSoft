import { InventoryService } from '../../services/inventory.service';

const mockItem = {
  id: 'item-1',
  tenantId: 'tenant-1',
  productId: 'prod-1',
  currentStock: 50,
  reorderLevel: 10,
  avgCostPrice: 100,
  lastPurchasePrice: 95,
  isActive: true,
  inventoryType: 'SIMPLE',
};

function makeService(overrides: Record<string, any> = {}) {
  const prisma: any = {
    inventoryItem: {
      findUnique: jest.fn().mockResolvedValue(
        'existingItem' in overrides ? overrides.existingItem : mockItem,
      ),
      create: jest.fn().mockResolvedValue(overrides.createdItem ?? mockItem),
      findMany: jest.fn().mockResolvedValue(overrides.inventoryItems ?? [mockItem]),
      update: jest.fn().mockResolvedValue(mockItem),
      aggregate: jest.fn().mockResolvedValue(
        overrides.aggregate ?? { _sum: { currentStock: 100 }, _count: 2 },
      ),
    },
    stockSummary: {
      findMany: jest.fn().mockResolvedValue(overrides.stockSummaries ?? []),
      upsert: jest.fn().mockResolvedValue({}),
    },
    stockTransaction: {
      findMany: jest.fn().mockResolvedValue(overrides.transactions ?? []),
    },
    serialMaster: {
      count: jest.fn().mockResolvedValue(overrides.serialCount ?? 5),
    },
  };
  prisma.working = prisma;
  return { service: new InventoryService(prisma), prisma };
}

describe('InventoryService', () => {
  describe('getOrCreateItem', () => {
    it('should return existing item without creating', async () => {
      const { service, prisma } = makeService();
      const result = await service.getOrCreateItem('tenant-1', 'prod-1');
      expect(result.id).toBe('item-1');
      expect(prisma.inventoryItem.create).not.toHaveBeenCalled();
    });

    it('should create item when not found', async () => {
      const { service, prisma } = makeService({ existingItem: null });
      await service.getOrCreateItem('tenant-1', 'prod-1');
      expect(prisma.inventoryItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId: 'tenant-1', productId: 'prod-1' }),
        }),
      );
    });
  });

  describe('getStockSummary', () => {
    it('should return stock summaries with no filters', async () => {
      const { service, prisma } = makeService({
        stockSummaries: [{ id: 'sum-1', currentStock: 50 }],
      });
      const result = await service.getStockSummary('tenant-1', {});
      expect(result).toHaveLength(1);
      const where = prisma.stockSummary.findMany.mock.calls[0][0].where;
      expect(where.productId).toBeUndefined();
    });

    it('should apply productId filter when provided', async () => {
      const { service, prisma } = makeService({ stockSummaries: [] });
      await service.getStockSummary('tenant-1', { productId: 'prod-1' });
      const where = prisma.stockSummary.findMany.mock.calls[0][0].where;
      expect(where.productId).toBe('prod-1');
    });

    it('should apply locationId filter when provided', async () => {
      const { service, prisma } = makeService({ stockSummaries: [] });
      await service.getStockSummary('tenant-1', { locationId: 'loc-1' });
      const where = prisma.stockSummary.findMany.mock.calls[0][0].where;
      expect(where.locationId).toBe('loc-1');
    });
  });

  describe('getOpeningBalance', () => {
    it('should sum quantities for transactions before date', async () => {
      const { service } = makeService({
        transactions: [
          { quantity: 100, transactionDate: new Date('2026-01-01') },
          { quantity: -30, transactionDate: new Date('2026-02-01') },
        ],
      });
      const result = await service.getOpeningBalance('tenant-1', 'prod-1', new Date('2026-03-01'));
      expect(result.openingBalance).toBe(70);
    });

    it('should return 0 when no transactions', async () => {
      const { service } = makeService({ transactions: [] });
      const result = await service.getOpeningBalance('tenant-1', 'prod-1', new Date());
      expect(result.openingBalance).toBe(0);
    });
  });

  describe('recalculateStock', () => {
    it('should upsert stock summary per location and update item total', async () => {
      const { service, prisma } = makeService({
        transactions: [
          { locationId: 'loc-1', quantity: 100, transactionDate: new Date() },
          { locationId: 'loc-1', quantity: -20, transactionDate: new Date() },
          { locationId: 'loc-2', quantity: 50, transactionDate: new Date() },
        ],
      });
      const result = await service.recalculateStock('tenant-1', 'prod-1');
      expect(prisma.stockSummary.upsert).toHaveBeenCalledTimes(2);
      expect(result.totalStock).toBe(130); // 80 + 50
      expect(result.locations).toBe(2);
    });

    it('should update inventoryItem currentStock', async () => {
      const { service, prisma } = makeService({
        transactions: [{ locationId: 'loc-1', quantity: 75, transactionDate: new Date() }],
      });
      await service.recalculateStock('tenant-1', 'prod-1');
      expect(prisma.inventoryItem.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { currentStock: 75 } }),
      );
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard summary with correct shape', async () => {
      const { service } = makeService();
      const result = await service.getDashboard('tenant-1');
      expect(result).toHaveProperty('totalStock');
      expect(result).toHaveProperty('totalProducts');
      expect(result).toHaveProperty('totalSerials');
      expect(result).toHaveProperty('stockValue');
      expect(result).toHaveProperty('expiringSoon');
      expect(result).toHaveProperty('lowStockAlerts');
    });

    it('should count low stock items correctly', async () => {
      const { service } = makeService({
        inventoryItems: [
          { ...mockItem, currentStock: 5, reorderLevel: 10 },   // low stock
          { ...mockItem, currentStock: 50, reorderLevel: 10 },  // ok
          { ...mockItem, currentStock: 10, reorderLevel: 10 },  // at threshold (low)
        ],
      });
      const result = await service.getDashboard('tenant-1');
      expect(result.lowStockAlerts).toBe(2);
    });

    it('should compute stockValue from avgCostPrice * currentStock', async () => {
      const { service } = makeService({
        inventoryItems: [
          { ...mockItem, avgCostPrice: 100, currentStock: 10 },
          { ...mockItem, avgCostPrice: 50, currentStock: 4 },
        ],
      });
      const result = await service.getDashboard('tenant-1');
      expect(result.stockValue).toBe(1200); // 1000 + 200
    });
  });
});
