/**
 * Unit tests for remaining lead command/query/event handlers.
 * Covers: deactivate, permanent-delete, quick-create, reactivate,
 *         restore, soft-delete, get-leads-list, and all event handlers.
 *
 * Pattern: direct instantiation, mock Prisma service, no NestJS test module.
 */

import { NotFoundException, BadRequestException } from '@nestjs/common';

// ----- Command handlers -----
import { DeactivateLeadHandler } from '../../application/commands/deactivate-lead/deactivate-lead.handler';
import { DeactivateLeadCommand } from '../../application/commands/deactivate-lead/deactivate-lead.command';

import { PermanentDeleteLeadHandler } from '../../application/commands/permanent-delete-lead/permanent-delete-lead.handler';
import { PermanentDeleteLeadCommand } from '../../application/commands/permanent-delete-lead/permanent-delete-lead.command';

import { QuickCreateLeadHandler } from '../../application/commands/quick-create-lead/quick-create-lead.handler';
import { QuickCreateLeadCommand } from '../../application/commands/quick-create-lead/quick-create-lead.command';

import { ReactivateLeadHandler } from '../../application/commands/reactivate-lead/reactivate-lead.handler';
import { ReactivateLeadCommand } from '../../application/commands/reactivate-lead/reactivate-lead.command';

import { RestoreLeadHandler } from '../../application/commands/restore-lead/restore-lead.handler';
import { RestoreLeadCommand } from '../../application/commands/restore-lead/restore-lead.command';

import { SoftDeleteLeadHandler } from '../../application/commands/soft-delete-lead/soft-delete-lead.handler';
import { SoftDeleteLeadCommand } from '../../application/commands/soft-delete-lead/soft-delete-lead.command';

// ----- Query handlers -----
import { GetLeadsListHandler } from '../../application/queries/get-leads-list/get-leads-list.handler';
import { GetLeadsListQuery } from '../../application/queries/get-leads-list/get-leads-list.query';

// ----- Event handlers -----
import { OnLeadCreatedHandler } from '../../application/event-handlers/on-lead-created.handler';
import { OnLeadAllocatedHandler } from '../../application/event-handlers/on-lead-allocated.handler';
import { OnLeadStatusChangedHandler } from '../../application/event-handlers/on-lead-status-changed.handler';

// ----- Domain -----
import { LeadEntity } from '../../domain/entities/lead.entity';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal active (not deleted) LeadEntity from persistence. */
function makeActiveLead(overrides: Partial<any> = {}): LeadEntity {
  return LeadEntity.fromPersistence({
    id: 'lead-1',
    leadNumber: 'LD-00001',
    contactId: 'c-1',
    status: 'NEW',
    priority: 'MEDIUM',
    isActive: true,
    isDeleted: false,
    deletedAt: null,
    deletedById: null,
    createdById: 'u-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// DeactivateLeadHandler
// ---------------------------------------------------------------------------
describe('DeactivateLeadHandler', () => {
  let handler: DeactivateLeadHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { findById: jest.fn(), save: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new DeactivateLeadHandler(repo, publisher);
  });

  it('should deactivate an active lead', async () => {
    const lead = makeActiveLead();
    repo.findById.mockResolvedValue(lead);

    await handler.execute(new DeactivateLeadCommand('lead-1'));

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(lead.isActive).toBe(false);
  });

  it('should throw NotFoundException when lead not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new DeactivateLeadCommand('missing')))
      .rejects.toThrow(NotFoundException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw when lead is already inactive', async () => {
    const lead = makeActiveLead({ isActive: false });
    repo.findById.mockResolvedValue(lead);
    await expect(handler.execute(new DeactivateLeadCommand('lead-1')))
      .rejects.toThrow('Lead is already inactive');
  });
});

// ---------------------------------------------------------------------------
// PermanentDeleteLeadHandler
// ---------------------------------------------------------------------------
describe('PermanentDeleteLeadHandler', () => {
  let handler: PermanentDeleteLeadHandler;
  let repo: any;

  beforeEach(() => {
    repo = { findById: jest.fn(), delete: jest.fn() };
    handler = new PermanentDeleteLeadHandler(repo);
  });

  it('should permanently delete a soft-deleted lead', async () => {
    const lead = makeActiveLead({ isDeleted: true, isActive: false });
    repo.findById.mockResolvedValue(lead);

    await handler.execute(new PermanentDeleteLeadCommand('lead-1'));

    expect(repo.delete).toHaveBeenCalledWith('lead-1');
  });

  it('should throw NotFoundException when lead not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new PermanentDeleteLeadCommand('missing')))
      .rejects.toThrow(NotFoundException);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if lead has not been soft-deleted first', async () => {
    const lead = makeActiveLead({ isDeleted: false });
    repo.findById.mockResolvedValue(lead);
    await expect(handler.execute(new PermanentDeleteLeadCommand('lead-1')))
      .rejects.toThrow(BadRequestException);
    expect(repo.delete).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// ReactivateLeadHandler
// ---------------------------------------------------------------------------
describe('ReactivateLeadHandler', () => {
  let handler: ReactivateLeadHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { findById: jest.fn(), save: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new ReactivateLeadHandler(repo, publisher);
  });

  it('should reactivate an inactive lead', async () => {
    const lead = makeActiveLead({ isActive: false });
    repo.findById.mockResolvedValue(lead);

    await handler.execute(new ReactivateLeadCommand('lead-1'));

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(lead.isActive).toBe(true);
  });

  it('should throw NotFoundException when lead not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new ReactivateLeadCommand('missing')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when lead is already active', async () => {
    const lead = makeActiveLead({ isActive: true });
    repo.findById.mockResolvedValue(lead);
    await expect(handler.execute(new ReactivateLeadCommand('lead-1')))
      .rejects.toThrow('Lead is already active');
  });
});

// ---------------------------------------------------------------------------
// RestoreLeadHandler
// ---------------------------------------------------------------------------
describe('RestoreLeadHandler', () => {
  let handler: RestoreLeadHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { findById: jest.fn(), save: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new RestoreLeadHandler(repo, publisher);
  });

  it('should restore a soft-deleted lead', async () => {
    const lead = makeActiveLead({ isDeleted: true, isActive: false });
    repo.findById.mockResolvedValue(lead);

    await handler.execute(new RestoreLeadCommand('lead-1'));

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(lead.isDeleted).toBe(false);
    expect(lead.isActive).toBe(true);
  });

  it('should throw NotFoundException when lead not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new RestoreLeadCommand('missing')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when lead is not deleted', async () => {
    const lead = makeActiveLead({ isDeleted: false });
    repo.findById.mockResolvedValue(lead);
    await expect(handler.execute(new RestoreLeadCommand('lead-1')))
      .rejects.toThrow('Lead is not deleted');
  });
});

// ---------------------------------------------------------------------------
// SoftDeleteLeadHandler
// ---------------------------------------------------------------------------
describe('SoftDeleteLeadHandler', () => {
  let handler: SoftDeleteLeadHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { findById: jest.fn(), save: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new SoftDeleteLeadHandler(repo, publisher);
  });

  it('should soft-delete an active lead', async () => {
    const lead = makeActiveLead();
    repo.findById.mockResolvedValue(lead);

    await handler.execute(new SoftDeleteLeadCommand('lead-1', 'admin-1'));

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(lead.isDeleted).toBe(true);
    expect(lead.deletedById).toBe('admin-1');
  });

  it('should throw NotFoundException when lead not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new SoftDeleteLeadCommand('missing', 'admin-1')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when lead is already soft-deleted', async () => {
    const lead = makeActiveLead({ isDeleted: true, isActive: false });
    repo.findById.mockResolvedValue(lead);
    await expect(handler.execute(new SoftDeleteLeadCommand('lead-1', 'admin-1')))
      .rejects.toThrow('Lead is already deleted');
  });
});

// ---------------------------------------------------------------------------
// QuickCreateLeadHandler
// ---------------------------------------------------------------------------
describe('QuickCreateLeadHandler', () => {
  let handler: QuickCreateLeadHandler;
  let repo: any;
  let publisher: any;
  let prisma: any;
  let txMock: any;
  let workflowEngine: any;

  beforeEach(() => {
    repo = {
      save: jest.fn(),
      nextLeadNumber: jest.fn().mockResolvedValue('LD-00001'),
    };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    txMock = {
      organization: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'org-new-1' }),
      },
      contact: {
        create: jest.fn().mockResolvedValue({ id: 'contact-new-1' }),
      },
      communication: { create: jest.fn() },
      contactOrganization: { create: jest.fn() },
      rawContact: {
        create: jest.fn().mockResolvedValue({ id: 'raw-1' }),
      },
      leadFilter: { createMany: jest.fn() },
    };
    prisma = {
      contact: {
        findUnique: jest.fn().mockResolvedValue({ id: 'c-1', isActive: true }),
      },
      organization: {
        findUnique: jest.fn().mockResolvedValue({ id: 'org-1' }),
      },
      $transaction: jest.fn(async (cb: any) => cb(txMock)),
    };
    (prisma as any).working = prisma;
    workflowEngine = {
      initializeWorkflow: jest.fn().mockResolvedValue({}),
    };
    handler = new QuickCreateLeadHandler(repo, publisher, prisma, workflowEngine);
  });

  it('should quick-create lead with existing contactId', async () => {
    const result = await handler.execute(
      new QuickCreateLeadCommand('user-1', 'c-1'),
    );
    expect(result.leadId).toBeDefined();
    expect(result.contactId).toBe('c-1');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should quick-create lead with inline contact and organization', async () => {
    const result = await handler.execute(
      new QuickCreateLeadCommand(
        'user-1',
        undefined,
        { firstName: 'Rahul', lastName: 'Sharma', mobile: '9876543210' },
        undefined,
        { name: 'Acme Corp' },
      ),
    );
    expect(result.leadId).toBeDefined();
    expect(txMock.contact.create).toHaveBeenCalledTimes(1);
    expect(txMock.organization.create).toHaveBeenCalledTimes(1);
    expect(result.rawContactId).toBe('raw-1');
  });

  it('should reuse existing organization when name matches', async () => {
    txMock.organization.findFirst.mockResolvedValue({ id: 'org-existing' });
    const result = await handler.execute(
      new QuickCreateLeadCommand(
        'user-1',
        undefined,
        { firstName: 'Priya', lastName: 'Singh', mobile: '9000000001' },
        undefined,
        { name: 'Existing Corp' },
      ),
    );
    expect(txMock.organization.create).not.toHaveBeenCalled();
    expect(result.organizationId).toBe('org-existing');
  });

  it('should throw BadRequestException when neither contactId nor inlineContact provided', async () => {
    await expect(
      handler.execute(new QuickCreateLeadCommand('user-1')),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when provided contactId does not exist', async () => {
    prisma.contact.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new QuickCreateLeadCommand('user-1', 'bad-contact')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for deactivated contact', async () => {
    prisma.contact.findUnique.mockResolvedValue({ id: 'c-1', isActive: false });
    await expect(
      handler.execute(new QuickCreateLeadCommand('user-1', 'c-1')),
    ).rejects.toThrow('Cannot create lead for deactivated contact');
  });

  it('should throw NotFoundException when provided organizationId does not exist', async () => {
    prisma.organization.findUnique.mockResolvedValue(null);
    await expect(
      handler.execute(new QuickCreateLeadCommand('user-1', 'c-1', undefined, 'bad-org')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should create filter associations when filterIds provided', async () => {
    await handler.execute(
      new QuickCreateLeadCommand(
        'user-1', 'c-1', undefined, undefined, undefined,
        undefined, undefined, undefined, undefined, ['f-1', 'f-2'],
      ),
    );
    expect(txMock.leadFilter.createMany).toHaveBeenCalledTimes(1);
  });

  it('should initialize workflow after lead creation', async () => {
    await handler.execute(new QuickCreateLeadCommand('user-1', 'c-1'));
    expect(workflowEngine.initializeWorkflow).toHaveBeenCalledWith('LEAD', expect.any(String), 'user-1');
  });

  it('should not throw if workflow init fails (best-effort)', async () => {
    workflowEngine.initializeWorkflow.mockRejectedValue(new Error('workflow unavailable'));
    // Should resolve without throwing
    await expect(
      handler.execute(new QuickCreateLeadCommand('user-1', 'c-1')),
    ).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// GetLeadsListHandler
// ---------------------------------------------------------------------------
describe('GetLeadsListHandler', () => {
  let handler: GetLeadsListHandler;
  let prisma: any;

  const makeLeadRow = (overrides: any = {}) => ({
    id: 'lead-1',
    leadNumber: 'LD-00001',
    status: 'NEW',
    priority: 'MEDIUM',
    expectedValue: null,
    isActive: true,
    createdAt: new Date(),
    contact: { id: 'c-1', firstName: 'Rahul', lastName: 'Sharma', communications: [] },
    organization: null,
    allocatedToId: null,
    ...overrides,
  });

  beforeEach(() => {
    prisma = {
      lead: {
        findMany: jest.fn().mockResolvedValue([makeLeadRow()]),
        count: jest.fn().mockResolvedValue(1),
      },
    };
    (prisma as any).working = prisma;
    handler = new GetLeadsListHandler(prisma);
  });

  it('should return paginated list with defaults', async () => {
    const result = await handler.execute(new GetLeadsListQuery(1, 20, 'createdAt', 'desc'));
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should filter by isActive', async () => {
    prisma.lead.findMany.mockResolvedValue([]);
    prisma.lead.count.mockResolvedValue(0);
    await handler.execute(new GetLeadsListQuery(1, 20, 'createdAt', 'desc', undefined, true));
    const where = prisma.lead.findMany.mock.calls[0][0].where;
    expect(where.isActive).toBe(true);
  });

  it('should filter by single status', async () => {
    prisma.lead.findMany.mockResolvedValue([]);
    prisma.lead.count.mockResolvedValue(0);
    await handler.execute(new GetLeadsListQuery(1, 20, 'createdAt', 'desc', undefined, undefined, 'NEW'));
    const where = prisma.lead.findMany.mock.calls[0][0].where;
    expect(where.status).toBe('NEW');
  });

  it('should filter by multiple statuses (comma-separated)', async () => {
    prisma.lead.findMany.mockResolvedValue([]);
    prisma.lead.count.mockResolvedValue(0);
    await handler.execute(new GetLeadsListQuery(1, 20, 'createdAt', 'desc', undefined, undefined, 'NEW,ALLOCATED'));
    const where = prisma.lead.findMany.mock.calls[0][0].where;
    expect(where.status).toEqual({ in: ['NEW', 'ALLOCATED'] });
  });

  it('should filter by priority', async () => {
    prisma.lead.findMany.mockResolvedValue([]);
    prisma.lead.count.mockResolvedValue(0);
    await handler.execute(new GetLeadsListQuery(1, 20, 'createdAt', 'desc', undefined, undefined, undefined, 'HIGH'));
    const where = prisma.lead.findMany.mock.calls[0][0].where;
    expect(where.priority).toBe('HIGH');
  });

  it('should filter by allocatedToId', async () => {
    prisma.lead.findMany.mockResolvedValue([]);
    prisma.lead.count.mockResolvedValue(0);
    await handler.execute(
      new GetLeadsListQuery(1, 20, 'createdAt', 'desc', undefined, undefined, undefined, undefined, 'user-5'),
    );
    const where = prisma.lead.findMany.mock.calls[0][0].where;
    expect(where.allocatedToId).toBe('user-5');
  });

  it('should apply search filter with OR clause', async () => {
    prisma.lead.findMany.mockResolvedValue([]);
    prisma.lead.count.mockResolvedValue(0);
    await handler.execute(new GetLeadsListQuery(1, 20, 'createdAt', 'desc', 'Rahul'));
    const where = prisma.lead.findMany.mock.calls[0][0].where;
    expect(where.OR).toBeDefined();
    expect(Array.isArray(where.OR)).toBe(true);
  });

  it('tenant isolation — should not return leads from other tenants (contactId filter)', async () => {
    // Simulates row-level tenant isolation via contactId scoping
    prisma.lead.findMany.mockResolvedValue([]);
    prisma.lead.count.mockResolvedValue(0);
    await handler.execute(
      new GetLeadsListQuery(1, 20, 'createdAt', 'desc', undefined, undefined, undefined, undefined, undefined, 'c-tenant-B'),
    );
    const where = prisma.lead.findMany.mock.calls[0][0].where;
    expect(where.contactId).toBe('c-tenant-B');
  });

  it('should handle errors by re-throwing', async () => {
    prisma.lead.findMany.mockRejectedValue(new Error('DB error'));
    await expect(
      handler.execute(new GetLeadsListQuery(1, 20, 'createdAt', 'desc')),
    ).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------
describe('OnLeadCreatedHandler', () => {
  let handler: OnLeadCreatedHandler;

  beforeEach(() => {
    handler = new OnLeadCreatedHandler();
  });

  it('should handle LeadCreatedEvent without throwing', () => {
    expect(() =>
      handler.handle({ leadId: 'lead-1', contactId: 'c-1', createdById: 'u-1' } as any),
    ).not.toThrow();
  });

  it('should handle event silently even if an internal error occurs', () => {
    // Verify the try-catch inside the handler swallows errors without propagating
    const original = (handler as any).logger;
    (handler as any).logger = { log: jest.fn(), error: jest.fn() };

    // Force error scenario — should not propagate
    expect(() =>
      handler.handle(null as any),
    ).not.toThrow();

    (handler as any).logger = original;
  });
});

describe('OnLeadAllocatedHandler', () => {
  let handler: OnLeadAllocatedHandler;

  beforeEach(() => {
    handler = new OnLeadAllocatedHandler();
  });

  it('should handle LeadAllocatedEvent without throwing', () => {
    expect(() =>
      handler.handle({ leadId: 'lead-1', allocatedToId: 'user-5', contactId: 'c-1' } as any),
    ).not.toThrow();
  });
});

describe('OnLeadStatusChangedHandler', () => {
  let handler: OnLeadStatusChangedHandler;

  beforeEach(() => {
    handler = new OnLeadStatusChangedHandler();
  });

  it('should handle LeadStatusChangedEvent without throwing', () => {
    expect(() =>
      handler.handle({ leadId: 'lead-1', fromStatus: 'NEW', toStatus: 'ALLOCATED' } as any),
    ).not.toThrow();
  });

  it('should handle WON status change silently', () => {
    expect(() =>
      handler.handle({ leadId: 'lead-1', fromStatus: 'QUALIFIED', toStatus: 'WON' } as any),
    ).not.toThrow();
  });

  it('should handle LOST status change silently', () => {
    expect(() =>
      handler.handle({ leadId: 'lead-1', fromStatus: 'QUALIFIED', toStatus: 'LOST' } as any),
    ).not.toThrow();
  });
});
