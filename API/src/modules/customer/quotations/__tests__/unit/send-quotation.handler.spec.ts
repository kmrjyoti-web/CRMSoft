import { SendQuotationHandler } from '../../application/commands/send-quotation/send-quotation.handler';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SendQuotationHandler', () => {
  let handler: SendQuotationHandler;
  let prisma: any;

  const mockQuotation = {
    id: 'q-1', quotationNo: 'QTN-2026-00001', status: 'DRAFT',
    totalAmount: 53100, priceType: 'FIXED', minAmount: null, maxAmount: null, plusMinusPercent: null,
    lead: { organization: { id: 'org-1', name: 'TechCorp' } },
  };

  beforeEach(() => {
    prisma = {
      quotation: {
        findUnique: jest.fn().mockResolvedValue(mockQuotation),
        update: jest.fn().mockResolvedValue({ ...mockQuotation, status: 'SENT' }),
      },
      contact: {
        findUnique: jest.fn().mockResolvedValue({ firstName: 'Raj', lastName: 'Patel' }),
      },
      quotationSendLog: {
        create: jest.fn().mockResolvedValue({ id: 'sl-1', quotationValue: 53100 }),
      },
      quotationActivity: { create: jest.fn().mockResolvedValue({}) },
    };
    handler = new SendQuotationHandler(prisma);
  });

  it('should send quotation and create SendLog', async () => {
    const result = await handler.execute({
      id: 'q-1', userId: 'user-1', userName: 'Raj Patel', channel: 'EMAIL',
      receiverContactId: 'c-1', receiverEmail: 'raj@test.com',
    } as any);
    expect(prisma.quotationSendLog.create).toHaveBeenCalled();
    expect(result.id).toBe('sl-1');
  });

  it('should snapshot quotation value at send time', async () => {
    await handler.execute({ id: 'q-1', userId: 'u-1', userName: 'U', channel: 'EMAIL' } as any);
    expect(prisma.quotationSendLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ quotationValue: 53100 }) }),
    );
  });

  it('should update status DRAFT → SENT', async () => {
    await handler.execute({ id: 'q-1', userId: 'u-1', userName: 'U', channel: 'EMAIL' } as any);
    expect(prisma.quotation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'SENT' } }),
    );
  });

  it('should not send already ACCEPTED quotation', async () => {
    prisma.quotation.findUnique.mockResolvedValue({ ...mockQuotation, status: 'ACCEPTED' });
    await expect(handler.execute({ id: 'q-1', userId: 'u-1', userName: 'U', channel: 'EMAIL' } as any))
      .rejects.toThrow(BadRequestException);
  });
});
