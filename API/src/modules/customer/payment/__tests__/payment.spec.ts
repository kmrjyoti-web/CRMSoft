import { PaymentService } from '../services/payment.service';

const mockPrisma = {
  invoice: { findFirst: jest.fn() },
  payment: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  refund: { updateMany: jest.fn() },
} as any;

const mockAutoNumber = { next: jest.fn() } as any;
const mockGatewayFactory = {
  createOrder: jest.fn(),
  verifyPayment: jest.fn(),
} as any;
const mockInvoiceService = { recalculateBalance: jest.fn() } as any;

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentService(
      mockPrisma,
      mockAutoNumber,
      mockGatewayFactory,
      mockInvoiceService,
    );
  });

  it('should record manual payment', async () => {
    mockPrisma.invoice.findFirst.mockResolvedValue({
      id: 'inv1', invoiceNo: 'INV-001', status: 'SENT', balanceAmount: 1000,
    });
    mockAutoNumber.next.mockResolvedValue('PAY-2026-00001');
    mockPrisma.payment.create.mockResolvedValue({
      id: 'p1', paymentNo: 'PAY-2026-00001', amount: 500, status: 'CAPTURED',
    });

    const result = await service.recordPayment('t1', {
      invoiceId: 'inv1',
      amount: 500,
      method: 'CASH',
    }, 'user1');

    expect(mockPrisma.payment.create).toHaveBeenCalled();
    expect(mockInvoiceService.recalculateBalance).toHaveBeenCalledWith('inv1');
  });

  it('should reject payment exceeding balance', async () => {
    mockPrisma.invoice.findFirst.mockResolvedValue({
      id: 'inv1', status: 'SENT', balanceAmount: 500,
    });

    await expect(
      service.recordPayment('t1', {
        invoiceId: 'inv1', amount: 600, method: 'CASH',
      }, 'user1'),
    ).rejects.toThrow();
  });

  it('should reject payment for cancelled invoice', async () => {
    mockPrisma.invoice.findFirst.mockResolvedValue({
      id: 'inv1', status: 'CANCELLED', balanceAmount: 1000,
    });

    await expect(
      service.recordPayment('t1', {
        invoiceId: 'inv1', amount: 500, method: 'CASH',
      }, 'user1'),
    ).rejects.toThrow();
  });

  it('should create gateway order', async () => {
    mockPrisma.invoice.findFirst.mockResolvedValue({
      id: 'inv1', status: 'SENT', balanceAmount: 1000,
    });
    mockAutoNumber.next.mockResolvedValue('PAY-2026-00002');
    mockGatewayFactory.createOrder.mockResolvedValue({
      orderId: 'order_123', amount: 500, currency: 'INR', gateway: 'RAZORPAY',
      meta: { keyId: 'rzp_key' },
    });
    mockPrisma.payment.create.mockResolvedValue({ id: 'p2', status: 'PENDING' });

    const result = await service.createGatewayOrder('t1', {
      invoiceId: 'inv1', amount: 500, gateway: 'RAZORPAY',
    }, 'user1');

    expect(result.gatewayOrder.orderId).toBe('order_123');
    expect(mockGatewayFactory.createOrder).toHaveBeenCalled();
  });

  it('should verify and capture gateway payment', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'p1', invoiceId: 'inv1', gateway: 'RAZORPAY', status: 'PENDING', paymentNo: 'PAY-001',
    });
    mockGatewayFactory.verifyPayment.mockResolvedValue({
      verified: true, paymentId: 'pay_123', orderId: 'order_123',
    });
    mockPrisma.payment.update.mockResolvedValue({ id: 'p1', status: 'CAPTURED' });

    const result = await service.verifyGatewayPayment('t1', {
      gatewayOrderId: 'order_123',
      gatewayPaymentId: 'pay_123',
      gatewaySignature: 'sig_abc',
    });

    expect(mockPrisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CAPTURED' }),
      }),
    );
    expect(mockInvoiceService.recalculateBalance).toHaveBeenCalledWith('inv1');
  });

  it('should fail verification on invalid signature', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'p1', invoiceId: 'inv1', gateway: 'RAZORPAY', status: 'PENDING',
    });
    mockGatewayFactory.verifyPayment.mockResolvedValue({
      verified: false, paymentId: 'pay_123', orderId: 'order_123',
    });
    mockPrisma.payment.update.mockResolvedValue({});

    await expect(
      service.verifyGatewayPayment('t1', {
        gatewayOrderId: 'order_123',
        gatewayPaymentId: 'pay_123',
        gatewaySignature: 'bad_sig',
      }),
    ).rejects.toThrow();
  });
});
