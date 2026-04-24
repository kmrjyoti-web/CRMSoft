import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SaleOrderService } from '../services/sale-order.service';

const baseOrder = {
  id: 'so-1', tenantId: 't-1', orderNumber: 'SO-2026-0001',
  status: 'DRAFT', remarks: null,
  deliveryChallans: [],
  items: [],
};

function makePrisma(overrides: Partial<{
  findFirst: any; findMany: any; count: any; create: any; update: any;
}> = {}) {
  return {
    working: {
      saleOrder: {
        findFirst: jest.fn().mockResolvedValue(baseOrder),
        findMany: jest.fn().mockResolvedValue([baseOrder]),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(baseOrder),
        update: jest.fn().mockResolvedValue(baseOrder),
        ...overrides,
      },
      quotation: { findFirst: jest.fn().mockResolvedValue(null) },
    },
  };
}

function makeService(prismaOverrides?: any) {
  const prisma = makePrisma(prismaOverrides);
  return { service: new SaleOrderService(prisma as any), prisma };
}

describe('SaleOrderService', () => {
  describe('generateNumber()', () => {
    it('should generate SO-YYYY-0001 format', async () => {
      const prisma = {
        working: {
          saleOrder: { count: jest.fn().mockResolvedValue(0) },
        },
      };
      const service = new SaleOrderService(prisma as any);
      const num = await service.generateNumber('t-1');
      expect(num).toMatch(/^SO-\d{4}-0001$/);
    });

    it('should increment sequence number', async () => {
      const prisma = {
        working: {
          saleOrder: { count: jest.fn().mockResolvedValue(5) },
        },
      };
      const service = new SaleOrderService(prisma as any);
      const num = await service.generateNumber('t-1');
      expect(num).toMatch(/^SO-\d{4}-0006$/);
    });
  });

  describe('findAll()', () => {
    it('should return paginated sale orders', async () => {
      const { service } = makeService();
      const result = await service.findAll('t-1');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by status', async () => {
      const { service, prisma } = makeService();
      await service.findAll('t-1', { status: 'CONFIRMED' });
      expect(prisma.working.saleOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 't-1', status: 'CONFIRMED' }),
        }),
      );
    });

    it('should apply tenant isolation', async () => {
      const { service, prisma } = makeService();
      await service.findAll('t-1');
      expect(prisma.working.saleOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ tenantId: 't-1' }) }),
      );
    });
  });

  describe('findById()', () => {
    it('should return sale order with items and challans', async () => {
      const { service } = makeService();
      const result = await service.findById('t-1', 'so-1');
      expect(result.id).toBe('so-1');
    });

    it('should throw NotFoundException when order not found', async () => {
      const { service } = makeService({ findFirst: jest.fn().mockResolvedValue(null) });
      await expect(service.findById('t-1', 'so-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve()', () => {
    it('should approve a DRAFT order', async () => {
      const { service, prisma } = makeService();
      await service.approve('t-1', 'so-1', 'u-1');
      expect(prisma.working.saleOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'CONFIRMED', approvedById: 'u-1' }),
        }),
      );
    });

    it('should approve a PENDING_APPROVAL order', async () => {
      const { service } = makeService({
        findFirst: jest.fn().mockResolvedValue({ ...baseOrder, status: 'PENDING_APPROVAL' }),
      });
      await expect(service.approve('t-1', 'so-1', 'u-1')).resolves.toBeDefined();
    });

    it('should throw NotFoundException when order not found', async () => {
      const { service } = makeService({ findFirst: jest.fn().mockResolvedValue(null) });
      await expect(service.approve('t-1', 'so-999', 'u-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for COMPLETED order', async () => {
      const { service } = makeService({
        findFirst: jest.fn().mockResolvedValue({ ...baseOrder, status: 'COMPLETED' }),
      });
      await expect(service.approve('t-1', 'so-1', 'u-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel()', () => {
    it('should cancel a DRAFT order with no active deliveries', async () => {
      const { service, prisma } = makeService();
      await service.cancel('t-1', 'so-1');
      expect(prisma.working.saleOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'CANCELLED' } }),
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      const { service } = makeService({ findFirst: jest.fn().mockResolvedValue(null) });
      await expect(service.cancel('t-1', 'so-999')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when active deliveries exist', async () => {
      const { service } = makeService({
        findFirst: jest.fn().mockResolvedValue({
          ...baseOrder, deliveryChallans: [{ id: 'dc-1', status: 'IN_TRANSIT' }],
        }),
      });
      await expect(service.cancel('t-1', 'so-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for already COMPLETED order', async () => {
      const { service } = makeService({
        findFirst: jest.fn().mockResolvedValue({ ...baseOrder, status: 'COMPLETED', deliveryChallans: [] }),
      });
      await expect(service.cancel('t-1', 'so-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for already CANCELLED order', async () => {
      const { service } = makeService({
        findFirst: jest.fn().mockResolvedValue({ ...baseOrder, status: 'CANCELLED', deliveryChallans: [] }),
      });
      await expect(service.cancel('t-1', 'so-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject()', () => {
    it('should reject an order with a reason', async () => {
      const { service, prisma } = makeService();
      await service.reject('t-1', 'so-1', 'Price too high');
      expect(prisma.working.saleOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'CANCELLED' }) }),
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      const { service } = makeService({ findFirst: jest.fn().mockResolvedValue(null) });
      await expect(service.reject('t-1', 'so-999', 'reason')).rejects.toThrow(NotFoundException);
    });
  });
});
