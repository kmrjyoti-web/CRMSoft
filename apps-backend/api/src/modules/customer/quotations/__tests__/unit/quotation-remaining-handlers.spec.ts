/**
 * Unit tests for remaining quotation handlers not covered by quotation-handlers.spec.ts:
 * - UpdateLineItemHandler
 * - CreateFromTemplateHandler
 * - GetQuotationTimelineHandler
 * - GetQuotationVersionsHandler
 * - GetNegotiationHistoryHandler
 */
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { UpdateLineItemHandler } from '../../application/commands/update-line-item/update-line-item.handler';
import { UpdateLineItemCommand } from '../../application/commands/update-line-item/update-line-item.command';

import { CreateFromTemplateHandler } from '../../application/commands/create-from-template/create-from-template.handler';
import { CreateFromTemplateCommand } from '../../application/commands/create-from-template/create-from-template.command';

import { GetQuotationTimelineHandler } from '../../application/queries/get-quotation-timeline/get-quotation-timeline.handler';
import { GetQuotationTimelineQuery } from '../../application/queries/get-quotation-timeline/get-quotation-timeline.query';

import { GetQuotationVersionsHandler } from '../../application/queries/get-quotation-versions/get-quotation-versions.handler';
import { GetQuotationVersionsQuery } from '../../application/queries/get-quotation-versions/get-quotation-versions.query';

import { GetNegotiationHistoryHandler } from '../../application/queries/get-negotiation-history/get-negotiation-history.handler';
import { GetNegotiationHistoryQuery } from '../../application/queries/get-negotiation-history/get-negotiation-history.query';

// ─── Shared helpers ──────────────────────────────────────────────────────────

const mockCalc = {
  isInterState: jest.fn().mockReturnValue(false),
  calculateLineItem: jest.fn().mockReturnValue({
    discountAmount: 0, lineTotal: 1000, cgstAmount: 90, sgstAmount: 90,
    igstAmount: 0, cessAmount: 0, taxAmount: 180, totalWithTax: 1180,
  }),
  recalculate: jest.fn().mockResolvedValue({ totalAmount: 1180 }),
};

function makeDraftQuotation(overrides: any = {}) {
  return {
    id: 'q-1', status: 'DRAFT', tenantId: 't-1',
    lead: { organization: { state: 'Maharashtra' } },
    ...overrides,
  };
}

// ─── UpdateLineItemHandler ────────────────────────────────────────────────────

describe('UpdateLineItemHandler', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      working: {
        quotation: { findUnique: jest.fn().mockResolvedValue(makeDraftQuotation()) },
        quotationLineItem: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'item-1', quotationId: 'q-1',
            quantity: 2, unitPrice: 500, gstRate: 18,
            discountType: null, discountValue: null, cessRate: null,
            productName: 'Widget A',
          }),
          update: jest.fn().mockResolvedValue({ id: 'item-1', productName: 'Widget A Updated' }),
        },
        quotationActivity: { create: jest.fn() },
      },
    };
  });

  it('should update a line item on a DRAFT quotation', async () => {
    const handler = new UpdateLineItemHandler(prisma as any, mockCalc as any);
    const result = await handler.execute(
      new UpdateLineItemCommand('q-1', 'item-1', 'u-1', 'Admin', 'Widget A Updated', undefined, 3),
    );
    expect(result.id).toBe('item-1');
    expect(prisma.working.quotationLineItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'item-1' } }),
    );
    expect(mockCalc.recalculate).toHaveBeenCalledWith('q-1', 'Maharashtra');
  });

  it('should throw NotFoundException when quotation not found', async () => {
    prisma.working.quotation.findUnique.mockResolvedValue(null);
    const handler = new UpdateLineItemHandler(prisma as any, mockCalc as any);
    await expect(
      handler.execute(new UpdateLineItemCommand('q-999', 'item-1', 'u-1', 'Admin')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for SENT quotation', async () => {
    prisma.working.quotation.findUnique.mockResolvedValue(makeDraftQuotation({ status: 'SENT' }));
    const handler = new UpdateLineItemHandler(prisma as any, mockCalc as any);
    await expect(
      handler.execute(new UpdateLineItemCommand('q-1', 'item-1', 'u-1', 'Admin')),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when line item not found', async () => {
    prisma.working.quotationLineItem.findUnique.mockResolvedValue(null);
    const handler = new UpdateLineItemHandler(prisma as any, mockCalc as any);
    await expect(
      handler.execute(new UpdateLineItemCommand('q-1', 'item-999', 'u-1', 'Admin')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when line item belongs to different quotation', async () => {
    prisma.working.quotationLineItem.findUnique.mockResolvedValue({
      id: 'item-1', quotationId: 'q-OTHER',
    });
    const handler = new UpdateLineItemHandler(prisma as any, mockCalc as any);
    await expect(
      handler.execute(new UpdateLineItemCommand('q-1', 'item-1', 'u-1', 'Admin')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should log an activity after update', async () => {
    const handler = new UpdateLineItemHandler(prisma as any, mockCalc as any);
    await handler.execute(new UpdateLineItemCommand('q-1', 'item-1', 'u-1', 'Admin'));
    expect(prisma.working.quotationActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'ITEM_UPDATED', quotationId: 'q-1' }),
      }),
    );
  });
});

// ─── CreateFromTemplateHandler ────────────────────────────────────────────────

describe('CreateFromTemplateHandler', () => {
  let prisma: any;
  let numberService: any;

  beforeEach(() => {
    const mockTemplate = {
      id: 'tmpl-1', name: 'Standard Template',
      defaultItems: [],
      coverNote: null, defaultPayment: null, defaultDelivery: null,
      defaultWarranty: null, defaultTerms: null,
    };
    const mockLead = { id: 'lead-1', organization: { state: 'Karnataka' } };
    const mockCreatedQuotation = {
      id: 'q-new', quotationNo: 'QTN-2026-00001', status: 'DRAFT',
      lineItems: [], lead: mockLead,
    };

    prisma = {
      working: {
        quotationTemplate: {
          findUnique: jest.fn().mockResolvedValue(mockTemplate),
          update: jest.fn(),
        },
        lead: { findUnique: jest.fn().mockResolvedValue(mockLead) },
        quotation: {
          create: jest.fn().mockResolvedValue(mockCreatedQuotation),
          findUnique: jest.fn().mockResolvedValue(mockCreatedQuotation),
        },
        quotationActivity: { create: jest.fn() },
      },
    };
    numberService = { generateNumber: jest.fn().mockResolvedValue('QTN-2026-00001') };
  });

  it('should create a DRAFT quotation from template', async () => {
    const handler = new CreateFromTemplateHandler(prisma as any, numberService, mockCalc as any);
    const result = await handler.execute(
      new CreateFromTemplateCommand('tmpl-1', 'lead-1', 'u-1', 'Admin'),
    );
    expect(result!.status).toBe('DRAFT');
    expect(prisma.working.quotation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'DRAFT', leadId: 'lead-1' }),
      }),
    );
  });

  it('should throw NotFoundException when template not found', async () => {
    prisma.working.quotationTemplate.findUnique.mockResolvedValue(null);
    const handler = new CreateFromTemplateHandler(prisma as any, numberService, mockCalc as any);
    await expect(
      handler.execute(new CreateFromTemplateCommand('tmpl-999', 'lead-1', 'u-1', 'Admin')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when lead not found', async () => {
    prisma.working.lead.findUnique.mockResolvedValue(null);
    const handler = new CreateFromTemplateHandler(prisma as any, numberService, mockCalc as any);
    await expect(
      handler.execute(new CreateFromTemplateCommand('tmpl-1', 'lead-999', 'u-1', 'Admin')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should increment template usage count', async () => {
    const handler = new CreateFromTemplateHandler(prisma as any, numberService, mockCalc as any);
    await handler.execute(new CreateFromTemplateCommand('tmpl-1', 'lead-1', 'u-1', 'Admin'));
    expect(prisma.working.quotationTemplate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'tmpl-1' },
        data: { usageCount: { increment: 1 } },
      }),
    );
  });

  it('should log CREATED activity after creation', async () => {
    const handler = new CreateFromTemplateHandler(prisma as any, numberService, mockCalc as any);
    await handler.execute(new CreateFromTemplateCommand('tmpl-1', 'lead-1', 'u-1', 'Admin'));
    expect(prisma.working.quotationActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'CREATED', changedField: 'status' }),
      }),
    );
  });
});

// ─── GetQuotationTimelineHandler ──────────────────────────────────────────────

describe('GetQuotationTimelineHandler', () => {
  it('should return activities ordered by createdAt desc', async () => {
    const activities = [
      { id: 'a-2', action: 'SENT', createdAt: new Date('2026-04-17') },
      { id: 'a-1', action: 'CREATED', createdAt: new Date('2026-04-16') },
    ];
    const prisma = {
      working: {
        quotationActivity: { findMany: jest.fn().mockResolvedValue(activities) },
      },
    };
    const handler = new GetQuotationTimelineHandler(prisma as any);
    const result = await handler.execute(new GetQuotationTimelineQuery('q-1'));

    expect(result).toHaveLength(2);
    expect(prisma.working.quotationActivity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { quotationId: 'q-1' },
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('should return empty array when no activities exist', async () => {
    const prisma = {
      working: { quotationActivity: { findMany: jest.fn().mockResolvedValue([]) } },
    };
    const handler = new GetQuotationTimelineHandler(prisma as any);
    const result = await handler.execute(new GetQuotationTimelineQuery('q-empty'));
    expect(result).toEqual([]);
  });

  it('should propagate DB errors', async () => {
    const prisma = {
      working: { quotationActivity: { findMany: jest.fn().mockRejectedValue(new Error('DB down')) } },
    };
    const handler = new GetQuotationTimelineHandler(prisma as any);
    await expect(handler.execute(new GetQuotationTimelineQuery('q-1'))).rejects.toThrow('DB down');
  });
});

// ─── GetQuotationVersionsHandler ─────────────────────────────────────────────

describe('GetQuotationVersionsHandler', () => {
  it('should throw NotFoundException when quotation not found', async () => {
    const prisma = {
      working: { quotation: { findUnique: jest.fn().mockResolvedValue(null) } },
    };
    const handler = new GetQuotationVersionsHandler(prisma as any);
    await expect(handler.execute(new GetQuotationVersionsQuery('q-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should return version chain starting from root quotation', async () => {
    const rootQ = {
      id: 'q-root', parentQuotationId: null,
      quotationNo: 'QTN-2026-00001', version: 1, status: 'REVISED',
      totalAmount: 10000, createdAt: new Date('2026-04-01'),
      revisions: [
        {
          id: 'q-v2', quotationNo: 'QTN-2026-00001-R1', version: 2,
          status: 'DRAFT', totalAmount: 11000, createdAt: new Date('2026-04-10'),
        },
      ],
    };
    const prisma = {
      working: {
        quotation: {
          findUnique: jest.fn()
            .mockResolvedValueOnce({ id: 'q-root', parentQuotationId: null }) // initial lookup
            .mockResolvedValueOnce(rootQ), // collectVersions call
        },
      },
    };
    const handler = new GetQuotationVersionsHandler(prisma as any);
    const result = await handler.execute(new GetQuotationVersionsQuery('q-root'));

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('q-root');
    expect(result[1].id).toBe('q-v2');
  });
});

// ─── GetNegotiationHistoryHandler ─────────────────────────────────────────────

describe('GetNegotiationHistoryHandler', () => {
  it('should return negotiation logs ordered by loggedAt desc', async () => {
    const logs = [
      { id: 'n-2', note: 'Final offer', loggedAt: new Date('2026-04-17') },
      { id: 'n-1', note: 'Initial counter', loggedAt: new Date('2026-04-15') },
    ];
    const prisma = {
      working: {
        quotationNegotiationLog: { findMany: jest.fn().mockResolvedValue(logs) },
      },
    };
    const handler = new GetNegotiationHistoryHandler(prisma as any);
    const result = await handler.execute(new GetNegotiationHistoryQuery('q-1'));

    expect(result).toHaveLength(2);
    expect(prisma.working.quotationNegotiationLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { quotationId: 'q-1' },
        orderBy: { loggedAt: 'desc' },
      }),
    );
  });

  it('should return empty array when no negotiation logs exist', async () => {
    const prisma = {
      working: { quotationNegotiationLog: { findMany: jest.fn().mockResolvedValue([]) } },
    };
    const handler = new GetNegotiationHistoryHandler(prisma as any);
    const result = await handler.execute(new GetNegotiationHistoryQuery('q-new'));
    expect(result).toEqual([]);
  });
});
