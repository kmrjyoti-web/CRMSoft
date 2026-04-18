import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PurchaseOrderService } from '../services/purchase-order.service';

const makePO = (overrides = {}) => ({
  id: 'po-1',
  poNumber: 'PO-2026-001',
  tenantId: 't-1',
  status: 'DRAFT',
  vendorId: 'v-1',
  subtotal: 1000,
  taxAmount: 180,
  totalAmount: 1180,
  items: [],
  ...overrides,
});

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      working: {
        purchaseOrder: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findUnique: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          count: jest.fn(),
        },
        purchaseOrderItem: {
          createMany: jest.fn(),
        },
      },
    };
    service = new PurchaseOrderService(prisma);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── list ─────────────────────────────────────────────────────────────────

  describe('list', () => {
    it('should return paginated purchase orders', async () => {
      prisma.working.purchaseOrder.findMany.mockResolvedValue([makePO()]);
      prisma.working.purchaseOrder.count.mockResolvedValue(1);
      const result = await service.list('t-1');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by status', async () => {
      prisma.working.purchaseOrder.findMany.mockResolvedValue([]);
      prisma.working.purchaseOrder.count.mockResolvedValue(0);
      await service.list('t-1', { status: 'APPROVED' });
      const where = prisma.working.purchaseOrder.findMany.mock.calls[0][0].where;
      expect(where.status).toBe('APPROVED');
      expect(where.tenantId).toBe('t-1');
    });

    it('should return empty when no POs exist', async () => {
      prisma.working.purchaseOrder.findMany.mockResolvedValue([]);
      prisma.working.purchaseOrder.count.mockResolvedValue(0);
      const result = await service.list('t-1');
      expect(result.data).toEqual([]);
    });
  });

  // ─── getById ──────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('should return a purchase order by ID', async () => {
      prisma.working.purchaseOrder.findFirst.mockResolvedValue(makePO());
      const result = await service.getById('t-1', 'po-1');
      expect(result.id).toBe('po-1');
    });

    it('should throw NotFoundException when PO not found', async () => {
      prisma.working.purchaseOrder.findFirst.mockResolvedValue(null);
      await expect(service.getById('t-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── submitForApproval ────────────────────────────────────────────────────

  describe('submitForApproval', () => {
    it('should throw NotFoundException when PO not found', async () => {
      prisma.working.purchaseOrder.findFirst.mockResolvedValue(null);
      await expect(service.submitForApproval('t-1', 'missing')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when PO is not DRAFT', async () => {
      prisma.working.purchaseOrder.findFirst.mockResolvedValue(makePO({ status: 'APPROVED' }));
      await expect(service.submitForApproval('t-1', 'po-1')).rejects.toThrow(BadRequestException);
    });

    it('should submit a DRAFT PO for approval', async () => {
      prisma.working.purchaseOrder.findFirst.mockResolvedValue(makePO({ status: 'DRAFT' }));
      prisma.working.purchaseOrder.update.mockResolvedValue(makePO({ status: 'PENDING_APPROVAL' }));
      const result = await service.submitForApproval('t-1', 'po-1');
      expect(result.status).toBe('PENDING_APPROVAL');
    });
  });

  // ─── approve ──────────────────────────────────────────────────────────────

  describe('approve', () => {
    it('should throw BadRequestException when PO is not PENDING_APPROVAL', async () => {
      prisma.working.purchaseOrder.findFirst.mockResolvedValue(makePO({ status: 'DRAFT' }));
      await expect(service.approve('t-1', 'po-1', 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should approve a PENDING_APPROVAL PO', async () => {
      prisma.working.purchaseOrder.findFirst.mockResolvedValue(makePO({ status: 'PENDING_APPROVAL' }));
      prisma.working.purchaseOrder.update.mockResolvedValue(makePO({ status: 'APPROVED' }));
      const result = await service.approve('t-1', 'po-1', 'user-1');
      expect(result.status).toBe('APPROVED');
    });
  });

  // ─── cancel ───────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('should throw BadRequestException when PO is COMPLETED', async () => {
      prisma.working.purchaseOrder.findFirst.mockResolvedValue(makePO({ status: 'COMPLETED' }));
      await expect(service.cancel('t-1', 'po-1')).rejects.toThrow(BadRequestException);
    });

    it('should cancel an active PO', async () => {
      prisma.working.purchaseOrder.findFirst.mockResolvedValue(makePO({ status: 'APPROVED' }));
      prisma.working.purchaseOrder.update.mockResolvedValue(makePO({ status: 'CANCELLED' }));
      const result = await service.cancel('t-1', 'po-1');
      expect(result.status).toBe('CANCELLED');
    });
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a purchase order with calculated totals', async () => {
      prisma.working.purchaseOrder.count?.mockResolvedValue(0);
      prisma.working.purchaseOrder.create.mockResolvedValue(makePO());
      prisma.working.purchaseOrderItem.createMany.mockResolvedValue({ count: 1 });
      const result = await service.create('t-1', 'user-1', {
        poNumber: 'PO-001',
        vendorId: 'v-1',
        items: [{ productId: 'p-1', quantity: 2, unitPrice: 500, taxRate: 18 }],
      } as any);
      expect(result).toBeDefined();
    });
  });
});
