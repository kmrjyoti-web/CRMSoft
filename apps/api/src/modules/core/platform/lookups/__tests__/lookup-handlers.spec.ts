import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateLookupHandler } from '../application/commands/create-lookup/create-lookup.handler';
import { AddValueHandler } from '../application/commands/add-value/add-value.handler';
import { DeactivateLookupHandler } from '../application/commands/deactivate-lookup/deactivate-lookup.handler';
import { DeactivateValueHandler } from '../application/commands/deactivate-value/deactivate-value.handler';
import { ReorderValuesHandler } from '../application/commands/reorder-values/reorder-values.handler';
import { ResetLookupDefaultsHandler } from '../application/commands/reset-lookup-defaults/reset-lookup-defaults.handler';
import { UpdateLookupHandler } from '../application/commands/update-lookup/update-lookup.handler';
import { UpdateValueHandler } from '../application/commands/update-value/update-value.handler';
import { GetAllLookupsHandler } from '../application/queries/get-all-lookups/get-all-lookups.handler';
import { GetLookupByIdHandler } from '../application/queries/get-lookup-by-id/get-lookup-by-id.handler';
import { GetValuesByCategoryHandler } from '../application/queries/get-values-by-category/get-values-by-category.handler';
import { CreateLookupCommand } from '../application/commands/create-lookup/create-lookup.command';
import { AddValueCommand } from '../application/commands/add-value/add-value.command';
import { DeactivateLookupCommand } from '../application/commands/deactivate-lookup/deactivate-lookup.command';
import { DeactivateValueCommand } from '../application/commands/deactivate-value/deactivate-value.command';
import { ReorderValuesCommand } from '../application/commands/reorder-values/reorder-values.command';
import { ResetLookupDefaultsCommand } from '../application/commands/reset-lookup-defaults/reset-lookup-defaults.command';
import { UpdateLookupCommand } from '../application/commands/update-lookup/update-lookup.command';
import { UpdateValueCommand } from '../application/commands/update-value/update-value.command';
import { GetAllLookupsQuery } from '../application/queries/get-all-lookups/get-all-lookups.query';
import { GetLookupByIdQuery } from '../application/queries/get-lookup-by-id/get-lookup-by-id.query';
import { GetValuesByCategoryQuery } from '../application/queries/get-values-by-category/get-values-by-category.query';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function makeLookup(overrides: Record<string, unknown> = {}) {
  return {
    id: 'lookup-1',
    category: 'INDUSTRY',
    displayName: 'Industry',
    description: null,
    isSystem: false,
    isActive: true,
    tenantId: 'tenant-1',
    ...overrides,
  };
}

function makeLookupValue(overrides: Record<string, unknown> = {}) {
  return {
    id: 'val-1',
    lookupId: 'lookup-1',
    tenantId: 'tenant-1',
    value: 'IT_SOFTWARE',
    label: 'IT / Software',
    icon: '💻',
    color: '#3B82F6',
    rowIndex: 0,
    isDefault: false,
    isActive: true,
    parentId: null,
    configJson: null,
    ...overrides,
  };
}

function buildPrisma() {
  return {
    platform: {
      masterLookup: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        upsert: jest.fn(),
      },
      lookupValue: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        upsert: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _max: { rowIndex: null } }),
      },
    },
    $transaction: jest.fn().mockImplementation((ops: any[]) => Promise.all(ops)),
  } as any;
}

// ---------------------------------------------------------------------------
// CreateLookupHandler
// ---------------------------------------------------------------------------

describe('CreateLookupHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: CreateLookupHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new CreateLookupHandler(prisma);
  });

  it('should create lookup and return its id', async () => {
    prisma.platform.masterLookup.findFirst.mockResolvedValue(null);
    prisma.platform.masterLookup.create.mockResolvedValue(makeLookup());

    const cmd = new CreateLookupCommand('industry', 'Industry', 'All industries');
    const result = await handler.execute(cmd);

    expect(result).toBe('lookup-1');
    expect(prisma.platform.masterLookup.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ category: 'INDUSTRY', displayName: 'Industry' }),
      }),
    );
  });

  it('should normalise category to uppercase with underscores', async () => {
    prisma.platform.masterLookup.findFirst.mockResolvedValue(null);
    prisma.platform.masterLookup.create.mockResolvedValue(makeLookup({ category: 'LEAD_TYPE' }));

    const cmd = new CreateLookupCommand('lead type', 'Lead Type');
    await handler.execute(cmd);

    const data = prisma.platform.masterLookup.create.mock.calls[0][0].data;
    expect(data.category).toBe('LEAD_TYPE');
  });

  it('should throw ConflictException when category already exists', async () => {
    prisma.platform.masterLookup.findFirst.mockResolvedValue(makeLookup());
    const cmd = new CreateLookupCommand('INDUSTRY', 'Industry');
    await expect(handler.execute(cmd)).rejects.toThrow(ConflictException);
  });

  it('should propagate DB errors', async () => {
    prisma.platform.masterLookup.findFirst.mockRejectedValue(new Error('DB error'));
    const cmd = new CreateLookupCommand('INDUSTRY', 'Industry');
    await expect(handler.execute(cmd)).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// AddValueHandler
// ---------------------------------------------------------------------------

describe('AddValueHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: AddValueHandler;
  const lookup = makeLookup();
  const value = makeLookupValue();

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.platform.masterLookup.findUnique.mockResolvedValue(lookup);
    prisma.platform.lookupValue.findFirst.mockResolvedValue(null); // no duplicate
    prisma.platform.lookupValue.aggregate.mockResolvedValue({ _max: { rowIndex: 2 } });
    prisma.platform.lookupValue.create.mockResolvedValue(value);
    handler = new AddValueHandler(prisma);
  });

  it('should add a new value and return its id', async () => {
    const cmd = new AddValueCommand('lookup-1', 'IT_SOFTWARE', 'IT / Software');
    const result = await handler.execute(cmd);

    expect(result).toBe('val-1');
    expect(prisma.platform.lookupValue.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          lookupId: 'lookup-1',
          value: 'IT_SOFTWARE',
          label: 'IT / Software',
          rowIndex: 3, // max was 2, so next is 3
        }),
      }),
    );
  });

  it('should unset existing default when isDefault=true', async () => {
    prisma.platform.lookupValue.updateMany.mockResolvedValue({ count: 1 });
    const cmd = new AddValueCommand('lookup-1', 'IT_SOFTWARE', 'IT / Software', undefined, undefined, true);
    await handler.execute(cmd);

    expect(prisma.platform.lookupValue.updateMany).toHaveBeenCalledWith({
      where: { lookupId: 'lookup-1', isDefault: true },
      data: { isDefault: false },
    });
  });

  it('should throw NotFoundException when lookup not found', async () => {
    prisma.platform.masterLookup.findUnique.mockResolvedValue(null);
    const cmd = new AddValueCommand('nonexistent', 'VAL', 'Val');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException when value already exists in lookup', async () => {
    prisma.platform.lookupValue.findFirst.mockResolvedValue(makeLookupValue());
    const cmd = new AddValueCommand('lookup-1', 'IT_SOFTWARE', 'IT / Software');
    await expect(handler.execute(cmd)).rejects.toThrow(ConflictException);
  });

  it('should assign rowIndex 0 when no existing values (null max)', async () => {
    prisma.platform.lookupValue.aggregate.mockResolvedValue({ _max: { rowIndex: null } });
    const cmd = new AddValueCommand('lookup-1', 'FIRST', 'First Value');
    await handler.execute(cmd);

    const data = prisma.platform.lookupValue.create.mock.calls[0][0].data;
    expect(data.rowIndex).toBe(0);
  });

  it('should propagate DB errors', async () => {
    prisma.platform.lookupValue.create.mockRejectedValue(new Error('Insert failed'));
    const cmd = new AddValueCommand('lookup-1', 'VAL', 'Val');
    await expect(handler.execute(cmd)).rejects.toThrow('Insert failed');
  });
});

// ---------------------------------------------------------------------------
// DeactivateLookupHandler
// ---------------------------------------------------------------------------

describe('DeactivateLookupHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: DeactivateLookupHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new DeactivateLookupHandler(prisma);
  });

  it('should deactivate a non-system lookup', async () => {
    prisma.platform.masterLookup.findUnique.mockResolvedValue(makeLookup({ isSystem: false }));
    prisma.platform.masterLookup.update.mockResolvedValue(makeLookup({ isActive: false }));

    await handler.execute(new DeactivateLookupCommand('lookup-1'));

    expect(prisma.platform.masterLookup.update).toHaveBeenCalledWith({
      where: { id: 'lookup-1' },
      data: { isActive: false },
    });
  });

  it('should throw NotFoundException when lookup not found', async () => {
    prisma.platform.masterLookup.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new DeactivateLookupCommand('nonexistent'))).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException for system lookups', async () => {
    prisma.platform.masterLookup.findUnique.mockResolvedValue(makeLookup({ isSystem: true }));
    await expect(handler.execute(new DeactivateLookupCommand('lookup-1'))).rejects.toThrow(ForbiddenException);
  });

  it('should propagate DB errors', async () => {
    prisma.platform.masterLookup.findUnique.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new DeactivateLookupCommand('lookup-1'))).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// DeactivateValueHandler
// ---------------------------------------------------------------------------

describe('DeactivateValueHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: DeactivateValueHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new DeactivateValueHandler(prisma);
  });

  it('should deactivate a lookup value', async () => {
    prisma.platform.lookupValue.findUnique.mockResolvedValue(makeLookupValue());
    prisma.platform.lookupValue.update.mockResolvedValue(makeLookupValue({ isActive: false }));

    await handler.execute(new DeactivateValueCommand('val-1'));

    expect(prisma.platform.lookupValue.update).toHaveBeenCalledWith({
      where: { id: 'val-1' },
      data: { isActive: false },
    });
  });

  it('should throw NotFoundException when value not found', async () => {
    prisma.platform.lookupValue.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new DeactivateValueCommand('nonexistent'))).rejects.toThrow(NotFoundException);
  });

  it('should propagate DB errors', async () => {
    prisma.platform.lookupValue.findUnique.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new DeactivateValueCommand('val-1'))).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// ReorderValuesHandler
// ---------------------------------------------------------------------------

describe('ReorderValuesHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: ReorderValuesHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.platform.masterLookup.findUnique.mockResolvedValue(makeLookup());
    prisma.platform.lookupValue.update.mockResolvedValue(makeLookupValue());
    prisma.$transaction.mockImplementation((ops: any[]) => Promise.all(ops));
    handler = new ReorderValuesHandler(prisma);
  });

  it('should update rowIndex for each value in transaction', async () => {
    const cmd = new ReorderValuesCommand('lookup-1', ['val-3', 'val-1', 'val-2']);
    await handler.execute(cmd);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.platform.lookupValue.update).toHaveBeenCalledTimes(3);
    expect(prisma.platform.lookupValue.update).toHaveBeenCalledWith({ where: { id: 'val-3' }, data: { rowIndex: 0 } });
    expect(prisma.platform.lookupValue.update).toHaveBeenCalledWith({ where: { id: 'val-1' }, data: { rowIndex: 1 } });
    expect(prisma.platform.lookupValue.update).toHaveBeenCalledWith({ where: { id: 'val-2' }, data: { rowIndex: 2 } });
  });

  it('should throw NotFoundException when lookup not found', async () => {
    prisma.platform.masterLookup.findUnique.mockResolvedValue(null);
    const cmd = new ReorderValuesCommand('nonexistent', ['val-1']);
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('should propagate transaction errors', async () => {
    prisma.$transaction.mockRejectedValue(new Error('Transaction failed'));
    const cmd = new ReorderValuesCommand('lookup-1', ['val-1']);
    await expect(handler.execute(cmd)).rejects.toThrow('Transaction failed');
  });
});

// ---------------------------------------------------------------------------
// ResetLookupDefaultsHandler
// ---------------------------------------------------------------------------

describe('ResetLookupDefaultsHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: ResetLookupDefaultsHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.platform.masterLookup.upsert.mockImplementation(() =>
      Promise.resolve(makeLookup({ id: `lookup-${Math.random()}` })),
    );
    prisma.platform.lookupValue.upsert.mockResolvedValue(makeLookupValue());
    handler = new ResetLookupDefaultsHandler(prisma);
  });

  it('should upsert all seed lookups and return restored count', async () => {
    const cmd = new ResetLookupDefaultsCommand('tenant-1');
    const result = await handler.execute(cmd);
    // LOOKUP_SEED_DATA has multiple entries; just verify we got a positive count
    expect(result.restoredCount).toBeGreaterThan(0);
    expect(prisma.platform.masterLookup.upsert).toHaveBeenCalled();
    expect(prisma.platform.lookupValue.upsert).toHaveBeenCalled();
  });

  it('should use empty string as tenantId when not provided', async () => {
    const cmd = new ResetLookupDefaultsCommand();
    await handler.execute(cmd);
    // First call to masterLookup.upsert should have tenantId: ''
    const firstCall = prisma.platform.masterLookup.upsert.mock.calls[0][0];
    expect(firstCall.create.tenantId).toBe('');
  });

  it('should propagate DB errors', async () => {
    prisma.platform.masterLookup.upsert.mockRejectedValue(new Error('Upsert failed'));
    const cmd = new ResetLookupDefaultsCommand('tenant-1');
    await expect(handler.execute(cmd)).rejects.toThrow('Upsert failed');
  });
});

// ---------------------------------------------------------------------------
// UpdateLookupHandler
// ---------------------------------------------------------------------------

describe('UpdateLookupHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: UpdateLookupHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new UpdateLookupHandler(prisma);
  });

  it('should update a non-system lookup', async () => {
    prisma.platform.masterLookup.findUnique.mockResolvedValue(makeLookup({ isSystem: false }));
    prisma.platform.masterLookup.update.mockResolvedValue(makeLookup({ displayName: 'Industries' }));

    const cmd = new UpdateLookupCommand('lookup-1', { displayName: 'Industries' });
    await handler.execute(cmd);

    expect(prisma.platform.masterLookup.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'lookup-1' },
        data: expect.objectContaining({ displayName: 'Industries' }),
      }),
    );
  });

  it('should throw NotFoundException when lookup not found', async () => {
    prisma.platform.masterLookup.findUnique.mockResolvedValue(null);
    const cmd = new UpdateLookupCommand('nonexistent', { displayName: 'X' });
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException for system lookups', async () => {
    prisma.platform.masterLookup.findUnique.mockResolvedValue(makeLookup({ isSystem: true }));
    const cmd = new UpdateLookupCommand('lookup-1', { displayName: 'X' });
    await expect(handler.execute(cmd)).rejects.toThrow(ForbiddenException);
  });

  it('should propagate DB errors', async () => {
    prisma.platform.masterLookup.findUnique.mockRejectedValue(new Error('DB error'));
    const cmd = new UpdateLookupCommand('lookup-1', { displayName: 'X' });
    await expect(handler.execute(cmd)).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// UpdateValueHandler
// ---------------------------------------------------------------------------

describe('UpdateValueHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: UpdateValueHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new UpdateValueHandler(prisma);
  });

  it('should update a lookup value', async () => {
    prisma.platform.lookupValue.findUnique.mockResolvedValue(makeLookupValue());
    prisma.platform.lookupValue.update.mockResolvedValue(makeLookupValue({ label: 'IT Software' }));

    const cmd = new UpdateValueCommand('val-1', { label: 'IT Software' });
    await handler.execute(cmd);

    expect(prisma.platform.lookupValue.update).toHaveBeenCalledWith({
      where: { id: 'val-1' },
      data: expect.objectContaining({ label: 'IT Software' }),
    });
  });

  it('should unset existing defaults when isDefault=true', async () => {
    prisma.platform.lookupValue.findUnique.mockResolvedValue(makeLookupValue());
    prisma.platform.lookupValue.updateMany.mockResolvedValue({ count: 1 });
    prisma.platform.lookupValue.update.mockResolvedValue(makeLookupValue({ isDefault: true }));

    const cmd = new UpdateValueCommand('val-1', { isDefault: true });
    await handler.execute(cmd);

    expect(prisma.platform.lookupValue.updateMany).toHaveBeenCalledWith({
      where: { lookupId: 'lookup-1', isDefault: true },
      data: { isDefault: false },
    });
  });

  it('should throw NotFoundException when value not found', async () => {
    prisma.platform.lookupValue.findUnique.mockResolvedValue(null);
    const cmd = new UpdateValueCommand('nonexistent', { label: 'X' });
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('should propagate DB errors', async () => {
    prisma.platform.lookupValue.findUnique.mockRejectedValue(new Error('DB error'));
    const cmd = new UpdateValueCommand('val-1', { label: 'X' });
    await expect(handler.execute(cmd)).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// GetAllLookupsHandler
// ---------------------------------------------------------------------------

describe('GetAllLookupsHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: GetAllLookupsHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.platform.masterLookup.findMany.mockResolvedValue([makeLookup()]);
    handler = new GetAllLookupsHandler(prisma);
  });

  it('should return all active lookups by default', async () => {
    const result = await handler.execute(new GetAllLookupsQuery());
    expect(Array.isArray(result)).toBe(true);
    expect(prisma.platform.masterLookup.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    );
  });

  it('should include inactive when activeOnly=false', async () => {
    await handler.execute(new GetAllLookupsQuery(false));
    const call = prisma.platform.masterLookup.findMany.mock.calls[0][0];
    // isActive should NOT be set in where when activeOnly=false
    expect(call.where.isActive).toBeUndefined();
  });

  it('should propagate DB errors', async () => {
    prisma.platform.masterLookup.findMany.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new GetAllLookupsQuery())).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// GetLookupByIdHandler
// ---------------------------------------------------------------------------

describe('GetLookupByIdHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: GetLookupByIdHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new GetLookupByIdHandler(prisma);
  });

  it('should return lookup with active values', async () => {
    const lookup = { ...makeLookup(), values: [makeLookupValue()] };
    prisma.platform.masterLookup.findUnique.mockResolvedValue(lookup);

    const result = await handler.execute(new GetLookupByIdQuery('lookup-1'));
    expect(result).toEqual(lookup);
    expect(prisma.platform.masterLookup.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'lookup-1' } }),
    );
  });

  it('should throw NotFoundException when lookup not found', async () => {
    prisma.platform.masterLookup.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new GetLookupByIdQuery('nonexistent'))).rejects.toThrow(NotFoundException);
  });

  it('should propagate DB errors', async () => {
    prisma.platform.masterLookup.findUnique.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new GetLookupByIdQuery('lookup-1'))).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// GetValuesByCategoryHandler
// ---------------------------------------------------------------------------

describe('GetValuesByCategoryHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: GetValuesByCategoryHandler;
  const lookup = makeLookup();
  const values = [makeLookupValue()];

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.platform.masterLookup.findFirst.mockResolvedValue(lookup);
    prisma.platform.lookupValue.findMany.mockResolvedValue(values);
    handler = new GetValuesByCategoryHandler(prisma);
  });

  it('should return values for a category', async () => {
    const query = new GetValuesByCategoryQuery('INDUSTRY');
    const result = await handler.execute(query);

    expect(result.lookupId).toBe('lookup-1');
    expect(result.category).toBe('INDUSTRY');
    expect(result.values).toEqual(values);
  });

  it('should normalise category to uppercase', async () => {
    await handler.execute(new GetValuesByCategoryQuery('industry'));
    expect(prisma.platform.masterLookup.findFirst).toHaveBeenCalledWith({
      where: { category: 'INDUSTRY' },
    });
  });

  it('should throw NotFoundException when category not found', async () => {
    prisma.platform.masterLookup.findFirst.mockResolvedValue(null);
    await expect(handler.execute(new GetValuesByCategoryQuery('NONEXISTENT'))).rejects.toThrow(NotFoundException);
  });

  it('should filter active values by default (activeOnly not false)', async () => {
    await handler.execute(new GetValuesByCategoryQuery('INDUSTRY'));
    const whereArg = prisma.platform.lookupValue.findMany.mock.calls[0][0].where;
    expect(whereArg.isActive).toBe(true);
  });

  it('should include inactive values when activeOnly=false', async () => {
    await handler.execute(new GetValuesByCategoryQuery('INDUSTRY', false));
    const whereArg = prisma.platform.lookupValue.findMany.mock.calls[0][0].where;
    expect(whereArg.isActive).toBeUndefined();
  });

  it('should propagate DB errors', async () => {
    prisma.platform.masterLookup.findFirst.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new GetValuesByCategoryQuery('INDUSTRY'))).rejects.toThrow('DB error');
  });
});
