import { ReceiptService } from '../services/receipt.service';

const mockPrisma = {
  payment: { findFirst: jest.fn() },
  paymentReceipt: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
} as any;

const mockAutoNumber = { next: jest.fn() } as any;
const mockAmountInWords = { convert: jest.fn() } as any;

describe('ReceiptService', () => {
  let service: ReceiptService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReceiptService(mockPrisma, mockAutoNumber, mockAmountInWords);
  });

  it('should generate receipt for a payment', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'p1', amount: 5000, method: 'CASH', paidAt: new Date(), notes: 'Test',
      invoice: { billingName: 'Customer Corp', invoiceNo: 'INV-001' },
      receipt: null,
    });
    mockAutoNumber.next.mockResolvedValue('RCT-2026-00001');
    mockAmountInWords.convert.mockReturnValue('Five Thousand Rupees Only');
    mockPrisma.paymentReceipt.create.mockResolvedValue({
      id: 'rcpt1', receiptNo: 'RCT-2026-00001', amount: 5000,
    });

    const result = await service.generateForPayment('t1', 'p1', 'user1');

    expect(mockPrisma.paymentReceipt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          receiptNo: 'RCT-2026-00001',
          amount: 5000,
          receivedFrom: 'Customer Corp',
          amountInWords: 'Five Thousand Rupees Only',
        }),
      }),
    );
  });

  it('should return existing receipt if already generated', async () => {
    const existingReceipt = { id: 'rcpt1', receiptNo: 'RCT-001' };
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'p1', receipt: existingReceipt,
      invoice: { billingName: 'Test' },
    });

    const result = await service.generateForPayment('t1', 'p1', 'user1');
    expect(result).toEqual(existingReceipt);
    expect(mockPrisma.paymentReceipt.create).not.toHaveBeenCalled();
  });

  it('should throw if payment not found', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue(null);

    await expect(
      service.generateForPayment('t1', 'nonexistent', 'user1'),
    ).rejects.toThrow();
  });
});
