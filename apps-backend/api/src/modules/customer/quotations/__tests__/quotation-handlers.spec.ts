/**
 * Unit tests for quotation command and query handlers.
 *
 * Covers: accept, add-line-item, cancel, clone, log-negotiation, mark-viewed,
 *         recalculate-totals, reject, remove-line-item, revise, send, update,
 *         list-quotations, get-quotation-by-id
 *
 * Includes GST test: intra-state → CGST+SGST, inter-state → IGST.
 *
 * Pattern: direct instantiation, mock Prisma, no NestJS TestingModule.
 */

import { NotFoundException, BadRequestException } from '@nestjs/common';

// Command handlers
import { AcceptQuotationHandler } from '../application/commands/accept-quotation/accept-quotation.handler';
import { AcceptQuotationCommand } from '../application/commands/accept-quotation/accept-quotation.command';

import { AddLineItemHandler } from '../application/commands/add-line-item/add-line-item.handler';
import { AddLineItemCommand } from '../application/commands/add-line-item/add-line-item.command';

import { CancelQuotationHandler } from '../application/commands/cancel-quotation/cancel-quotation.handler';
import { CancelQuotationCommand } from '../application/commands/cancel-quotation/cancel-quotation.command';

import { CloneQuotationHandler } from '../application/commands/clone-quotation/clone-quotation.handler';
import { CloneQuotationCommand } from '../application/commands/clone-quotation/clone-quotation.command';

import { LogNegotiationHandler } from '../application/commands/log-negotiation/log-negotiation.handler';
import { LogNegotiationCommand } from '../application/commands/log-negotiation/log-negotiation.command';

import { MarkViewedHandler } from '../application/commands/mark-viewed/mark-viewed.handler';
import { MarkViewedCommand } from '../application/commands/mark-viewed/mark-viewed.command';

import { RecalculateTotalsHandler } from '../application/commands/recalculate-totals/recalculate-totals.handler';
import { RecalculateTotalsCommand } from '../application/commands/recalculate-totals/recalculate-totals.command';

import { RejectQuotationHandler } from '../application/commands/reject-quotation/reject-quotation.handler';
import { RejectQuotationCommand } from '../application/commands/reject-quotation/reject-quotation.command';

import { RemoveLineItemHandler } from '../application/commands/remove-line-item/remove-line-item.handler';
import { RemoveLineItemCommand } from '../application/commands/remove-line-item/remove-line-item.command';

import { ReviseQuotationHandler } from '../application/commands/revise-quotation/revise-quotation.handler';
import { ReviseQuotationCommand } from '../application/commands/revise-quotation/revise-quotation.command';

import { SendQuotationHandler } from '../application/commands/send-quotation/send-quotation.handler';
import { SendQuotationCommand } from '../application/commands/send-quotation/send-quotation.command';

import { UpdateQuotationHandler } from '../application/commands/update-quotation/update-quotation.handler';
import { UpdateQuotationCommand } from '../application/commands/update-quotation/update-quotation.command';

// Query handlers
import { ListQuotationsHandler } from '../application/queries/list-quotations/list-quotations.handler';
import { ListQuotationsQuery } from '../application/queries/list-quotations/list-quotations.query';

import { GetQuotationByIdHandler } from '../application/queries/get-quotation-by-id/get-quotation-by-id.handler';
import { GetQuotationByIdQuery } from '../application/queries/get-quotation-by-id/get-quotation-by-id.query';

// Calculator (for GST test)
import { QuotationCalculatorService } from '../services/quotation-calculator.service';

// ---------------------------------------------------------------------------
// Shared mock factory
// ---------------------------------------------------------------------------

function makeQuotation(overrides: Partial<any> = {}) {
  return {
    id: 'q-1',
    quotationNo: 'QTN-2026-00001',
    status: 'DRAFT',
    version: 1,
    title: 'CRM License Proposal',
    leadId: 'lead-1',
    organizationId: 'org-1',
    createdById: 'user-1',
    totalAmount: 53100,
    subtotal: 45000,
    discountType: null,
    discountValue: 0,
    discountAmount: 0,
    taxableAmount: 45000,
    cgstAmount: 4050,
    sgstAmount: 4050,
    igstAmount: 0,
    cessAmount: 0,
    totalTax: 8100,
    roundOff: 0,
    priceType: 'FIXED',
    minAmount: null,
    maxAmount: null,
    plusMinusPercent: null,
    tags: [],
    lineItems: [],
    lead: {
      id: 'lead-1',
      organization: { id: 'org-1', state: 'Maharashtra', name: 'Acme Corp' },
      contact: { id: 'c-1', firstName: 'Rahul', lastName: 'Sharma' },
    },
    contactPerson: null,
    ...overrides,
  };
}

function makePrisma(quotationOverrides: Partial<any> = {}) {
  const quotation = makeQuotation(quotationOverrides);

  const prisma: any = {
    quotation: {
      findUnique: jest.fn().mockResolvedValue(quotation),
      findFirst: jest.fn().mockResolvedValue(quotation),
      findMany: jest.fn().mockResolvedValue([quotation]),
      create: jest.fn().mockResolvedValue(quotation),
      update: jest.fn().mockResolvedValue(quotation),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      count: jest.fn().mockResolvedValue(1),
    },
    quotationLineItem: {
      create: jest.fn().mockResolvedValue({ id: 'li-1', productName: 'CRM License' }),
      findUnique: jest.fn().mockResolvedValue({ id: 'li-1', quotationId: 'q-1', productName: 'CRM License' }),
      delete: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    quotationActivity: {
      create: jest.fn().mockResolvedValue({}),
    },
    quotationSendLog: {
      create: jest.fn().mockResolvedValue({ id: 'log-1' }),
      findFirst: jest.fn().mockResolvedValue({ id: 'log-1' }),
      update: jest.fn().mockResolvedValue({}),
    },
    quotationNegotiationLog: {
      create: jest.fn().mockResolvedValue({ id: 'neg-1' }),
    },
    contact: {
      findUnique: jest.fn().mockResolvedValue({ id: 'c-1', firstName: 'Rahul', lastName: 'Sharma' }),
    },
    product: {
      findUnique: jest.fn().mockResolvedValue({ name: 'CRM License', code: 'CRM-001', hsnCode: '8471', gstRate: 18, mrp: 50000, salePrice: 45000 }),
      findFirst: jest.fn().mockResolvedValue({ code: 'CRM-001', hsnCode: '8471', gstRate: 18, mrp: 50000 }),
    },
  };

  prisma.working = prisma;
  return prisma;
}

function makeCalculator(interState = false) {
  return {
    isInterState: jest.fn().mockReturnValue(interState),
    calculateLineItem: jest.fn().mockReturnValue({
      discountAmount: 0, lineTotal: 45000,
      cgstAmount: interState ? 0 : 4050,
      sgstAmount: interState ? 0 : 4050,
      igstAmount: interState ? 8100 : 0,
      cessAmount: 0, taxAmount: 8100, totalWithTax: 53100,
    }),
    recalculate: jest.fn().mockResolvedValue({ totalAmount: 53100 }),
  };
}

// ---------------------------------------------------------------------------
// AcceptQuotationHandler
// ---------------------------------------------------------------------------
describe('AcceptQuotationHandler', () => {
  let handler: AcceptQuotationHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = makePrisma({ status: 'SENT' });
    handler = new AcceptQuotationHandler(prisma);
  });

  it('should accept a SENT quotation', async () => {
    const result = await handler.execute(new AcceptQuotationCommand('q-1', 'user-1', 'Raj Patel', 'Looks good'));
    expect(prisma.quotation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'ACCEPTED' }) }),
    );
    expect(result).toBeDefined();
  });

  it('should accept a NEGOTIATION quotation', async () => {
    prisma.quotation.findUnique.mockResolvedValue(makeQuotation({ status: 'NEGOTIATION' }));
    await handler.execute(new AcceptQuotationCommand('q-1', 'user-1', 'Raj'));
    expect(prisma.quotation.update).toHaveBeenCalled();
  });

  it('should throw NotFoundException when quotation not found', async () => {
    prisma.quotation.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new AcceptQuotationCommand('missing', 'u', 'U')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for DRAFT quotation', async () => {
    prisma.quotation.findUnique.mockResolvedValue(makeQuotation({ status: 'DRAFT' }));
    await expect(handler.execute(new AcceptQuotationCommand('q-1', 'u', 'U')))
      .rejects.toThrow(BadRequestException);
  });

  it('should log activity after accepting', async () => {
    await handler.execute(new AcceptQuotationCommand('q-1', 'user-1', 'Raj'));
    expect(prisma.quotationActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'ACCEPTED' }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// CancelQuotationHandler
// ---------------------------------------------------------------------------
describe('CancelQuotationHandler', () => {
  let handler: CancelQuotationHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = makePrisma({ status: 'DRAFT' });
    handler = new CancelQuotationHandler(prisma);
  });

  it('should cancel a DRAFT quotation', async () => {
    const result = await handler.execute(
      new (CancelQuotationCommand as any)('q-1', 'user-1', 'Raj', 'No longer needed'),
    );
    expect(result).toEqual({ cancelled: true });
    expect(prisma.quotation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'CANCELLED' }) }),
    );
  });

  it('should throw NotFoundException when quotation not found', async () => {
    prisma.quotation.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new (CancelQuotationCommand as any)('missing', 'u', 'U')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for already CANCELLED quotation', async () => {
    prisma.quotation.findUnique.mockResolvedValue(makeQuotation({ status: 'CANCELLED' }));
    await expect(
      handler.execute(new (CancelQuotationCommand as any)('q-1', 'u', 'U')),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for ACCEPTED quotation', async () => {
    prisma.quotation.findUnique.mockResolvedValue(makeQuotation({ status: 'ACCEPTED' }));
    await expect(
      handler.execute(new (CancelQuotationCommand as any)('q-1', 'u', 'U')),
    ).rejects.toThrow(BadRequestException);
  });
});

// ---------------------------------------------------------------------------
// RejectQuotationHandler
// ---------------------------------------------------------------------------
describe('RejectQuotationHandler', () => {
  let handler: RejectQuotationHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = makePrisma({ status: 'SENT' });
    handler = new RejectQuotationHandler(prisma);
  });

  it('should reject a SENT quotation', async () => {
    await handler.execute(new (RejectQuotationCommand as any)('q-1', 'user-1', 'Raj', 'Too expensive'));
    expect(prisma.quotation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'REJECTED' }) }),
    );
  });

  it('should throw NotFoundException when quotation not found', async () => {
    prisma.quotation.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new (RejectQuotationCommand as any)('missing', 'u', 'U')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for DRAFT status', async () => {
    prisma.quotation.findUnique.mockResolvedValue(makeQuotation({ status: 'DRAFT' }));
    await expect(
      handler.execute(new (RejectQuotationCommand as any)('q-1', 'u', 'U')),
    ).rejects.toThrow(BadRequestException);
  });
});

// ---------------------------------------------------------------------------
// SendQuotationHandler
// ---------------------------------------------------------------------------
describe('SendQuotationHandler', () => {
  let handler: SendQuotationHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = makePrisma({ status: 'DRAFT' });
    handler = new SendQuotationHandler(prisma);
  });

  it('should send a DRAFT quotation via EMAIL', async () => {
    const result = await handler.execute(
      new SendQuotationCommand('q-1', 'user-1', 'Raj', 'EMAIL', undefined, 'customer@example.com'),
    );
    expect(result).toBeDefined();
    expect(prisma.quotation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'SENT' }) }),
    );
    expect(prisma.quotationSendLog.create).toHaveBeenCalled();
  });

  it('should throw NotFoundException when quotation not found', async () => {
    prisma.quotation.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new SendQuotationCommand('missing', 'u', 'U', 'EMAIL')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for already SENT quotation', async () => {
    prisma.quotation.findUnique.mockResolvedValue(makeQuotation({ status: 'SENT' }));
    await expect(
      handler.execute(new SendQuotationCommand('q-1', 'u', 'U', 'EMAIL')),
    ).rejects.toThrow(BadRequestException);
  });

  it('should resolve receiver name from contactId', async () => {
    await handler.execute(
      new SendQuotationCommand('q-1', 'user-1', 'Raj', 'EMAIL', 'c-1'),
    );
    expect(prisma.contact.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'c-1' } }),
    );
  });
});

// ---------------------------------------------------------------------------
// CloneQuotationHandler
// ---------------------------------------------------------------------------
describe('CloneQuotationHandler', () => {
  let handler: CloneQuotationHandler;
  let prisma: any;
  let numberService: any;

  beforeEach(() => {
    prisma = makePrisma({ lineItems: [{ id: 'li-1', productName: 'CRM License' }] });
    numberService = { generateNumber: jest.fn().mockResolvedValue('QTN-2026-00002') };
    handler = new CloneQuotationHandler(prisma, numberService);
  });

  it('should clone quotation with DRAFT status and new number', async () => {
    const result = await handler.execute(new (CloneQuotationCommand as any)('q-1', 'user-1', 'Raj'));
    expect(prisma.quotation.create).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should prefix title with "Copy of"', async () => {
    prisma.quotation.findUnique.mockResolvedValue(makeQuotation({ title: 'Original Proposal', lineItems: [] }));
    await handler.execute(new (CloneQuotationCommand as any)('q-1', 'user-1', 'Raj'));
    const createData = prisma.quotation.create.mock.calls[0][0].data;
    expect(createData.title).toBe('Copy of Original Proposal');
  });

  it('should override leadId when provided', async () => {
    await handler.execute(new (CloneQuotationCommand as any)('q-1', 'user-1', 'Raj', 'lead-2'));
    const createData = prisma.quotation.create.mock.calls[0][0].data;
    expect(createData.leadId).toBe('lead-2');
  });

  it('should throw NotFoundException when source quotation not found', async () => {
    prisma.quotation.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new (CloneQuotationCommand as any)('missing', 'u', 'U')),
    ).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// ReviseQuotationHandler
// ---------------------------------------------------------------------------
describe('ReviseQuotationHandler', () => {
  let handler: ReviseQuotationHandler;
  let prisma: any;
  let numberService: any;

  beforeEach(() => {
    prisma = makePrisma({ status: 'SENT', version: 1, lineItems: [] });
    numberService = {
      generateNumber: jest.fn().mockResolvedValue('QTN-2026-00001-R2'),
      generateRevisionNumber: jest.fn().mockReturnValue('QTN-2026-00001-R2'),
    };
    handler = new ReviseQuotationHandler(prisma, numberService);
  });

  it('should create revised quotation as DRAFT and mark old as REVISED', async () => {
    await handler.execute(new (ReviseQuotationCommand as any)('q-1', 'user-1', 'Raj'));
    expect(prisma.quotation.create).toHaveBeenCalled();
    expect(prisma.quotation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'REVISED' }) }),
    );
  });

  it('should throw NotFoundException when quotation not found', async () => {
    prisma.quotation.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new (ReviseQuotationCommand as any)('missing', 'u', 'U')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for DRAFT status', async () => {
    prisma.quotation.findUnique.mockResolvedValue(makeQuotation({ status: 'DRAFT', version: 1, lineItems: [] }));
    await expect(
      handler.execute(new (ReviseQuotationCommand as any)('q-1', 'u', 'U')),
    ).rejects.toThrow(BadRequestException);
  });

  it('should increment version number', async () => {
    await handler.execute(new (ReviseQuotationCommand as any)('q-1', 'user-1', 'Raj'));
    expect(numberService.generateRevisionNumber).toHaveBeenCalledWith(
      expect.any(String), // old quotation number
      2, // newVersion = old.version + 1
    );
  });
});

// ---------------------------------------------------------------------------
// UpdateQuotationHandler
// ---------------------------------------------------------------------------
describe('UpdateQuotationHandler', () => {
  let handler: UpdateQuotationHandler;
  let prisma: any;
  let calculator: any;

  beforeEach(() => {
    prisma = makePrisma({ status: 'DRAFT' });
    calculator = makeCalculator();
    handler = new UpdateQuotationHandler(prisma, calculator);
  });

  it('should update a DRAFT quotation', async () => {
    // UpdateQuotationCommand(id, userId, userName, title?, ...rest)
    const result = await handler.execute(
      new UpdateQuotationCommand('q-1', 'user-1', 'Raj', 'Updated Title'),
    );
    expect(prisma.quotation.update).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should throw NotFoundException when quotation not found', async () => {
    prisma.quotation.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new UpdateQuotationCommand('missing', 'u', 'U')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for SENT quotation', async () => {
    prisma.quotation.findUnique.mockResolvedValue(makeQuotation({ status: 'SENT' }));
    await expect(
      handler.execute(new UpdateQuotationCommand('q-1', 'u', 'U', 'New Title')),
    ).rejects.toThrow(BadRequestException);
  });

  it('should recalculate when discount changes', async () => {
    // UpdateQuotationCommand positional args: id, userId, userName, title, summary, coverNote,
    // priceType, minAmount, maxAmount, plusMinusPercent, validFrom, validUntil,
    // paymentTerms, deliveryTerms, warrantyTerms, termsConditions, discountType, discountValue
    const cmd = new UpdateQuotationCommand(
      'q-1', 'user-1', 'Raj',
      undefined, undefined, undefined, // title, summary, coverNote
      undefined, undefined, undefined, undefined, // priceType, minAmount, maxAmount, plusMinusPercent
      undefined, undefined, // validFrom, validUntil
      undefined, undefined, undefined, undefined, // paymentTerms, deliveryTerms, warrantyTerms, termsConditions
      'PERCENTAGE', 10, // discountType, discountValue
    );
    await handler.execute(cmd);
    expect(calculator.recalculate).toHaveBeenCalledWith('q-1', 'Maharashtra');
  });
});

// ---------------------------------------------------------------------------
// AddLineItemHandler — includes GST intra/inter-state test
// ---------------------------------------------------------------------------
describe('AddLineItemHandler', () => {
  let prisma: any;
  let intraPrisma: any;
  let interPrisma: any;
  let intraCalc: any;
  let interCalc: any;
  let intraHandler: AddLineItemHandler;
  let interHandler: AddLineItemHandler;

  beforeEach(() => {
    intraPrisma = makePrisma({ status: 'DRAFT' });
    intraCalc = makeCalculator(false); // intra-state: CGST + SGST
    intraHandler = new AddLineItemHandler(intraPrisma, intraCalc);

    interPrisma = makePrisma({
      status: 'DRAFT',
      lead: { id: 'lead-1', organization: { state: 'Karnataka' }, contact: null },
    });
    interCalc = makeCalculator(true); // inter-state: IGST
    interHandler = new AddLineItemHandler(interPrisma, interCalc);

    prisma = intraPrisma;
  });

  it('should add a line item to a DRAFT quotation', async () => {
    const result = await intraHandler.execute(
      new AddLineItemCommand('q-1', 'user-1', 'Raj', 'prod-1', 'CRM License', undefined, 1, 'PCS', 45000),
    );
    expect(result).toBeDefined();
    expect(intraPrisma.quotationLineItem.create).toHaveBeenCalled();
  });

  it('[GST] intra-state → should compute CGST+SGST (not IGST)', async () => {
    await intraHandler.execute(
      new AddLineItemCommand('q-1', 'user-1', 'Raj', undefined, 'Custom Item', undefined, 1, 'PCS', 10000, undefined, undefined, undefined, 18),
    );
    const calcCall = intraCalc.calculateLineItem.mock.calls[0];
    const interStateArg = calcCall[1];
    expect(interStateArg).toBe(false); // intra-state flag
    const calcResult = intraCalc.calculateLineItem.mock.results[0].value;
    expect(calcResult.cgstAmount).toBe(4050); // 9%
    expect(calcResult.sgstAmount).toBe(4050); // 9%
    expect(calcResult.igstAmount).toBe(0);
  });

  it('[GST] inter-state → should compute IGST (not CGST/SGST)', async () => {
    await interHandler.execute(
      new AddLineItemCommand('q-1', 'user-1', 'Raj', undefined, 'Custom Item', undefined, 1, 'PCS', 10000, undefined, undefined, undefined, 18),
    );
    const calcCall = interCalc.calculateLineItem.mock.calls[0];
    const interStateArg = calcCall[1];
    expect(interStateArg).toBe(true); // inter-state flag
    const calcResult = interCalc.calculateLineItem.mock.results[0].value;
    expect(calcResult.igstAmount).toBe(8100); // full 18%
    expect(calcResult.cgstAmount).toBe(0);
    expect(calcResult.sgstAmount).toBe(0);
  });

  it('should look up product details when productId provided', async () => {
    await intraHandler.execute(
      new AddLineItemCommand('q-1', 'user-1', 'Raj', 'prod-1'),
    );
    expect(intraPrisma.product.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'prod-1' } }),
    );
  });

  it('should throw NotFoundException when quotation not found', async () => {
    intraPrisma.quotation.findUnique.mockResolvedValue(null);
    await expect(
      intraHandler.execute(new AddLineItemCommand('missing', 'u', 'U')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for SENT quotation', async () => {
    intraPrisma.quotation.findUnique.mockResolvedValue(makeQuotation({ status: 'SENT', lead: { organization: null } }));
    await expect(
      intraHandler.execute(new AddLineItemCommand('q-1', 'u', 'U')),
    ).rejects.toThrow(BadRequestException);
  });

  it('should recalculate totals after adding item', async () => {
    await intraHandler.execute(new AddLineItemCommand('q-1', 'user-1', 'Raj'));
    expect(intraCalc.recalculate).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// RemoveLineItemHandler
// ---------------------------------------------------------------------------
describe('RemoveLineItemHandler', () => {
  let handler: RemoveLineItemHandler;
  let prisma: any;
  let calculator: any;

  beforeEach(() => {
    prisma = makePrisma({ status: 'DRAFT' });
    calculator = makeCalculator();
    handler = new RemoveLineItemHandler(prisma, calculator);
  });

  it('should remove a line item from a DRAFT quotation', async () => {
    const result = await handler.execute(
      new (RemoveLineItemCommand as any)('q-1', 'li-1', 'user-1', 'Raj'),
    );
    expect(result).toEqual({ removed: true });
    expect(prisma.quotationLineItem.delete).toHaveBeenCalledWith({ where: { id: 'li-1' } });
  });

  it('should throw NotFoundException when quotation not found', async () => {
    prisma.quotation.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new (RemoveLineItemCommand as any)('missing', 'li-1', 'u', 'U')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for SENT quotation', async () => {
    prisma.quotation.findUnique.mockResolvedValue(makeQuotation({ status: 'SENT', lead: { organization: null } }));
    await expect(
      handler.execute(new (RemoveLineItemCommand as any)('q-1', 'li-1', 'u', 'U')),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when line item not found', async () => {
    prisma.quotationLineItem.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new (RemoveLineItemCommand as any)('q-1', 'li-bad', 'u', 'U')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should recalculate totals after removing item', async () => {
    await handler.execute(new (RemoveLineItemCommand as any)('q-1', 'li-1', 'user-1', 'Raj'));
    expect(calculator.recalculate).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// RecalculateTotalsHandler
// ---------------------------------------------------------------------------
describe('RecalculateTotalsHandler', () => {
  let handler: RecalculateTotalsHandler;
  let prisma: any;
  let calculator: any;

  beforeEach(() => {
    prisma = makePrisma({
      lead: {
        id: 'lead-1',
        organization: { state: 'Maharashtra' },
      },
    });
    calculator = makeCalculator();
    handler = new RecalculateTotalsHandler(prisma, calculator);
  });

  it('should recalculate and return totals', async () => {
    const result = await handler.execute(
      new (RecalculateTotalsCommand as any)('q-1', 'user-1', 'Raj'),
    );
    expect(result).toEqual({ totalAmount: 53100 });
    expect(calculator.recalculate).toHaveBeenCalled();
  });

  it('should throw NotFoundException when quotation not found', async () => {
    prisma.quotation.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new (RecalculateTotalsCommand as any)('missing', 'u', 'U')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should log activity after recalculation', async () => {
    await handler.execute(new (RecalculateTotalsCommand as any)('q-1', 'user-1', 'Raj'));
    expect(prisma.quotationActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'RECALCULATED' }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// MarkViewedHandler
// ---------------------------------------------------------------------------
describe('MarkViewedHandler', () => {
  let handler: MarkViewedHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = makePrisma({ status: 'SENT' });
    handler = new MarkViewedHandler(prisma);
  });

  it('should mark SENT quotation as VIEWED', async () => {
    const result = await handler.execute(new (MarkViewedCommand as any)('q-1'));
    expect(result).toEqual({ viewed: true });
    expect(prisma.quotation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'VIEWED' } }),
    );
  });

  it('should not update status if quotation is already VIEWED', async () => {
    prisma.quotation.findUnique.mockResolvedValue(makeQuotation({ status: 'VIEWED' }));
    const result = await handler.execute(new (MarkViewedCommand as any)('q-1'));
    expect(result).toEqual({ viewed: true });
    // update should NOT have been called for status change
    expect(prisma.quotation.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when quotation not found', async () => {
    prisma.quotation.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new (MarkViewedCommand as any)('missing')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update specific sendLog view count when sendLogId provided', async () => {
    await handler.execute(new (MarkViewedCommand as any)('q-1', 'log-1'));
    expect(prisma.quotationSendLog.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'log-1' } }),
    );
  });

  it('should update latest sendLog when no sendLogId provided', async () => {
    await handler.execute(new (MarkViewedCommand as any)('q-1'));
    expect(prisma.quotationSendLog.findFirst).toHaveBeenCalled();
    expect(prisma.quotationSendLog.update).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// LogNegotiationHandler
// ---------------------------------------------------------------------------
describe('LogNegotiationHandler', () => {
  let handler: LogNegotiationHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = makePrisma({ status: 'SENT' });
    handler = new LogNegotiationHandler(prisma);
  });

  it('should log negotiation and move SENT quotation to NEGOTIATION', async () => {
    const result = await handler.execute(
      new LogNegotiationCommand('q-1', 'user-1', 'Raj', 'PRICE_NEGOTIATION', 'Need 10% off'),
    );
    expect(result).toBeDefined();
    expect(prisma.quotation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'NEGOTIATION' } }),
    );
    expect(prisma.quotationNegotiationLog.create).toHaveBeenCalled();
  });

  it('should log negotiation when already in NEGOTIATION status (no status update)', async () => {
    prisma.quotation.findUnique.mockResolvedValue(makeQuotation({ status: 'NEGOTIATION' }));
    await handler.execute(
      new LogNegotiationCommand('q-1', 'user-1', 'Raj', 'COUNTER_OFFER', 'Counter at 5%'),
    );
    // Status update should NOT be called because status is already NEGOTIATION
    expect(prisma.quotation.update).not.toHaveBeenCalled();
    expect(prisma.quotationNegotiationLog.create).toHaveBeenCalled();
  });

  it('should throw NotFoundException when quotation not found', async () => {
    prisma.quotation.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new LogNegotiationCommand('missing', 'u', 'U', 'PRICE_NEGOTIATION')),
    ).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// ListQuotationsHandler
// ---------------------------------------------------------------------------
describe('ListQuotationsHandler', () => {
  let handler: ListQuotationsHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new ListQuotationsHandler(prisma);
  });

  it('should return paginated list with defaults', async () => {
    // ListQuotationsQuery(page?, limit?, sortBy?, sortOrder?, search?, status?, leadId?, userId?, dateFrom?, dateTo?)
    const result = await handler.execute(new ListQuotationsQuery(1, 20));
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should filter by status', async () => {
    prisma.quotation.findMany.mockResolvedValue([]);
    prisma.quotation.count.mockResolvedValue(0);
    // positional: page, limit, sortBy, sortOrder, search, status
    await handler.execute(new ListQuotationsQuery(1, 20, 'createdAt', 'desc', undefined, 'DRAFT'));
    const where = prisma.quotation.findMany.mock.calls[0][0].where;
    expect(where.status).toBe('DRAFT');
  });

  it('should filter by leadId', async () => {
    prisma.quotation.findMany.mockResolvedValue([]);
    prisma.quotation.count.mockResolvedValue(0);
    // positional: page, limit, sortBy, sortOrder, search, status, leadId
    await handler.execute(new ListQuotationsQuery(1, 20, 'createdAt', 'desc', undefined, undefined, 'lead-1'));
    const where = prisma.quotation.findMany.mock.calls[0][0].where;
    expect(where.leadId).toBe('lead-1');
  });

  it('should filter by search (quotationNo / title)', async () => {
    prisma.quotation.findMany.mockResolvedValue([]);
    prisma.quotation.count.mockResolvedValue(0);
    // positional: page, limit, sortBy, sortOrder, search
    await handler.execute(new ListQuotationsQuery(1, 20, 'createdAt', 'desc', 'CRM'));
    const where = prisma.quotation.findMany.mock.calls[0][0].where;
    expect(where.OR).toBeDefined();
  });

  it('tenant isolation — userId scopes to createdById', async () => {
    prisma.quotation.findMany.mockResolvedValue([]);
    prisma.quotation.count.mockResolvedValue(0);
    // positional: page, limit, sortBy, sortOrder, search, status, leadId, userId
    await handler.execute(new ListQuotationsQuery(1, 20, 'createdAt', 'desc', undefined, undefined, undefined, 'user-tenant-A'));
    const where = prisma.quotation.findMany.mock.calls[0][0].where;
    expect(where.createdById).toBe('user-tenant-A');
  });

  it('should handle DB errors by re-throwing', async () => {
    prisma.quotation.findMany.mockRejectedValue(new Error('DB failure'));
    await expect(
      handler.execute(new ListQuotationsQuery(1, 20)),
    ).rejects.toThrow('DB failure');
  });
});

// ---------------------------------------------------------------------------
// GetQuotationByIdHandler
// ---------------------------------------------------------------------------
describe('GetQuotationByIdHandler', () => {
  let handler: GetQuotationByIdHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = makePrisma();
    // Override findUnique to include full nested data
    prisma.quotation.findUnique.mockResolvedValue({
      ...makeQuotation(),
      sendLogs: [],
      negotiations: [],
      activities: [],
      parentQuotation: null,
      revisions: [],
      createdByUser: { id: 'user-1', firstName: 'Raj', lastName: 'Patel' },
    });
    handler = new GetQuotationByIdHandler(prisma);
  });

  it('should return full quotation with nested data', async () => {
    const result = await handler.execute(new GetQuotationByIdQuery('q-1'));
    expect(result).toBeDefined();
    expect(result.id).toBe('q-1');
  });

  it('should throw NotFoundException when quotation not found', async () => {
    prisma.quotation.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new GetQuotationByIdQuery('missing')),
    ).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// QuotationCalculatorService — GST split validation
// ---------------------------------------------------------------------------
describe('QuotationCalculatorService — GST rules', () => {
  let calculator: QuotationCalculatorService;

  beforeEach(() => {
    const mockConfig = { get: jest.fn().mockReturnValue('Maharashtra') };
    calculator = new QuotationCalculatorService({} as any, mockConfig as any);
  });

  it('intra-state (Maharashtra→Maharashtra): CGST 9% + SGST 9%, IGST = 0', () => {
    const result = calculator.calculateLineItem(
      { quantity: 1, unitPrice: 10000, gstRate: 18 },
      false, // intra-state
    );
    expect(result.cgstAmount).toBe(900);
    expect(result.sgstAmount).toBe(900);
    expect(result.igstAmount).toBe(0);
    expect(result.taxAmount).toBe(1800);
  });

  it('inter-state (Maharashtra→Karnataka): IGST 18%, CGST = SGST = 0', () => {
    const result = calculator.calculateLineItem(
      { quantity: 1, unitPrice: 10000, gstRate: 18 },
      true, // inter-state
    );
    expect(result.igstAmount).toBe(1800);
    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);
    expect(result.taxAmount).toBe(1800);
  });

  it('isInterState correctly identifies same-state as intra', () => {
    expect(calculator.isInterState('Maharashtra')).toBe(false);
    expect(calculator.isInterState('maharashtra')).toBe(false); // case-insensitive
  });

  it('isInterState correctly identifies different-state as inter', () => {
    expect(calculator.isInterState('Gujarat')).toBe(true);
    expect(calculator.isInterState('Karnataka')).toBe(true);
    expect(calculator.isInterState('Delhi')).toBe(true);
  });

  it('GST 5% slab: intra-state CGST 2.5% + SGST 2.5%', () => {
    const result = calculator.calculateLineItem(
      { quantity: 1, unitPrice: 1000, gstRate: 5 },
      false,
    );
    expect(result.cgstAmount).toBe(25);
    expect(result.sgstAmount).toBe(25);
    expect(result.igstAmount).toBe(0);
  });

  it('GST 28% slab: inter-state full IGST', () => {
    const result = calculator.calculateLineItem(
      { quantity: 1, unitPrice: 1000, gstRate: 28 },
      true,
    );
    expect(result.igstAmount).toBe(280);
    expect(result.cgstAmount).toBe(0);
  });
});
