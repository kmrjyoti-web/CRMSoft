import { PaymentGatewayFactoryService } from '../services/payment-gateway-factory.service';
import { RazorpayGatewayService } from '../services/razorpay-gateway.service';
import { StripeGatewayService } from '../services/stripe-gateway.service';

const mockRazorpayCreds = { keyId: 'rzp_key', keySecret: 'rzp_secret' };
const mockStripeCreds = { secretKey: 'sk_test_stripe' };

function makeFactory(overrides: Record<string, any> = {}) {
  const credential = 'credential' in overrides ? overrides.credential : {
    encryptedData: JSON.stringify(overrides.creds ?? mockRazorpayCreds),
    status: 'ACTIVE',
  };

  const prisma: any = {
    tenantCredential: {
      findFirst: jest.fn().mockResolvedValue(credential),
    },
  };
  prisma.working = prisma;

  const razorpay = {
    createOrder: jest.fn().mockResolvedValue(overrides.razorpayOrder ?? { orderId: 'rzp_order_1', gateway: 'RAZORPAY' }),
    verifySignature: jest.fn().mockReturnValue({ verified: true }),
    createRefund: jest.fn().mockResolvedValue({ refundId: 'rfnd_1', status: 'processed', amount: 100 }),
  } as unknown as RazorpayGatewayService;

  const stripe = {
    createOrder: jest.fn().mockResolvedValue({ orderId: 'pi_stripe_1', gateway: 'STRIPE' }),
    verifyPayment: jest.fn().mockResolvedValue({ verified: true }),
    createRefund: jest.fn().mockResolvedValue({ refundId: 're_stripe_1', status: 'succeeded', amount: 100 }),
  } as unknown as StripeGatewayService;

  const service = new PaymentGatewayFactoryService(prisma, razorpay, stripe);
  return { service, prisma, razorpay, stripe };
}

describe('PaymentGatewayFactoryService', () => {
  describe('getCredentials', () => {
    it('should return parsed credentials for RAZORPAY', async () => {
      const { service } = makeFactory({ creds: mockRazorpayCreds });

      const result = await service.getCredentials('tenant-1', 'RAZORPAY');

      expect(result).toEqual(mockRazorpayCreds);
    });

    it('should throw AppError when credentials not configured', async () => {
      const { service } = makeFactory({ credential: null });

      await expect(service.getCredentials('tenant-1', 'RAZORPAY')).rejects.toThrow();
    });

    it('should throw AppError when credentials JSON is malformed', async () => {
      const { service } = makeFactory({ credential: { encryptedData: 'INVALID_JSON', status: 'ACTIVE' } });

      await expect(service.getCredentials('tenant-1', 'RAZORPAY')).rejects.toThrow();
    });
  });

  describe('createOrder', () => {
    it('should route to Razorpay when gateway is RAZORPAY', async () => {
      const { service, razorpay } = makeFactory();

      const result = await service.createOrder('tenant-1', 'RAZORPAY', 500, 'INR', 'receipt-1');

      expect(razorpay.createOrder).toHaveBeenCalledWith(
        mockRazorpayCreds,
        50000, // 500 * 100 paise
        'INR',
        'receipt-1',
        {},
      );
      expect(result.gateway).toBe('RAZORPAY');
    });

    it('should route to Stripe when gateway is STRIPE', async () => {
      const stripeCreds = mockStripeCreds;
      const { service, stripe } = makeFactory({ creds: stripeCreds });

      const result = await service.createOrder('tenant-1', 'STRIPE', 500, 'INR', 'receipt-1');

      expect(stripe.createOrder).toHaveBeenCalledWith(
        stripeCreds,
        50000,
        'INR',
        {},
      );
      expect(result.gateway).toBe('STRIPE');
    });

    it('should convert amount to paise (multiply by 100)', async () => {
      const { service, razorpay } = makeFactory();

      await service.createOrder('tenant-1', 'RAZORPAY', 1234.5, 'INR', 'r1');

      expect(razorpay.createOrder).toHaveBeenCalledWith(
        expect.anything(),
        123450,
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });
  });

  describe('verifyPayment', () => {
    it('should route to Razorpay verifySignature', async () => {
      const { service, razorpay } = makeFactory();

      const result = await service.verifyPayment('tenant-1', 'RAZORPAY', 'order_1', 'pay_1', 'sig_1');

      expect(razorpay.verifySignature).toHaveBeenCalledWith(
        mockRazorpayCreds, 'order_1', 'pay_1', 'sig_1',
      );
      expect(result).toMatchObject({ verified: true });
    });

    it('should route to Stripe verifyPayment', async () => {
      const { service, stripe } = makeFactory({ creds: mockStripeCreds });

      const result = await service.verifyPayment('tenant-1', 'STRIPE', 'pi_1', 'pay_1', '');

      expect(stripe.verifyPayment).toHaveBeenCalledWith(mockStripeCreds, 'pi_1');
      expect(result).toMatchObject({ verified: true });
    });
  });

  describe('initiateRefund', () => {
    it('should route to Razorpay createRefund', async () => {
      const { service, razorpay } = makeFactory();

      const result = await service.initiateRefund('tenant-1', 'RAZORPAY', 'pay_1', 200, 'Defective');

      expect(razorpay.createRefund).toHaveBeenCalledWith(
        mockRazorpayCreds,
        'pay_1',
        20000,
        { reason: 'Defective' },
      );
      expect(result.refundId).toBe('rfnd_1');
    });

    it('should use default reason when none provided', async () => {
      const { service, razorpay } = makeFactory();

      await service.initiateRefund('tenant-1', 'RAZORPAY', 'pay_1', 100);

      expect(razorpay.createRefund).toHaveBeenCalledWith(
        expect.anything(),
        'pay_1',
        10000,
        { reason: 'Customer requested' },
      );
    });

    it('should route to Stripe createRefund', async () => {
      const { service, stripe } = makeFactory({ creds: mockStripeCreds });

      await service.initiateRefund('tenant-1', 'STRIPE', 'pay_1', 150, 'Return');

      expect(stripe.createRefund).toHaveBeenCalledWith(
        mockStripeCreds, 'pay_1', 15000, 'Return',
      );
    });
  });

  describe('tenant isolation', () => {
    it('should always filter credentials by tenantId', async () => {
      const { service, prisma } = makeFactory();

      await service.getCredentials('tenant-xyz', 'RAZORPAY');

      expect(prisma.tenantCredential.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-xyz' }),
        }),
      );
    });
  });
});
