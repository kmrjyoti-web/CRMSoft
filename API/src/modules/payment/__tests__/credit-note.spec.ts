import { CreditNoteService } from '../services/credit-note.service';

const mockPrisma = {
  invoice: { findFirst: jest.fn() },
  creditNote: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
} as any;

const mockAutoNumber = { next: jest.fn() } as any;
const mockInvoiceService = { recalculateBalance: jest.fn() } as any;

describe('CreditNoteService', () => {
  let service: CreditNoteService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CreditNoteService(mockPrisma, mockAutoNumber, mockInvoiceService);
  });

  it('should create credit note', async () => {
    mockPrisma.invoice.findFirst.mockResolvedValue({
      id: 'inv1', invoiceNo: 'INV-001', totalAmount: 5000,
    });
    mockAutoNumber.next.mockResolvedValue('CN-2026/02-0001');
    mockPrisma.creditNote.create.mockResolvedValue({
      id: 'cn1', creditNoteNo: 'CN-2026/02-0001', amount: 500,
    });

    const result = await service.create('t1', {
      invoiceId: 'inv1', amount: 500, reason: 'Defective item',
    }, 'user1');

    expect(mockPrisma.creditNote.create).toHaveBeenCalled();
  });

  it('should reject credit note exceeding invoice amount', async () => {
    mockPrisma.invoice.findFirst.mockResolvedValue({
      id: 'inv1', totalAmount: 1000,
    });

    await expect(
      service.create('t1', {
        invoiceId: 'inv1', amount: 1500, reason: 'Too much',
      }, 'user1'),
    ).rejects.toThrow();
  });

  it('should apply credit note to target invoice', async () => {
    mockPrisma.creditNote.findFirst.mockResolvedValue({
      id: 'cn1', amount: 500, status: 'CN_ISSUED', creditNoteNo: 'CN-001',
    });
    mockPrisma.invoice.findFirst.mockResolvedValue({
      id: 'inv2', balanceAmount: 2000,
    });
    mockPrisma.creditNote.update.mockResolvedValue({ status: 'CN_APPLIED' });

    await service.apply('t1', 'cn1', { applyToInvoiceId: 'inv2' });

    expect(mockPrisma.creditNote.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'CN_APPLIED',
          appliedToInvoiceId: 'inv2',
          appliedAmount: 500,
        }),
      }),
    );
    expect(mockInvoiceService.recalculateBalance).toHaveBeenCalledWith('inv2');
  });

  it('should not apply already-applied credit note', async () => {
    mockPrisma.creditNote.findFirst.mockResolvedValue({
      id: 'cn1', status: 'CN_APPLIED',
    });

    await expect(
      service.apply('t1', 'cn1', { applyToInvoiceId: 'inv2' }),
    ).rejects.toThrow();
  });

  it('should issue credit note', async () => {
    mockPrisma.creditNote.findFirst.mockResolvedValue({ id: 'cn1', status: 'CN_DRAFT' });
    mockPrisma.creditNote.update.mockResolvedValue({ status: 'CN_ISSUED' });

    await service.issue('t1', 'cn1', 'user1');
    expect(mockPrisma.creditNote.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CN_ISSUED' }),
      }),
    );
  });
});
