import { TransactionService } from '../../services/transaction.service';
import { InventoryService } from '../../services/inventory.service';

const mockItem = { id: 'item-1', tenantId: 'tenant-1', productId: 'prod-1', currentStock: 50 };
const mockTxn = { id: 'txn-1', tenantId: 'tenant-1', productId: 'prod-1', quantity: 10 };

function makeServices(overrides: Record<string, any> = {}) {
  const prisma: any = {
    stockTransaction: {
      create: jest.fn().mockResolvedValue(overrides.txn ?? mockTxn),
      findMany: jest.fn().mockResolvedValue(overrides.transactions ?? []),
      count: jest.fn().mockResolvedValue(overrides.txnCount ?? 0),
    },
    inventoryItem: {
      update: jest.fn().mockResolvedValue(mockItem),
    },
    stockSummary: {
      findUnique: jest.fn().mockResolvedValue(overrides.stockSummary ?? null),
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
    },
  };
  prisma.working = prisma;

  const inventoryService = {
    getOrCreateItem: jest.fn().mockResolvedValue(mockItem),
  } as unknown as InventoryService;

  const service = new TransactionService(prisma, inventoryService);
  return { service, prisma, inventoryService };
}

describe('TransactionService', () => {
  describe('record', () => {
    it('should record an inbound stock transaction with positive quantity', async () => {
      const { service, prisma } = makeServices();

      const result = await service.record('tenant-1', {
        productId: 'prod-1',
        transactionType: 'PURCHASE',
        quantity: 10,
        locationId: 'loc-1',
      });

      expect(result).toMatchObject({ id: 'txn-1' });
      expect(prisma.stockTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantity: 10, tenantId: 'tenant-1' }),
        }),
      );
    });

    it('should record an outbound transaction with negative quantity for SALE_OUT', async () => {
      const { service, prisma } = makeServices();

      await service.record('tenant-1', {
        productId: 'prod-1',
        transactionType: 'SALE_OUT',
        quantity: 5,
        locationId: 'loc-1',
      });

      expect(prisma.stockTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantity: -5 }),
        }),
      );
    });

    it('should record DAMAGE as negative (outbound) type', async () => {
      const { service, prisma } = makeServices();

      await service.record('tenant-1', {
        productId: 'prod-1',
        transactionType: 'DAMAGE',
        quantity: 3,
        locationId: 'loc-1',
      });

      expect(prisma.stockTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantity: -3 }),
        }),
      );
    });

    it('should calculate totalAmount when unitPrice is provided', async () => {
      const { service, prisma } = makeServices();

      await service.record('tenant-1', {
        productId: 'prod-1',
        transactionType: 'PURCHASE',
        quantity: 10,
        locationId: 'loc-1',
        unitPrice: 100,
      });

      expect(prisma.stockTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalAmount: 1000, unitPrice: 100 }),
        }),
      );
    });

    it('should update inventoryItem stock after recording transaction', async () => {
      const { service, prisma } = makeServices();

      await service.record('tenant-1', {
        productId: 'prod-1',
        transactionType: 'PURCHASE',
        quantity: 10,
        locationId: 'loc-1',
      });

      expect(prisma.inventoryItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'item-1' },
          data: { currentStock: { increment: 10 } },
        }),
      );
    });

    it('should create stock summary when none exists', async () => {
      const { service, prisma } = makeServices({ stockSummary: null });

      await service.record('tenant-1', {
        productId: 'prod-1',
        transactionType: 'PURCHASE',
        quantity: 10,
        locationId: 'loc-1',
      });

      expect(prisma.stockSummary.create).toHaveBeenCalled();
    });

    it('should update existing stock summary', async () => {
      const { service, prisma } = makeServices({
        stockSummary: { id: 'sum-1', tenantId: 'tenant-1', currentStock: 50 },
      });

      await service.record('tenant-1', {
        productId: 'prod-1',
        transactionType: 'PURCHASE',
        quantity: 10,
        locationId: 'loc-1',
      });

      expect(prisma.stockSummary.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'sum-1' } }),
      );
    });

    it('should use getOrCreateItem from inventoryService', async () => {
      const { service, inventoryService } = makeServices();

      await service.record('tenant-1', {
        productId: 'prod-1',
        transactionType: 'PURCHASE',
        quantity: 5,
        locationId: 'loc-1',
      });

      expect(inventoryService.getOrCreateItem).toHaveBeenCalledWith('tenant-1', 'prod-1');
    });

    it('should apply tenant isolation — tenantId always set on transaction', async () => {
      const { service, prisma } = makeServices();

      await service.record('tenant-42', {
        productId: 'prod-1',
        transactionType: 'PURCHASE',
        quantity: 5,
        locationId: 'loc-1',
      });

      expect(prisma.stockTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId: 'tenant-42' }),
        }),
      );
    });
  });
});
