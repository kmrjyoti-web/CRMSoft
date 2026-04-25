import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { AuditService } from '../audit/audit.service';
import { createHmac } from 'crypto';

const mockPrisma = {
  webhookEvent: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

const mockBilling = { markPaid: jest.fn() };
const mockAudit = { log: jest.fn() };

describe('WebhooksService', () => {
  let service: WebhooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: BillingService, useValue: mockBilling },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get(WebhooksService);
    jest.clearAllMocks();
  });

  describe('verifyRazorpaySignature', () => {
    it('should return true for valid signature', () => {
      const secret = 'test-secret';
      process.env.RAZORPAY_WEBHOOK_SECRET = secret;
      const body = Buffer.from('{"event":"payment.captured"}');
      const sig = createHmac('sha256', secret).update(body).digest('hex');
      expect(service.verifyRazorpaySignature(body, sig)).toBe(true);
    });

    it('should return false for tampered body', () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = 'secret';
      const body = Buffer.from('{"event":"payment.captured"}');
      expect(service.verifyRazorpaySignature(body, 'invalid-sig')).toBe(false);
    });

    it('should return false when secret not configured', () => {
      delete process.env.RAZORPAY_WEBHOOK_SECRET;
      const body = Buffer.from('{}');
      expect(service.verifyRazorpaySignature(body, 'any')).toBe(false);
    });
  });

  describe('handleRazorpayEvent', () => {
    it('should process payment.captured and mark invoice paid', async () => {
      const secret = 'wh-secret';
      process.env.RAZORPAY_WEBHOOK_SECRET = secret;
      const payload = {
        event: 'payment.captured',
        payload: { payment: { entity: { id: 'pay_123', notes: { invoiceId: 'inv-uuid' } } } },
      };
      const rawBody = Buffer.from(JSON.stringify(payload));
      const sig = createHmac('sha256', secret).update(rawBody).digest('hex');

      mockPrisma.webhookEvent.create.mockResolvedValue({ id: 'evt-1' });
      mockPrisma.webhookEvent.update.mockResolvedValue({});
      mockBilling.markPaid.mockResolvedValue({});
      mockAudit.log.mockResolvedValue({});

      await service.handleRazorpayEvent(rawBody, sig);

      expect(mockBilling.markPaid).toHaveBeenCalledWith('inv-uuid', 'pay_123');
      expect(mockPrisma.webhookEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ processingStatus: 'PROCESSED' }) }),
      );
    });

    it('should fail with invalid signature', async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = 'secret';
      const rawBody = Buffer.from('{}');
      mockPrisma.webhookEvent.create.mockResolvedValue({ id: 'evt-bad' });
      mockPrisma.webhookEvent.update.mockResolvedValue({});

      await expect(service.handleRazorpayEvent(rawBody, 'bad-sig')).rejects.toThrow('Invalid webhook signature');
      expect(mockPrisma.webhookEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ processingStatus: 'FAILED' }) }),
      );
    });
  });

  describe('getDashboard', () => {
    it('should return webhook stats', async () => {
      mockPrisma.webhookEvent.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80)  // processed
        .mockResolvedValueOnce(10)  // failed
        .mockResolvedValueOnce(10)  // pending
        .mockResolvedValueOnce(15); // last24h

      const result = await service.getDashboard();

      expect(result.total).toBe(100);
      expect(result.successRate).toBe(80);
      expect(result.failed).toBe(10);
    });
  });
});
