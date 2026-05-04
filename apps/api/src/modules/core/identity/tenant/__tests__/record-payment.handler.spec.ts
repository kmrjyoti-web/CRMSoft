import { RecordPaymentHandler } from '../application/commands/record-payment/record-payment.handler';
import { RecordPaymentCommand } from '../application/commands/record-payment/record-payment.command';

const mockInvoice = {
  id: 'inv-1',
  status: 'PAID',
  paidAt: new Date('2026-01-15'),
  gatewayPaymentId: 'pay_rzp_123',
};

function makeHandler(overrides: Record<string, any> = {}) {
  const prisma: any = {
    identity: {
      tenantInvoice: {
        update: jest.fn().mockResolvedValue(overrides.invoice ?? mockInvoice),
      },
    },
  };
  return { handler: new RecordPaymentHandler(prisma), prisma };
}

describe('RecordPaymentHandler', () => {
  it('should mark invoice as PAID and set paidAt + gatewayPaymentId', async () => {
    const { handler, prisma } = makeHandler();

    const result = await handler.execute(
      new RecordPaymentCommand('tenant-1', 'inv-1', 'pay_rzp_123', 5000),
    );

    expect(prisma.identity.tenantInvoice.update).toHaveBeenCalledWith({
      where: { id: 'inv-1' },
      data: {
        status: 'PAID',
        paidAt: expect.any(Date),
        gatewayPaymentId: 'pay_rzp_123',
      },
    });
    expect(result).toMatchObject({ id: 'inv-1', status: 'PAID' });
  });

  it('should rethrow when invoice update fails', async () => {
    const prisma: any = {
      identity: {
        tenantInvoice: {
          update: jest.fn().mockRejectedValue(new Error('Invoice not found')),
        },
      },
    };
    const handler = new RecordPaymentHandler(prisma);

    await expect(
      handler.execute(new RecordPaymentCommand('tenant-1', 'missing-inv', 'pay_1', 100)),
    ).rejects.toThrow('Invoice not found');
  });

  it('should use invoiceId from command as the where clause', async () => {
    const { handler, prisma } = makeHandler();

    await handler.execute(new RecordPaymentCommand('tenant-1', 'inv-specific', 'pay_abc', 999));

    expect(prisma.identity.tenantInvoice.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'inv-specific' } }),
    );
  });

  it('should set the correct gatewayPaymentId on the invoice', async () => {
    const { handler, prisma } = makeHandler();

    await handler.execute(new RecordPaymentCommand('tenant-1', 'inv-1', 'pay_custom_id', 500));

    expect(prisma.identity.tenantInvoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ gatewayPaymentId: 'pay_custom_id' }),
      }),
    );
  });
});
