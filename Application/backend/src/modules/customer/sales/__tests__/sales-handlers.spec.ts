/**
 * Unit tests for sales module services.
 *
 * Covers:
 * - SaleOrderService: create, findAll, findById, update, approve, reject, cancel,
 *                     convertToInvoice, updateDeliveryProgress
 * - DeliveryChallanService: create, findById, dispatch, deliver, cancel
 * - SaleReturnService: create, findById, inspect, accept, reject
 * - CreditNoteEnhancedService: createFromReturn
 *
 * GST test: SaleOrderService.computeTotals applies CGST/SGST vs IGST based on taxType.
 *
 * Pattern: direct instantiation, mock Prisma service, no NestJS TestingModule.
 */

import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SaleOrderService } from '../services/sale-order.service';
import { DeliveryChallanService } from '../services/delivery-challan.service';
import { SaleReturnService } from '../services/sale-return.service';
import { CreditNoteEnhancedService } from '../services/credit-note-enhanced.service';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const TENANT = 't-1';
const USER = 'user-1';
const YEAR = new Date().getFullYear();

function makeSaleOrder(overrides: Partial<any> = {}) {
  return {
    id: 'so-1',
    tenantId: TENANT,
    orderNumber: `SO-${YEAR}-0001`,
    status: 'DRAFT',
    customerId: 'cust-1',
    customerType: 'CONTACT',
    subtotal: 10000,
    discountAmount: 0,
    taxableAmount: 10000,
    cgstAmount: 900,
    sgstAmount: 900,
    igstAmount: 0,
    grandTotal: 11800,
    completionPercent: 0,
    remarks: null,
    deliveryChallans: [],
    items: [
      {
        id: 'soi-1',
        productId: 'p-1',
        orderedQty: 10,
        deliveredQty: 0,
        pendingQty: 10,
        unitPrice: 1000,
        taxRate: 18,
        taxAmount: 1800,
        totalAmount: 11800,
      },
    ],
    ...overrides,
  };
}

function makeSaleReturn(overrides: Partial<any> = {}) {
  return {
    id: 'sr-1',
    tenantId: TENANT,
    returnNumber: `SR-${YEAR}-0001`,
    status: 'DRAFT',
    customerId: 'cust-1',
    invoiceId: 'inv-1',
    saleOrderId: 'so-1',
    returnReason: 'Defective',
    receiveLocationId: 'loc-1',
    items: [
      {
        id: 'sri-1',
        productId: 'p-1',
        returnedQty: 2,
        unitPrice: 1000,
        taxRate: 18,
        acceptedQty: null,
        rejectedQty: null,
        condition: 'GOOD',
      },
    ],
    ...overrides,
  };
}

function makeDeliveryChallan(overrides: Partial<any> = {}) {
  return {
    id: 'dc-1',
    tenantId: TENANT,
    challanNumber: `DC-${YEAR}-0001`,
    status: 'DRAFT',
    saleOrderId: 'so-1',
    customerId: 'cust-1',
    fromLocationId: 'loc-1',
    items: [
      {
        id: 'dci-1',
        productId: 'p-1',
        quantity: 5,
        saleOrderItemId: 'soi-1',
        fromLocationId: 'loc-1',
      },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// SaleOrderService
// ---------------------------------------------------------------------------
describe('SaleOrderService', () => {
  let service: SaleOrderService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      saleOrder: {
        create: jest.fn().mockResolvedValue(makeSaleOrder()),
        findFirst: jest.fn().mockResolvedValue(makeSaleOrder()),
        findMany: jest.fn().mockResolvedValue([makeSaleOrder()]),
        update: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve(makeSaleOrder({ ...data })),
        ),
        count: jest.fn().mockResolvedValue(1),
      },
      saleOrderItem: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      quotation: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    prisma.working = prisma;
    service = new SaleOrderService(prisma);
  });

  afterEach(() => jest.clearAllMocks());

  // --- create ---
  describe('create', () => {
    it('should create a sale order and return it', async () => {
      const result = await service.create(TENANT, USER, {
        customerId: 'cust-1',
        customerType: 'CONTACT',
        items: [{ productId: 'p-1', orderedQty: 2, unitId: 'u-1', unitPrice: 5000, taxRate: 18, taxType: 'CGST_SGST' }],
      } as any);
      expect(result).toBeDefined();
      expect(prisma.saleOrder.create).toHaveBeenCalledTimes(1);
    });

    it('should copy items from quotation when quotationId provided', async () => {
      prisma.quotation.findFirst.mockResolvedValue({
        id: 'q-1',
        lineItems: [
          { productId: 'p-1', quantity: 3, unitId: 'u-1', unitPrice: 1000, discount: null, taxRate: null, taxType: null, hsnCode: null },
        ],
      });
      await service.create(TENANT, USER, { quotationId: 'q-1', customerId: 'cust-1', items: [] } as any);
      expect(prisma.saleOrder.create).toHaveBeenCalledTimes(1);
    });

    it('[GST] CGST_SGST taxType should split tax equally', async () => {
      // Call computeTotals through create; verify it builds the record
      prisma.saleOrder.create.mockImplementation(({ data }: any) => Promise.resolve({ ...makeSaleOrder(), ...data }));
      const result = await service.create(TENANT, USER, {
        customerId: 'cust-1',
        items: [{ productId: 'p-1', orderedQty: 1, unitId: 'u-1', unitPrice: 1000, taxRate: 18, taxType: 'CGST_SGST' }],
      } as any);
      const createArgs = prisma.saleOrder.create.mock.calls[0][0].data;
      // 18% split: CGST = 9%, SGST = 9%
      expect(createArgs.cgstAmount).toBeCloseTo(90);
      expect(createArgs.sgstAmount).toBeCloseTo(90);
      expect(createArgs.igstAmount).toBe(0);
    });

    it('[GST] IGST taxType should apply full tax as IGST', async () => {
      prisma.saleOrder.create.mockImplementation(({ data }: any) => Promise.resolve({ ...makeSaleOrder(), ...data }));
      await service.create(TENANT, USER, {
        customerId: 'cust-1',
        items: [{ productId: 'p-1', orderedQty: 1, unitId: 'u-1', unitPrice: 1000, taxRate: 18, taxType: 'IGST' }],
      } as any);
      const createArgs = prisma.saleOrder.create.mock.calls[0][0].data;
      expect(createArgs.igstAmount).toBeCloseTo(180);
      expect(createArgs.cgstAmount).toBe(0);
      expect(createArgs.sgstAmount).toBe(0);
    });
  });

  // --- findAll ---
  describe('findAll', () => {
    it('should return paginated sale orders', async () => {
      const result = await service.findAll(TENANT);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by status', async () => {
      prisma.saleOrder.findMany.mockResolvedValue([]);
      prisma.saleOrder.count.mockResolvedValue(0);
      await service.findAll(TENANT, { status: 'CONFIRMED' });
      const callArgs = prisma.saleOrder.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe('CONFIRMED');
      expect(callArgs.where.tenantId).toBe(TENANT);
    });

    it('should filter by customerId', async () => {
      prisma.saleOrder.findMany.mockResolvedValue([]);
      prisma.saleOrder.count.mockResolvedValue(0);
      await service.findAll(TENANT, { customerId: 'cust-99' });
      const callArgs = prisma.saleOrder.findMany.mock.calls[0][0];
      expect(callArgs.where.customerId).toBe('cust-99');
    });

    it('tenant isolation — always filters by tenantId', async () => {
      prisma.saleOrder.findMany.mockResolvedValue([]);
      prisma.saleOrder.count.mockResolvedValue(0);
      await service.findAll('tenant-B');
      const callArgs = prisma.saleOrder.findMany.mock.calls[0][0];
      expect(callArgs.where.tenantId).toBe('tenant-B');
    });
  });

  // --- findById ---
  describe('findById', () => {
    it('should return sale order by ID', async () => {
      const result = await service.findById(TENANT, 'so-1');
      expect(result.id).toBe('so-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(null);
      await expect(service.findById(TENANT, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  // --- update ---
  describe('update', () => {
    it('should update a DRAFT sale order', async () => {
      const result = await service.update(TENANT, 'so-1', { remarks: 'Rush order' } as any);
      expect(prisma.saleOrder.update).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when sale order not found', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(null);
      await expect(service.update(TENANT, 'missing', {}  as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-DRAFT order', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(makeSaleOrder({ status: 'CONFIRMED' }));
      await expect(service.update(TENANT, 'so-1', {} as any)).rejects.toThrow(BadRequestException);
    });

    it('should recalculate totals when items provided', async () => {
      await service.update(TENANT, 'so-1', {
        items: [{ productId: 'p-1', orderedQty: 5, unitId: 'u-1', unitPrice: 1000, taxRate: 18 }],
      } as any);
      expect(prisma.saleOrderItem.deleteMany).toHaveBeenCalledWith({ where: { saleOrderId: 'so-1' } });
    });
  });

  // --- approve ---
  describe('approve', () => {
    it('should approve a DRAFT sale order', async () => {
      prisma.saleOrder.update.mockResolvedValue(makeSaleOrder({ status: 'CONFIRMED' }));
      const result = await service.approve(TENANT, 'so-1', USER);
      expect(result.status).toBe('CONFIRMED');
      expect(prisma.saleOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'CONFIRMED' }) }),
      );
    });

    it('should approve a PENDING_APPROVAL sale order', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(makeSaleOrder({ status: 'PENDING_APPROVAL' }));
      prisma.saleOrder.update.mockResolvedValue(makeSaleOrder({ status: 'CONFIRMED' }));
      const result = await service.approve(TENANT, 'so-1', USER);
      expect(result.status).toBe('CONFIRMED');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(null);
      await expect(service.approve(TENANT, 'missing', USER)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for CONFIRMED order', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(makeSaleOrder({ status: 'CONFIRMED' }));
      await expect(service.approve(TENANT, 'so-1', USER)).rejects.toThrow(BadRequestException);
    });
  });

  // --- reject ---
  describe('reject', () => {
    it('should reject a sale order', async () => {
      prisma.saleOrder.update.mockResolvedValue(makeSaleOrder({ status: 'CANCELLED' }));
      const result = await service.reject(TENANT, 'so-1', 'Wrong specs');
      expect(result.status).toBe('CANCELLED');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(null);
      await expect(service.reject(TENANT, 'missing', 'reason')).rejects.toThrow(NotFoundException);
    });
  });

  // --- cancel ---
  describe('cancel', () => {
    it('should cancel a DRAFT order with no deliveries', async () => {
      prisma.saleOrder.update.mockResolvedValue(makeSaleOrder({ status: 'CANCELLED' }));
      const result = await service.cancel(TENANT, 'so-1');
      expect(result.status).toBe('CANCELLED');
    });

    it('should throw BadRequestException when active deliveries exist', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(
        makeSaleOrder({ status: 'CONFIRMED', deliveryChallans: [{ id: 'dc-1', status: 'DRAFT' }] }),
      );
      await expect(service.cancel(TENANT, 'so-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for COMPLETED order', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(
        makeSaleOrder({ status: 'COMPLETED', deliveryChallans: [] }),
      );
      await expect(service.cancel(TENANT, 'so-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(null);
      await expect(service.cancel(TENANT, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  // --- convertToInvoice ---
  describe('convertToInvoice', () => {
    it('should return invoice-ready data for CONFIRMED order', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(makeSaleOrder({ status: 'CONFIRMED' }));
      const result = await service.convertToInvoice(TENANT, 'so-1', USER);
      expect(result.saleOrderId).toBe('so-1');
      expect(result.items).toHaveLength(1);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(null);
      await expect(service.convertToInvoice(TENANT, 'missing', USER)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-CONFIRMED order', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(makeSaleOrder({ status: 'DRAFT' }));
      await expect(service.convertToInvoice(TENANT, 'so-1', USER)).rejects.toThrow(BadRequestException);
    });
  });

  // --- updateDeliveryProgress ---
  describe('updateDeliveryProgress', () => {
    it('should calculate completion percent and update order', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(
        makeSaleOrder({
          items: [
            { orderedQty: 10, deliveredQty: 5, pendingQty: 5 },
          ],
        }),
      );
      await service.updateDeliveryProgress(TENANT, 'so-1');
      expect(prisma.saleOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ completionPercent: 50 }),
        }),
      );
    });

    it('should set status COMPLETED when 100% delivered', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(
        makeSaleOrder({
          items: [{ orderedQty: 10, deliveredQty: 10 }],
        }),
      );
      await service.updateDeliveryProgress(TENANT, 'so-1');
      expect(prisma.saleOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ completionPercent: 100, status: 'COMPLETED' }),
        }),
      );
    });

    it('should silently return when order not found', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(null);
      await expect(service.updateDeliveryProgress(TENANT, 'missing')).resolves.toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// DeliveryChallanService
// ---------------------------------------------------------------------------
describe('DeliveryChallanService', () => {
  let service: DeliveryChallanService;
  let prisma: any;
  let saleOrderServiceMock: any;

  beforeEach(() => {
    prisma = {
      deliveryChallan: {
        create: jest.fn().mockResolvedValue(makeDeliveryChallan()),
        findFirst: jest.fn().mockResolvedValue(makeDeliveryChallan()),
        findMany: jest.fn().mockResolvedValue([makeDeliveryChallan()]),
        update: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve(makeDeliveryChallan({ ...data })),
        ),
        count: jest.fn().mockResolvedValue(1),
      },
      saleOrder: {
        findFirst: jest.fn().mockResolvedValue(makeSaleOrder({ status: 'CONFIRMED' })),
      },
      saleOrderItem: {
        update: jest.fn().mockResolvedValue({}),
      },
      inventoryItem: {
        findFirst: jest.fn().mockResolvedValue({ id: 'inv-1', productId: 'p-1' }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      stockTransaction: {
        create: jest.fn().mockResolvedValue({}),
      },
      stockSummary: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    prisma.working = prisma;

    saleOrderServiceMock = {
      updateDeliveryProgress: jest.fn().mockResolvedValue(undefined),
    };

    service = new DeliveryChallanService(prisma, saleOrderServiceMock);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create delivery challan in DRAFT status', async () => {
      const result = await service.create(TENANT, USER, {
        saleOrderId: 'so-1',
        customerId: 'cust-1',
        customerType: 'CONTACT',
        items: [{ productId: 'p-1', saleOrderItemId: 'soi-1', quantity: 3, unitId: 'u-1' }],
      } as any);
      expect(result).toBeDefined();
      expect(prisma.deliveryChallan.create).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when sale order not found', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(null);
      await expect(
        service.create(TENANT, USER, {
          saleOrderId: 'missing',
          items: [{ productId: 'p-1', quantity: 1 }],
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-CONFIRMED sale order', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(makeSaleOrder({ status: 'DRAFT' }));
      await expect(
        service.create(TENANT, USER, {
          saleOrderId: 'so-1',
          items: [{ productId: 'p-1', quantity: 1 }],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when delivery qty exceeds pending qty', async () => {
      prisma.saleOrder.findFirst.mockResolvedValue(
        makeSaleOrder({
          status: 'CONFIRMED',
          items: [{ id: 'soi-1', productId: 'p-1', pendingQty: 5 }],
        }),
      );
      await expect(
        service.create(TENANT, USER, {
          saleOrderId: 'so-1',
          items: [{ productId: 'p-1', saleOrderItemId: 'soi-1', quantity: 10 }],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return challan by ID', async () => {
      const result = await service.findById(TENANT, 'dc-1');
      expect(result.id).toBe('dc-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.deliveryChallan.findFirst.mockResolvedValue(null);
      await expect(service.findById(TENANT, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('dispatch', () => {
    it('should dispatch a DRAFT challan and update stock', async () => {
      prisma.deliveryChallan.update.mockResolvedValue(makeDeliveryChallan({ status: 'DISPATCHED' }));
      const result = await service.dispatch(TENANT, 'dc-1', USER);
      expect(result.status).toBe('DISPATCHED');
      expect(prisma.stockTransaction.create).toHaveBeenCalledTimes(1);
      expect(prisma.inventoryItem.updateMany).toHaveBeenCalledTimes(1);
    });

    it('should update delivery progress on sale order', async () => {
      prisma.deliveryChallan.update.mockResolvedValue(makeDeliveryChallan({ status: 'DISPATCHED' }));
      await service.dispatch(TENANT, 'dc-1', USER);
      expect(saleOrderServiceMock.updateDeliveryProgress).toHaveBeenCalledWith(TENANT, 'so-1');
    });

    it('should throw NotFoundException when challan not found', async () => {
      prisma.deliveryChallan.findFirst.mockResolvedValue(null);
      await expect(service.dispatch(TENANT, 'missing', USER)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for already DISPATCHED challan', async () => {
      prisma.deliveryChallan.findFirst.mockResolvedValue(makeDeliveryChallan({ status: 'DISPATCHED' }));
      await expect(service.dispatch(TENANT, 'dc-1', USER)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deliver', () => {
    it('should mark DISPATCHED challan as DELIVERED', async () => {
      prisma.deliveryChallan.findFirst.mockResolvedValue(makeDeliveryChallan({ status: 'DISPATCHED' }));
      prisma.deliveryChallan.update.mockResolvedValue(makeDeliveryChallan({ status: 'DELIVERED' }));
      const result = await service.deliver(TENANT, 'dc-1');
      expect(result.status).toBe('DELIVERED');
    });

    it('should throw BadRequestException for non-DISPATCHED challan', async () => {
      prisma.deliveryChallan.findFirst.mockResolvedValue(makeDeliveryChallan({ status: 'DRAFT' }));
      await expect(service.deliver(TENANT, 'dc-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel a DRAFT challan', async () => {
      prisma.deliveryChallan.update.mockResolvedValue(makeDeliveryChallan({ status: 'CANCELLED' }));
      const result = await service.cancel(TENANT, 'dc-1');
      expect(result.status).toBe('CANCELLED');
    });

    it('should throw BadRequestException for DISPATCHED challan', async () => {
      prisma.deliveryChallan.findFirst.mockResolvedValue(makeDeliveryChallan({ status: 'DISPATCHED' }));
      await expect(service.cancel(TENANT, 'dc-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for DELIVERED challan', async () => {
      prisma.deliveryChallan.findFirst.mockResolvedValue(makeDeliveryChallan({ status: 'DELIVERED' }));
      await expect(service.cancel(TENANT, 'dc-1')).rejects.toThrow(BadRequestException);
    });
  });
});

// ---------------------------------------------------------------------------
// SaleReturnService
// ---------------------------------------------------------------------------
describe('SaleReturnService', () => {
  let service: SaleReturnService;
  let prisma: any;
  let creditNoteServiceMock: any;

  beforeEach(() => {
    prisma = {
      saleReturn: {
        create: jest.fn().mockResolvedValue(makeSaleReturn()),
        findFirst: jest.fn().mockResolvedValue(makeSaleReturn()),
        findMany: jest.fn().mockResolvedValue([makeSaleReturn()]),
        update: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve(makeSaleReturn({ ...data })),
        ),
        count: jest.fn().mockResolvedValue(1),
      },
      saleReturnItem: {
        update: jest.fn().mockResolvedValue({}),
      },
      saleOrderItem: {
        findFirst: jest.fn().mockResolvedValue({ id: 'soi-1' }),
        update: jest.fn().mockResolvedValue({}),
      },
      inventoryItem: {
        findFirst: jest.fn().mockResolvedValue({ id: 'inv-1', productId: 'p-1' }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      stockTransaction: {
        create: jest.fn().mockResolvedValue({}),
      },
      stockSummary: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    prisma.working = prisma;

    creditNoteServiceMock = {
      createFromReturn: jest.fn().mockResolvedValue({ id: 'cn-1' }),
    };

    service = new SaleReturnService(prisma, creditNoteServiceMock);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create a sale return in DRAFT status', async () => {
      const result = await service.create(TENANT, USER, {
        customerId: 'cust-1',
        customerType: 'CONTACT',
        returnReason: 'Defective',
        items: [{ productId: 'p-1', returnedQty: 2, unitId: 'u-1', unitPrice: 1000, taxRate: 18, condition: 'GOOD' }],
      } as any);
      expect(result).toBeDefined();
      expect(prisma.saleReturn.create).toHaveBeenCalledTimes(1);
    });

    it('should calculate subtotal and taxAmount correctly', async () => {
      prisma.saleReturn.create.mockImplementation(({ data }: any) => Promise.resolve({ ...makeSaleReturn(), ...data }));
      await service.create(TENANT, USER, {
        customerId: 'cust-1',
        items: [{ productId: 'p-1', returnedQty: 2, unitId: 'u-1', unitPrice: 500, taxRate: 10 }],
      } as any);
      const createArgs = prisma.saleReturn.create.mock.calls[0][0].data;
      expect(createArgs.subtotal).toBe(1000);   // 2 × 500
      expect(createArgs.taxAmount).toBe(100);   // 10% of 1000
      expect(createArgs.grandTotal).toBe(1100);
    });
  });

  describe('findById', () => {
    it('should return sale return by ID', async () => {
      const result = await service.findById(TENANT, 'sr-1');
      expect(result.id).toBe('sr-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.saleReturn.findFirst.mockResolvedValue(null);
      await expect(service.findById(TENANT, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('inspect', () => {
    it('should update items with inspection results and set status INSPECTED', async () => {
      prisma.saleReturn.update.mockResolvedValue(makeSaleReturn({ status: 'INSPECTED' }));
      const result = await service.inspect(TENANT, 'sr-1', {
        inspections: [{ itemId: 'sri-1', acceptedQty: 1, rejectedQty: 1, condition: 'DAMAGED' }],
      } as any);
      expect(result.status).toBe('INSPECTED');
      expect(prisma.saleReturnItem.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when return not found', async () => {
      prisma.saleReturn.findFirst.mockResolvedValue(null);
      await expect(
        service.inspect(TENANT, 'missing', { inspections: [] } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-DRAFT return', async () => {
      prisma.saleReturn.findFirst.mockResolvedValue(makeSaleReturn({ status: 'INSPECTED' }));
      await expect(
        service.inspect(TENANT, 'sr-1', { inspections: [] } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for unknown item', async () => {
      await expect(
        service.inspect(TENANT, 'sr-1', {
          inspections: [{ itemId: 'nonexistent', acceptedQty: 1 }],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('accept', () => {
    it('should accept a DRAFT return and update inventory', async () => {
      prisma.saleReturn.update.mockResolvedValue(makeSaleReturn({ status: 'ACCEPTED', inventoryUpdated: true }));
      const result = await service.accept(TENANT, 'sr-1', USER);
      expect(result.status).toBe('ACCEPTED');
      expect(prisma.stockTransaction.create).toHaveBeenCalledTimes(1);
      expect(prisma.inventoryItem.updateMany).toHaveBeenCalledTimes(1);
    });

    it('should auto-generate credit note when invoiceId is present', async () => {
      prisma.saleReturn.update.mockResolvedValue(makeSaleReturn({ status: 'ACCEPTED', inventoryUpdated: true }));
      await service.accept(TENANT, 'sr-1', USER);
      expect(creditNoteServiceMock.createFromReturn).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when return not found', async () => {
      prisma.saleReturn.findFirst.mockResolvedValue(null);
      await expect(service.accept(TENANT, 'missing', USER)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-DRAFT/INSPECTED return', async () => {
      prisma.saleReturn.findFirst.mockResolvedValue(makeSaleReturn({ status: 'REJECTED' }));
      await expect(service.accept(TENANT, 'sr-1', USER)).rejects.toThrow(BadRequestException);
    });

    it('should succeed even if credit note creation fails (best-effort)', async () => {
      creditNoteServiceMock.createFromReturn.mockRejectedValue(new Error('Credit note DB error'));
      prisma.saleReturn.update.mockResolvedValue(makeSaleReturn({ status: 'ACCEPTED', inventoryUpdated: true }));
      // Should NOT throw
      await expect(service.accept(TENANT, 'sr-1', USER)).resolves.toBeDefined();
    });
  });

  describe('reject', () => {
    it('should reject a sale return', async () => {
      prisma.saleReturn.update.mockResolvedValue(makeSaleReturn({ status: 'REJECTED' }));
      const result = await service.reject(TENANT, 'sr-1');
      expect(result.status).toBe('REJECTED');
    });

    it('should throw NotFoundException when return not found', async () => {
      prisma.saleReturn.findFirst.mockResolvedValue(null);
      await expect(service.reject(TENANT, 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});

// ---------------------------------------------------------------------------
// CreditNoteEnhancedService
// ---------------------------------------------------------------------------
describe('CreditNoteEnhancedService', () => {
  let service: CreditNoteEnhancedService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      creditNote: {
        create: jest.fn().mockResolvedValue({ id: 'cn-1', creditNoteNo: `CN-${YEAR}-0001` }),
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    prisma.working = prisma;
    service = new CreditNoteEnhancedService(prisma);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create a credit note from accepted sale return', async () => {
    const saleReturn = makeSaleReturn({
      status: 'ACCEPTED',
      invoiceId: 'inv-1',
      items: [{ productId: 'p-1', acceptedQty: 2, returnedQty: 2, unitPrice: 1000, taxRate: 18 }],
    });
    const result = await service.createFromReturn(TENANT, USER, saleReturn);
    expect(result).toBeDefined();
    expect(prisma.creditNote.create).toHaveBeenCalledTimes(1);
  });

  it('should return null when invoiceId is missing', async () => {
    const saleReturn = makeSaleReturn({ invoiceId: null, items: [] });
    const result = await service.createFromReturn(TENANT, USER, saleReturn);
    expect(result).toBeNull();
    expect(prisma.creditNote.create).not.toHaveBeenCalled();
  });

  it('should return null when total amount is zero (all qty zero)', async () => {
    const saleReturn = makeSaleReturn({
      invoiceId: 'inv-1',
      items: [{ acceptedQty: 0, returnedQty: 0, unitPrice: 1000, taxRate: 18 }],
    });
    const result = await service.createFromReturn(TENANT, USER, saleReturn);
    expect(result).toBeNull();
  });

  it('should use returnedQty when acceptedQty is not set', async () => {
    const saleReturn = makeSaleReturn({
      invoiceId: 'inv-1',
      items: [{ acceptedQty: null, returnedQty: 3, unitPrice: 500, taxRate: 0 }],
    });
    await service.createFromReturn(TENANT, USER, saleReturn);
    const createArgs = prisma.creditNote.create.mock.calls[0][0].data;
    // 3 × 500 = 1500, tax = 0
    expect(createArgs.amount).toBe(1500);
  });

  it('should include tax in credit note amount', async () => {
    const saleReturn = makeSaleReturn({
      invoiceId: 'inv-1',
      items: [{ acceptedQty: 1, returnedQty: 1, unitPrice: 1000, taxRate: 18 }],
    });
    await service.createFromReturn(TENANT, USER, saleReturn);
    const createArgs = prisma.creditNote.create.mock.calls[0][0].data;
    // 1 × 1000 + 18% tax = 1180
    expect(createArgs.amount).toBe(1180);
  });
});
