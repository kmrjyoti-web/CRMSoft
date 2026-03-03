import { InvoiceService } from '../services/invoice.service';
import { GstCalculatorService } from '../services/gst-calculator.service';
import { AmountInWordsService } from '../services/amount-in-words.service';

const mockPrisma = {
  invoice: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
    aggregate: jest.fn(),
  },
  quotation: { findFirst: jest.fn() },
  contact: { findUnique: jest.fn() },
  organization: { findUnique: jest.fn() },
  payment: { findMany: jest.fn() },
  refund: { findMany: jest.fn() },
  creditNote: { findMany: jest.fn() },
} as any;

const mockAutoNumber = { next: jest.fn() } as any;
const mockCompanyProfile = { getPublic: jest.fn() } as any;

describe('InvoiceService', () => {
  let service: InvoiceService;
  const gstCalc = new GstCalculatorService();
  const amountInWords = new AmountInWordsService();

  beforeEach(() => {
    jest.clearAllMocks();
    service = new InvoiceService(
      mockPrisma,
      gstCalc,
      amountInWords,
      mockAutoNumber,
      mockCompanyProfile,
    );
  });

  it('should create invoice with GST calculation', async () => {
    mockAutoNumber.next.mockResolvedValue('INV-2026-02-0001');
    mockCompanyProfile.getPublic.mockResolvedValue({
      companyName: 'Test Corp',
      state: 'Maharashtra',
      gstNumber: '27AAACB1234L1Z5',
    });
    mockPrisma.invoice.create.mockResolvedValue({
      id: 'inv1',
      invoiceNo: 'INV-2026-02-0001',
      totalAmount: 1180,
    });

    const result = await service.create('t1', {
      billingName: 'Customer',
      billingState: 'Maharashtra',
      dueDate: '2026-03-31',
      lineItems: [
        { productName: 'Product A', quantity: 1, unitPrice: 1000, gstRate: 18 },
      ],
    }, 'user1');

    expect(mockAutoNumber.next).toHaveBeenCalledWith('t1', 'Invoice');
    expect(mockPrisma.invoice.create).toHaveBeenCalled();
    const createCall = mockPrisma.invoice.create.mock.calls[0][0];
    expect(createCall.data.sellerName).toBe('Test Corp');
  });

  it('should reject update on non-DRAFT invoice', async () => {
    mockPrisma.invoice.findFirst.mockResolvedValue({
      id: 'inv1',
      status: 'SENT',
    });

    await expect(
      service.update('t1', 'inv1', { billingName: 'New Name' }),
    ).rejects.toThrow();
  });

  it('should mark overdue invoices', async () => {
    mockPrisma.invoice.updateMany.mockResolvedValue({ count: 3 });

    const count = await service.markOverdue('t1');
    expect(count).toBe(3);
    expect(mockPrisma.invoice.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'OVERDUE' },
      }),
    );
  });

  it('should recalculate balance after payments', async () => {
    mockPrisma.payment.findMany.mockResolvedValue([
      { amount: 500 },
      { amount: 300 },
    ]);
    mockPrisma.refund.findMany.mockResolvedValue([]);
    mockPrisma.creditNote.findMany.mockResolvedValue([]);
    mockPrisma.invoice.findUnique.mockResolvedValue({
      id: 'inv1',
      totalAmount: 1000,
      status: 'SENT',
    });
    mockPrisma.invoice.update.mockResolvedValue({});

    await service.recalculateBalance('inv1');

    expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paidAmount: 800,
          balanceAmount: 200,
          status: 'PARTIALLY_PAID',
        }),
      }),
    );
  });

  it('should mark invoice PAID when fully paid', async () => {
    mockPrisma.payment.findMany.mockResolvedValue([{ amount: 1000 }]);
    mockPrisma.refund.findMany.mockResolvedValue([]);
    mockPrisma.creditNote.findMany.mockResolvedValue([]);
    mockPrisma.invoice.findUnique.mockResolvedValue({
      id: 'inv1',
      totalAmount: 1000,
      status: 'SENT',
    });
    mockPrisma.invoice.update.mockResolvedValue({});

    await service.recalculateBalance('inv1');

    expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PAID',
          balanceAmount: 0,
        }),
      }),
    );
  });

  it('should cancel invoice', async () => {
    mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'inv1', status: 'SENT' });
    mockPrisma.invoice.update.mockResolvedValue({ status: 'CANCELLED' });

    const result = await service.cancel('t1', 'inv1', 'Wrong amount', 'user1');
    expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CANCELLED', cancelReason: 'Wrong amount' }),
      }),
    );
  });

  it('should not cancel a PAID invoice', async () => {
    mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'inv1', status: 'PAID' });

    await expect(
      service.cancel('t1', 'inv1', 'Test', 'user1'),
    ).rejects.toThrow();
  });
});
