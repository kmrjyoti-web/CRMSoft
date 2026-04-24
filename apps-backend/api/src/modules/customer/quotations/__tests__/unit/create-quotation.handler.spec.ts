import { CreateQuotationHandler } from '../../application/commands/create-quotation/create-quotation.handler';
import { QuotationNumberService } from '../../services/quotation-number.service';
import { QuotationCalculatorService } from '../../services/quotation-calculator.service';
import { NotFoundException } from '@nestjs/common';

describe('CreateQuotationHandler', () => {
  let handler: CreateQuotationHandler;
  let prisma: any;
  let numberService: any;
  let calculator: any;

  beforeEach(() => {
    prisma = {
      lead: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'lead-1', organization: { id: 'org-1', state: 'Maharashtra' },
        }),
        findUnique: jest.fn().mockResolvedValue({
          id: 'lead-1', organization: { id: 'org-1', state: 'Maharashtra' },
        }),
      },
      product: {
        findFirst: jest.fn().mockResolvedValue({
          code: 'PRD-001', hsnCode: '8471', gstRate: 18, mrp: 50000,
        }),
        findUnique: jest.fn().mockResolvedValue({
          code: 'PRD-001', hsnCode: '8471', gstRate: 18, mrp: 50000,
        }),
      },
      quotation: {
        create: jest.fn().mockResolvedValue({
          id: 'q-1', quotationNo: 'QTN-2026-00001', status: 'DRAFT',
          lineItems: [{ id: 'li-1', productName: 'CRM License', lineTotal: 45000 }],
          lead: { id: 'lead-1' },
        }),
        findFirst: jest.fn().mockResolvedValue({
          id: 'q-1', quotationNo: 'QTN-2026-00001', totalAmount: 53100,
          lineItems: [{ id: 'li-1' }], lead: { id: 'lead-1' },
        }),
        findUnique: jest.fn().mockResolvedValue({
          id: 'q-1', quotationNo: 'QTN-2026-00001', totalAmount: 53100,
          lineItems: [{ id: 'li-1' }], lead: { id: 'lead-1' },
        }),
      },
      quotationActivity: { create: jest.fn().mockResolvedValue({}) },
    };
(prisma as any).working = prisma;

    numberService = { generateNumber: jest.fn().mockResolvedValue('QTN-2026-00001') };
    calculator = {
      isInterState: jest.fn().mockReturnValue(false),
      calculateLineItem: jest.fn().mockReturnValue({
        discountAmount: 0, lineTotal: 45000, cgstAmount: 4050, sgstAmount: 4050,
        igstAmount: 0, cessAmount: 0, taxAmount: 8100, totalWithTax: 53100,
      }),
      recalculate: jest.fn().mockResolvedValue({ totalAmount: 53100 }),
    };

    handler = new CreateQuotationHandler(prisma, numberService, calculator);
  });

  it('should create quotation with line items and auto-calculate totals', async () => {
    const result = await handler.execute({
      userId: 'user-1', userName: 'Raj Patel', leadId: 'lead-1',
      items: [{ productId: 'prod-1', productName: 'CRM License', quantity: 1, unitPrice: 45000 }],
    } as any);
    expect(prisma.quotation.create).toHaveBeenCalled();
    expect(calculator.recalculate).toHaveBeenCalledWith('q-1', 'Maharashtra', undefined);
    expect(result!.quotationNo).toBe('QTN-2026-00001');
  });

  it('should auto-generate quotation number QTN-YYYY-NNNNN', async () => {
    await handler.execute({ userId: 'user-1', userName: 'Raj', leadId: 'lead-1', items: [] } as any);
    expect(numberService.generateNumber).toHaveBeenCalled();
  });

  it('should fetch product details when productId provided', async () => {
    await handler.execute({
      userId: 'user-1', userName: 'Raj', leadId: 'lead-1',
      items: [{ productId: 'prod-1', productName: 'CRM', quantity: 1, unitPrice: 45000 }],
    } as any);
    expect(prisma.product.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: 'prod-1' }) }));
  });

  it('should validate lead exists', async () => {
    prisma.lead.findFirst.mockResolvedValue(null);
    await expect(handler.execute({ userId: 'u', userName: 'U', leadId: 'bad' } as any)).rejects.toThrow(NotFoundException);
  });

  it('should calculate GST correctly — intra-state CGST+SGST', async () => {
    await handler.execute({
      userId: 'user-1', userName: 'Raj', leadId: 'lead-1',
      items: [{ productName: 'Test', quantity: 1, unitPrice: 10000, gstRate: 18 }],
    } as any);
    expect(calculator.calculateLineItem).toHaveBeenCalledWith(
      expect.objectContaining({ gstRate: 18 }),
      false, // intra-state
    );
  });
});
