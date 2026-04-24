import { createHmac } from 'crypto';
import { RazorpayGatewayService } from '../services/razorpay-gateway.service';

const creds = {
  keyId: 'rzp_test_key',
  keySecret: 'test_secret',
  webhookSecret: 'webhook_secret',
};

describe('RazorpayGatewayService', () => {
  let service: RazorpayGatewayService;

  beforeEach(() => {
    service = new RazorpayGatewayService();
  });

  describe('verifySignature', () => {
    it('should return verified=true for a valid signature', () => {
      const orderId = 'order_abc123';
      const paymentId = 'pay_xyz789';
      const signature = createHmac('sha256', creds.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const result = service.verifySignature(creds, orderId, paymentId, signature);

      expect(result.verified).toBe(true);
      expect(result.orderId).toBe(orderId);
      expect(result.paymentId).toBe(paymentId);
    });

    it('should return verified=false for an invalid signature', () => {
      const result = service.verifySignature(
        creds,
        'order_abc123',
        'pay_xyz789',
        'invalid_signature',
      );

      expect(result.verified).toBe(false);
    });

    it('should return verified=false when signature belongs to a different order', () => {
      const orderId = 'order_correct';
      const paymentId = 'pay_xyz';
      const signatureForWrongOrder = createHmac('sha256', creds.keySecret)
        .update(`order_wrong|${paymentId}`)
        .digest('hex');

      const result = service.verifySignature(creds, orderId, paymentId, signatureForWrongOrder);

      expect(result.verified).toBe(false);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should return true for a valid webhook signature', () => {
      const body = JSON.stringify({ event: 'payment.captured' });
      const signature = createHmac('sha256', creds.webhookSecret!)
        .update(body)
        .digest('hex');

      const result = service.verifyWebhookSignature(creds.webhookSecret!, body, signature);

      expect(result).toBe(true);
    });

    it('should return false for a tampered webhook body', () => {
      const originalBody = JSON.stringify({ event: 'payment.captured' });
      const tamperedBody = JSON.stringify({ event: 'payment.captured', amount: 99999 });
      const signature = createHmac('sha256', creds.webhookSecret!)
        .update(originalBody)
        .digest('hex');

      const result = service.verifyWebhookSignature(creds.webhookSecret!, tamperedBody, signature);

      expect(result).toBe(false);
    });

    it('should return false for a wrong webhook secret', () => {
      const body = JSON.stringify({ event: 'payment.captured' });
      const signature = createHmac('sha256', 'wrong_secret').update(body).digest('hex');

      const result = service.verifyWebhookSignature(creds.webhookSecret!, body, signature);

      expect(result).toBe(false);
    });
  });

  describe('createOrder', () => {
    afterEach(() => jest.restoreAllMocks());

    it('should create an order and return normalized result', async () => {
      const mockResponse = {
        id: 'order_razorpay_1',
        amount: 50000,
        currency: 'INR',
      };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await service.createOrder(creds, 50000, 'INR', 'receipt-1', {});

      expect(result.orderId).toBe('order_razorpay_1');
      expect(result.amount).toBe(500); // 50000 paise → 500 INR
      expect(result.currency).toBe('INR');
      expect(result.gateway).toBe('RAZORPAY');
    });

    it('should throw AppError when Razorpay returns non-ok response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('Bad Request'),
      } as any);

      await expect(
        service.createOrder(creds, 50000, 'INR', 'receipt-1'),
      ).rejects.toThrow();
    });
  });

  describe('createRefund', () => {
    afterEach(() => jest.restoreAllMocks());

    it('should create a refund and return normalized result', async () => {
      const mockRefund = {
        id: 'rfnd_abc',
        status: 'processed',
        amount: 20000,
      };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRefund),
      } as any);

      const result = await service.createRefund(creds, 'pay_xyz', 20000, {});

      expect(result.refundId).toBe('rfnd_abc');
      expect(result.status).toBe('processed');
      expect(result.amount).toBe(200); // 20000 paise → 200 INR
    });

    it('should throw AppError when refund API fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('Payment not found'),
      } as any);

      await expect(service.createRefund(creds, 'pay_xyz', 20000)).rejects.toThrow();
    });
  });
});
