import { ReviseQuotationHandler } from '../../application/commands/revise-quotation/revise-quotation.handler';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReviseQuotationHandler', () => {
  let handler: ReviseQuotationHandler;
  let prisma: any;
  let numberService: any;

  const mockQuotation = {
    id: 'q-1', quotationNo: 'QTN-2026-00001', status: 'SENT', version: 1,
    title: 'Test', summary: null, coverNote: null,
    subtotal: 45000, discountType: null, discountValue: 0, discountAmount: 0,
    taxableAmount: 45000, cgstAmount: 4050, sgstAmount: 4050, igstAmount: 0,
    cessAmount: 0, totalTax: 8100, roundOff: 0, totalAmount: 53100,
    priceType: 'FIXED', minAmount: null, maxAmount: null, plusMinusPercent: null,
    validFrom: null, validUntil: null, paymentTerms: null, deliveryTerms: null,
    warrantyTerms: null, termsConditions: null,
    leadId: 'lead-1', contactPersonId: null, organizationId: null,
    tags: [], internalNotes: null,
    lineItems: [
      {
        productId: 'p-1', productCode: 'PRD-001', productName: 'CRM',
        description: null, hsnCode: '8471', quantity: 1, unit: 'PIECE',
        unitPrice: 45000, mrp: 50000, discountType: null, discountValue: null,
        discountAmount: 0, lineTotal: 45000, gstRate: 18,
        cgstAmount: 4050, sgstAmount: 4050, igstAmount: 0,
        cessRate: null, cessAmount: 0, taxAmount: 8100, totalWithTax: 53100,
        sortOrder: 0, notes: null, isOptional: false,
      },
    ],
  };

  beforeEach(() => {
    prisma = {
      quotation: {
        findUnique: jest.fn().mockResolvedValue(mockQuotation),
        create: jest.fn().mockResolvedValue({ id: 'q-2', quotationNo: 'QTN-2026-00001-R1', version: 2, status: 'DRAFT', lineItems: [], lead: {} }),
        update: jest.fn().mockResolvedValue({ ...mockQuotation, status: 'REVISED' }),
      },
      quotationActivity: { create: jest.fn().mockResolvedValue({}) },
    };
(prisma as any).working = prisma;
    numberService = { generateRevisionNumber: jest.fn().mockReturnValue('QTN-2026-00001-R1') };
    handler = new ReviseQuotationHandler(prisma, numberService);
  });

  it('should create new version with incremented version number', async () => {
    const result = await handler.execute({ id: 'q-1', userId: 'u-1', userName: 'Raj' } as any);
    expect(prisma.quotation.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ version: 2 }) }),
    );
    expect(result.version).toBe(2);
  });

  it('should link parentQuotationId correctly', async () => {
    await handler.execute({ id: 'q-1', userId: 'u-1', userName: 'Raj' } as any);
    expect(prisma.quotation.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ parentQuotationId: 'q-1' }) }),
    );
  });

  it('should move old quotation to REVISED status', async () => {
    await handler.execute({ id: 'q-1', userId: 'u-1', userName: 'Raj' } as any);
    expect(prisma.quotation.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'q-1' }, data: { status: 'REVISED' } }),
    );
  });

  it('should copy all line items to new quotation', async () => {
    await handler.execute({ id: 'q-1', userId: 'u-1', userName: 'Raj' } as any);
    const createCall = prisma.quotation.create.mock.calls[0][0];
    expect(createCall.data.lineItems.create).toHaveLength(1);
    expect(createCall.data.lineItems.create[0].productName).toBe('CRM');
  });
});
