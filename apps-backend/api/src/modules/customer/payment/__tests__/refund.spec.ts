import { RefundService } from '../services/refund.service';

const mockPrisma: any = {
  payment: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  refund: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};
(mockPrisma as any).working = mockPrisma;

const mockAutoNumber = { next: jest.fn() } as any;
const mockGatewayFactory = { initiateRefund: jest.fn() } as any;
const mockInvoiceService = { recalculateBalance: jest.fn() } as any;

describe('RefundService', () => {
  let service: RefundService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RefundService(
      mockPrisma,
      mockAutoNumber,
      mockGatewayFactory,
      mockInvoiceService,
    );
  });

  it('should create refund for manual payment', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'p1', amount: 1000, gateway: 'MANUAL', invoiceId: 'inv1',
      paymentNo: 'PAY-001', refunds: [],
    });
    mockAutoNumber.next.mockResolvedValue('RFD-2026-00001');
    mockPrisma.refund.create.mockResolvedValue({
      id: 'r1', refundNo: 'RFD-2026-00001', amount: 300, status: 'REFUND_PROCESSED',
    });
    mockPrisma.payment.update.mockResolvedValue({});

    const result = await service.create('t1', {
      paymentId: 'p1', amount: 300, reason: 'Partial return',
    }, 'user1');

    expect(mockPrisma.refund.create).toHaveBeenCalled();
    expect(mockInvoiceService.recalculateBalance).toHaveBeenCalledWith('inv1');
  });

  it('should reject refund exceeding payment amount', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'p1', amount: 500, gateway: 'MANUAL', invoiceId: 'inv1',
      refunds: [],
    });

    await expect(
      service.create('t1', {
        paymentId: 'p1', amount: 600, reason: 'Too much',
      }, 'user1'),
    ).rejects.toThrow();
  });

  it('should account for existing refunds when checking limit', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'p1', amount: 1000, gateway: 'MANUAL', invoiceId: 'inv1',
      refunds: [
        { amount: 400, status: 'REFUND_PROCESSED' },
        { amount: 300, status: 'REFUND_PENDING' },
      ],
    });

    await expect(
      service.create('t1', {
        paymentId: 'p1', amount: 400, reason: 'Exceeds available',
      }, 'user1'),
    ).rejects.toThrow();
  });

  it('should initiate gateway refund for online payment', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'p1', amount: 1000, gateway: 'RAZORPAY', gatewayPaymentId: 'pay_123',
      invoiceId: 'inv1', paymentNo: 'PAY-001', refunds: [],
    });
    mockAutoNumber.next.mockResolvedValue('RFD-2026-00002');
    mockGatewayFactory.initiateRefund.mockResolvedValue({
      refundId: 'rfnd_456', status: 'processed', amount: 500,
    });
    mockPrisma.refund.create.mockResolvedValue({});
    mockPrisma.payment.update.mockResolvedValue({});

    await service.create('t1', {
      paymentId: 'p1', amount: 500, reason: 'Customer request',
    }, 'user1');

    expect(mockGatewayFactory.initiateRefund).toHaveBeenCalledWith(
      't1', 'RAZORPAY', 'pay_123', 500, 'Customer request',
    );
  });
});
