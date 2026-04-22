import { NotFoundException } from '@nestjs/common';
import { AssignFiltersHandler } from '../application/commands/assign-filters/assign-filters.handler';
import { CopyFiltersHandler } from '../application/commands/copy-filters/copy-filters.handler';
import { RemoveFilterHandler } from '../application/commands/remove-filter/remove-filter.handler';
import { ReplaceFiltersHandler } from '../application/commands/replace-filters/replace-filters.handler';
import { GetEntitiesByFilterHandler } from '../application/queries/get-entities-by-filter/get-entities-by-filter.handler';
import { GetEntityFiltersHandler } from '../application/queries/get-entity-filters/get-entity-filters.handler';
import { AssignFiltersCommand } from '../application/commands/assign-filters/assign-filters.command';
import { CopyFiltersCommand } from '../application/commands/copy-filters/copy-filters.command';
import { RemoveFilterCommand } from '../application/commands/remove-filter/remove-filter.command';
import { ReplaceFiltersCommand } from '../application/commands/replace-filters/replace-filters.command';
import { GetEntitiesByFilterQuery } from '../application/queries/get-entities-by-filter/get-entities-by-filter.query';
import { GetEntityFiltersQuery } from '../application/queries/get-entity-filters/get-entity-filters.query';

// ---------------------------------------------------------------------------
// The handlers use dynamic Prisma model access via prisma[config.filterModel]
// and prisma[config.entityModel]. We need to expose these model names
// as properties on the mock prisma.
//
// For entityType: 'lead':
//   entityModel = 'lead'
//   filterModel = 'leadFilter'
//   fkField     = 'leadId'
// ---------------------------------------------------------------------------

function buildPrisma() {
  const mock: any = {
    platform: {
      lookupValue: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      masterLookup: {
        findFirst: jest.fn(),
      },
    },
    // entity models
    lead: {
      findUnique: jest.fn(),
    },
    contact: {
      findUnique: jest.fn(),
    },
    // filter junction models
    leadFilter: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      groupBy: jest.fn(),
    },
    contactFilter: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      groupBy: jest.fn(),
    },
  };
  return mock;
}

// ---------------------------------------------------------------------------
// AssignFiltersHandler
// ---------------------------------------------------------------------------

describe('AssignFiltersHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: AssignFiltersHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new AssignFiltersHandler(prisma);
  });

  it('should assign valid filter values and skip invalid ones', async () => {
    prisma.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
    prisma.platform.lookupValue.findMany.mockResolvedValue([
      { id: 'val-1', isActive: true },
      // val-2 is missing => invalid
    ]);
    prisma.leadFilter.create.mockResolvedValue({});

    const cmd = new AssignFiltersCommand('lead', 'lead-1', ['val-1', 'val-2']);
    const result = await handler.execute(cmd);

    expect(result.assigned).toBe(1);
    expect(result.skipped).toBe(1); // val-2 not found
    expect(prisma.leadFilter.create).toHaveBeenCalledTimes(1);
    expect(prisma.leadFilter.create).toHaveBeenCalledWith({
      data: { leadId: 'lead-1', lookupValueId: 'val-1' },
    });
  });

  it('should throw NotFoundException when entity not found', async () => {
    prisma.lead.findUnique.mockResolvedValue(null);
    const cmd = new AssignFiltersCommand('lead', 'nonexistent', ['val-1']);
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('should skip duplicate assignments (P2002 unique constraint)', async () => {
    prisma.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
    prisma.platform.lookupValue.findMany.mockResolvedValue([{ id: 'val-1', isActive: true }]);

    const p2002Error = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
    prisma.leadFilter.create.mockRejectedValue(p2002Error);

    const cmd = new AssignFiltersCommand('lead', 'lead-1', ['val-1']);
    const result = await handler.execute(cmd);
    expect(result.assigned).toBe(0);
    expect(result.skipped).toBe(1);
  });

  it('should re-throw non-P2002 errors', async () => {
    prisma.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
    prisma.platform.lookupValue.findMany.mockResolvedValue([{ id: 'val-1', isActive: true }]);
    prisma.leadFilter.create.mockRejectedValue(new Error('DB failure'));

    const cmd = new AssignFiltersCommand('lead', 'lead-1', ['val-1']);
    await expect(handler.execute(cmd)).rejects.toThrow('DB failure');
  });

  it('should include tenantId filter check — only active values are assigned', async () => {
    prisma.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
    // All three values inactive (not returned by findMany with isActive:true)
    prisma.platform.lookupValue.findMany.mockResolvedValue([]);
    const cmd = new AssignFiltersCommand('lead', 'lead-1', ['val-1', 'val-2', 'val-3']);
    const result = await handler.execute(cmd);
    expect(result.assigned).toBe(0);
    expect(result.skipped).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// CopyFiltersHandler
// ---------------------------------------------------------------------------

describe('CopyFiltersHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: CopyFiltersHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new CopyFiltersHandler(prisma);
  });

  it('should copy filters from source to target entity', async () => {
    prisma.leadFilter.findMany.mockResolvedValue([
      { lookupValueId: 'val-1' },
      { lookupValueId: 'val-2' },
    ]);
    prisma.contactFilter.create.mockResolvedValue({});

    const cmd = new CopyFiltersCommand('lead', 'lead-1', 'contact', 'contact-1');
    const result = await handler.execute(cmd);

    expect(result).toBe(2);
    expect(prisma.contactFilter.create).toHaveBeenCalledTimes(2);
    expect(prisma.contactFilter.create).toHaveBeenCalledWith({
      data: { contactId: 'contact-1', lookupValueId: 'val-1' },
    });
  });

  it('should skip duplicates silently (P2002)', async () => {
    prisma.leadFilter.findMany.mockResolvedValue([{ lookupValueId: 'val-1' }]);
    const p2002Error = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
    prisma.contactFilter.create.mockRejectedValue(p2002Error);

    const cmd = new CopyFiltersCommand('lead', 'lead-1', 'contact', 'contact-1');
    const result = await handler.execute(cmd);
    expect(result).toBe(0); // copied 0 (skipped the duplicate)
  });

  it('should re-throw non-P2002 errors', async () => {
    prisma.leadFilter.findMany.mockResolvedValue([{ lookupValueId: 'val-1' }]);
    prisma.contactFilter.create.mockRejectedValue(new Error('Insert error'));

    const cmd = new CopyFiltersCommand('lead', 'lead-1', 'contact', 'contact-1');
    await expect(handler.execute(cmd)).rejects.toThrow('Insert error');
  });

  it('should return 0 when source has no filters', async () => {
    prisma.leadFilter.findMany.mockResolvedValue([]);
    const cmd = new CopyFiltersCommand('lead', 'lead-1', 'contact', 'contact-1');
    const result = await handler.execute(cmd);
    expect(result).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// RemoveFilterHandler
// ---------------------------------------------------------------------------

describe('RemoveFilterHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: RemoveFilterHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.leadFilter.deleteMany.mockResolvedValue({ count: 1 });
    handler = new RemoveFilterHandler(prisma);
  });

  it('should remove filter for entity', async () => {
    const cmd = new RemoveFilterCommand('lead', 'lead-1', 'val-1');
    await handler.execute(cmd);

    expect(prisma.leadFilter.deleteMany).toHaveBeenCalledWith({
      where: { leadId: 'lead-1', lookupValueId: 'val-1' },
    });
  });

  it('should propagate DB errors', async () => {
    prisma.leadFilter.deleteMany.mockRejectedValue(new Error('Delete failed'));
    const cmd = new RemoveFilterCommand('lead', 'lead-1', 'val-1');
    await expect(handler.execute(cmd)).rejects.toThrow('Delete failed');
  });
});

// ---------------------------------------------------------------------------
// ReplaceFiltersHandler
// ---------------------------------------------------------------------------

describe('ReplaceFiltersHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: ReplaceFiltersHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new ReplaceFiltersHandler(prisma);
  });

  it('should replace all filters for entity', async () => {
    prisma.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
    prisma.leadFilter.deleteMany.mockResolvedValue({ count: 3 });
    prisma.platform.lookupValue.findMany.mockResolvedValue([
      { id: 'val-new-1' },
      { id: 'val-new-2' },
    ]);
    prisma.leadFilter.create.mockResolvedValue({});

    const cmd = new ReplaceFiltersCommand('lead', 'lead-1', ['val-new-1', 'val-new-2']);
    const result = await handler.execute(cmd);

    expect(result.removed).toBe(3);
    expect(result.assigned).toBe(2);
    expect(prisma.leadFilter.deleteMany).toHaveBeenCalledWith({
      where: { leadId: 'lead-1' },
    });
  });

  it('should throw NotFoundException when entity not found', async () => {
    prisma.lead.findUnique.mockResolvedValue(null);
    const cmd = new ReplaceFiltersCommand('lead', 'nonexistent', ['val-1']);
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('should filter by category when category is provided', async () => {
    prisma.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
    const lookup = { id: 'lookup-1', category: 'LEAD_TYPE' };
    prisma.platform.masterLookup.findFirst.mockResolvedValue(lookup);
    prisma.platform.lookupValue.findMany
      .mockResolvedValueOnce([{ id: 'old-val-1' }]) // category value IDs for delete
      .mockResolvedValueOnce([{ id: 'val-new-1' }]);  // new values to assign
    prisma.leadFilter.deleteMany.mockResolvedValue({ count: 1 });
    prisma.leadFilter.create.mockResolvedValue({});

    const cmd = new ReplaceFiltersCommand('lead', 'lead-1', ['val-new-1'], 'lead_type');
    const result = await handler.execute(cmd);

    expect(prisma.platform.masterLookup.findFirst).toHaveBeenCalledWith({
      where: { category: 'LEAD_TYPE' },
    });
    expect(result.removed).toBe(1);
    expect(result.assigned).toBe(1);
  });

  it('should throw NotFoundException when category not found', async () => {
    prisma.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
    prisma.platform.masterLookup.findFirst.mockResolvedValue(null);

    const cmd = new ReplaceFiltersCommand('lead', 'lead-1', ['val-1'], 'NONEXISTENT');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('should propagate DB errors', async () => {
    prisma.lead.findUnique.mockRejectedValue(new Error('DB down'));
    const cmd = new ReplaceFiltersCommand('lead', 'lead-1', ['val-1']);
    await expect(handler.execute(cmd)).rejects.toThrow('DB down');
  });
});

// ---------------------------------------------------------------------------
// GetEntitiesByFilterHandler
// ---------------------------------------------------------------------------

describe('GetEntitiesByFilterHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: GetEntitiesByFilterHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new GetEntitiesByFilterHandler(prisma);
  });

  it('should return entity IDs matching any filter (OR logic)', async () => {
    prisma.leadFilter.findMany.mockResolvedValue([
      { leadId: 'lead-1' },
      { leadId: 'lead-2' },
    ]);

    const query = new GetEntitiesByFilterQuery('lead', ['val-1', 'val-2'], false);
    const result = await handler.execute(query);

    expect(result).toEqual(['lead-1', 'lead-2']);
    expect(prisma.leadFilter.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { lookupValueId: { in: ['val-1', 'val-2'] } },
        select: { leadId: true },
        distinct: ['leadId'],
      }),
    );
  });

  it('should use groupBy with HAVING for AND logic (matchAll=true)', async () => {
    prisma.leadFilter.groupBy.mockResolvedValue([
      { leadId: 'lead-1', _count: { lookupValueId: 2 } },
    ]);

    const query = new GetEntitiesByFilterQuery('lead', ['val-1', 'val-2'], true);
    const result = await handler.execute(query);

    expect(result).toEqual(['lead-1']);
    expect(prisma.leadFilter.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ['leadId'],
        having: { lookupValueId: { _count: { gte: 2 } } },
      }),
    );
  });

  it('should return empty array when no matches', async () => {
    prisma.leadFilter.findMany.mockResolvedValue([]);
    const query = new GetEntitiesByFilterQuery('lead', ['val-no-match'], false);
    const result = await handler.execute(query);
    expect(result).toEqual([]);
  });

  it('should propagate DB errors', async () => {
    prisma.leadFilter.findMany.mockRejectedValue(new Error('Filter query failed'));
    const query = new GetEntitiesByFilterQuery('lead', ['val-1'], false);
    await expect(handler.execute(query)).rejects.toThrow('Filter query failed');
  });
});

// ---------------------------------------------------------------------------
// GetEntityFiltersHandler
// ---------------------------------------------------------------------------

describe('GetEntityFiltersHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: GetEntityFiltersHandler;

  const filterRow = {
    lookupValue: {
      id: 'val-1',
      value: 'HOT',
      label: 'Hot Lead',
      icon: '🔥',
      color: '#EF4444',
      lookup: { category: 'LEAD_TYPE', displayName: 'Lead Type' },
    },
  };

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.leadFilter.findMany.mockResolvedValue([filterRow]);
    handler = new GetEntityFiltersHandler(prisma);
  });

  it('should return filters grouped by category and flat list', async () => {
    const query = new GetEntityFiltersQuery('lead', 'lead-1');
    const result = await handler.execute(query);

    expect(result.count).toBe(1);
    expect(result.grouped).toHaveProperty('LEAD_TYPE');
    expect(result.grouped['LEAD_TYPE'].values).toHaveLength(1);
    expect(result.grouped['LEAD_TYPE'].values[0]).toMatchObject({ value: 'HOT', label: 'Hot Lead' });
    expect(result.flat).toHaveLength(1);
    expect(result.flat[0].category).toBe('LEAD_TYPE');
  });

  it('should filter by entityId in where clause (tenant isolation)', async () => {
    const query = new GetEntityFiltersQuery('lead', 'lead-99');
    await handler.execute(query);

    expect(prisma.leadFilter.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { leadId: 'lead-99' },
      }),
    );
  });

  it('should return empty grouped and flat when no filters exist', async () => {
    prisma.leadFilter.findMany.mockResolvedValue([]);
    const query = new GetEntityFiltersQuery('lead', 'lead-empty');
    const result = await handler.execute(query);

    expect(result.count).toBe(0);
    expect(Object.keys(result.grouped)).toHaveLength(0);
    expect(result.flat).toHaveLength(0);
  });

  it('should group multiple values under same category', async () => {
    const rows = [
      {
        lookupValue: {
          id: 'val-1', value: 'HOT', label: 'Hot', icon: null, color: null,
          lookup: { category: 'LEAD_TYPE', displayName: 'Lead Type' },
        },
      },
      {
        lookupValue: {
          id: 'val-2', value: 'WARM', label: 'Warm', icon: null, color: null,
          lookup: { category: 'LEAD_TYPE', displayName: 'Lead Type' },
        },
      },
    ];
    prisma.leadFilter.findMany.mockResolvedValue(rows);

    const query = new GetEntityFiltersQuery('lead', 'lead-1');
    const result = await handler.execute(query);

    expect(result.grouped['LEAD_TYPE'].values).toHaveLength(2);
    expect(result.count).toBe(2);
  });

  it('should propagate DB errors', async () => {
    prisma.leadFilter.findMany.mockRejectedValue(new Error('Filters fetch failed'));
    const query = new GetEntityFiltersQuery('lead', 'lead-1');
    await expect(handler.execute(query)).rejects.toThrow('Filters fetch failed');
  });
});
