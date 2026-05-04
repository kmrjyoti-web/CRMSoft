import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SaleOrderService } from '../services/sale-order.service';

const makeSO = (overrides = {}) => ({
  id: 'so-1',
  soNumber: 'SO-2026-001',
  tenantId: 't-1',
  status: 'DRAFT',
  customerId: 'cust-1',
  subtotal: 1000,
  taxAmount: 180,
  totalAmount: 1180,
  items: [],
  deliveryChallan: [],
  deliveryChallans: [],
  ...overrides,
});

describe('SaleOrderService', () => {
  let service: SaleOrderService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      working: {
        saleOrder: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findUnique: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          count: jest.fn(),
        },
        saleOrderItem: {
          createMany: jest.fn(),
        },
        invoice: {
          create: jest.fn(),
        },
        deliveryChallans: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
      },
    };
    service = new SaleOrderService(prisma);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated sale orders', async () => {
      prisma.working.saleOrder.findMany.mockResolvedValue([makeSO()]);
      prisma.working.saleOrder.count.mockResolvedValue(1);
      const result = await service.findAll('t-1');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by status', async () => {
      prisma.working.saleOrder.findMany.mockResolvedValue([]);
      prisma.working.saleOrder.count.mockResolvedValue(0);
      await service.findAll('t-1', { status: 'CONFIRMED' });
      const where = prisma.working.saleOrder.findMany.mock.calls[0][0].where;
      expect(where.status).toBe('CONFIRMED');
      expect(where.tenantId).toBe('t-1');
    });
  });

  // ─── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should return a sale order by ID', async () => {
      prisma.working.saleOrder.findFirst.mockResolvedValue(makeSO());
      const result = await service.findById('t-1', 'so-1');
      expect(result.id).toBe('so-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.working.saleOrder.findFirst.mockResolvedValue(null);
      await expect(service.findById('t-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should throw BadRequestException when SO is not DRAFT', async () => {
      prisma.working.saleOrder.findFirst.mockResolvedValue(makeSO({ status: 'CONFIRMED' }));
      await expect(service.update('t-1', 'so-1', { notes: 'Updated' } as any))
        .rejects.toThrow(BadRequestException);
    });

    it('should update a DRAFT sale order', async () => {
      prisma.working.saleOrder.findFirst.mockResolvedValue(makeSO({ status: 'DRAFT' }));
      prisma.working.saleOrder.update.mockResolvedValue(makeSO({ notes: 'Updated' }));
      const result = await service.update('t-1', 'so-1', { notes: 'Updated' } as any);
      expect(result).toBeDefined();
    });
  });

  // ─── approve ──────────────────────────────────────────────────────────────

  describe('approve', () => {
    it('should throw BadRequestException when SO is already CONFIRMED', async () => {
      prisma.working.saleOrder.findFirst.mockResolvedValue(makeSO({ status: 'CONFIRMED' }));
      await expect(service.approve('t-1', 'so-1', 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should approve a DRAFT sale order', async () => {
      prisma.working.saleOrder.findFirst.mockResolvedValue(makeSO({ status: 'DRAFT' }));
      prisma.working.saleOrder.update.mockResolvedValue(makeSO({ status: 'CONFIRMED' }));
      const result = await service.approve('t-1', 'so-1', 'user-1');
      expect(result.status).toBe('CONFIRMED');
    });
  });

  // ─── cancel ───────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('should throw BadRequestException when SO is COMPLETED', async () => {
      prisma.working.saleOrder.findFirst.mockResolvedValue(makeSO({ status: 'COMPLETED', deliveryChallans: [] }));
      prisma.working.deliveryChallans?.findFirst?.mockResolvedValue(null);
      // Mock active delivery check
      prisma.working.saleOrder.findFirst.mockResolvedValue(makeSO({ status: 'COMPLETED' }));
      await expect(service.cancel('t-1', 'so-1')).rejects.toThrow(BadRequestException);
    });

    it('should cancel a DRAFT sale order', async () => {
      prisma.working.saleOrder.findFirst.mockResolvedValue(makeSO({ status: 'DRAFT' }));
      prisma.working.saleOrder.update.mockResolvedValue(makeSO({ status: 'CANCELLED' }));
      const result = await service.cancel('t-1', 'so-1');
      expect(result.status).toBe('CANCELLED');
    });
  });

  // ─── convertToInvoice ─────────────────────────────────────────────────────

  describe('convertToInvoice', () => {
    it('should throw BadRequestException when SO is not CONFIRMED', async () => {
      prisma.working.saleOrder.findFirst.mockResolvedValue(makeSO({ status: 'DRAFT' }));
      await expect(service.convertToInvoice('t-1', 'so-1', 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a sale order', async () => {
      prisma.working.saleOrder.count?.mockResolvedValue(0);
      prisma.working.saleOrder.create.mockResolvedValue(makeSO());
      prisma.working.saleOrderItem.createMany.mockResolvedValue({ count: 1 });
      const result = await service.create('t-1', 'user-1', {
        customerId: 'cust-1',
        items: [{ productId: 'p-1', quantity: 2, unitPrice: 500, taxType: 'CGST_SGST', taxRate: 18 }],
      } as any);
      expect(result).toBeDefined();
    });
  });
});
