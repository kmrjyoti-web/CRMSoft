import { NotFoundException } from '@nestjs/common';
import { ReplaceFiltersHandler } from '../../application/commands/replace-filters/replace-filters.handler';
import { ReplaceFiltersCommand } from '../../application/commands/replace-filters/replace-filters.command';

describe('ReplaceFiltersHandler', () => {
  let handler: ReplaceFiltersHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      contact: { findUnique: jest.fn().mockResolvedValue({ id: 'c-1' }) },
      masterLookup: { findFirst: jest.fn().mockResolvedValue({ id: 'lk-1', category: 'CITY' }) },
      lookupValue: {
        findMany: jest.fn().mockResolvedValue([{ id: 'v1' }, { id: 'v2' }]),
      },
      contactFilter: {
        deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
        create: jest.fn().mockResolvedValue({ id: 'f-new' }),
      },
    };
    handler = new ReplaceFiltersHandler(prisma);
  });

  it('should replace all filters', async () => {
    const result = await handler.execute(
      new ReplaceFiltersCommand('contact', 'c-1', ['v1', 'v2']),
    );
    expect(result.removed).toBe(3);
    expect(result.assigned).toBe(2);
  });

  it('should replace only category-specific filters', async () => {
    prisma.lookupValue.findMany
      .mockResolvedValueOnce([{ id: 'v1' }])   // categoryValueIds
      .mockResolvedValueOnce([{ id: 'v1' }]);  // validValues (only 1)
    const result = await handler.execute(
      new ReplaceFiltersCommand('contact', 'c-1', ['v1'], 'CITY'),
    );
    expect(prisma.masterLookup.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { category: 'CITY' } }),
    );
    expect(result.assigned).toBe(1);
  });

  it('should throw NotFoundException for missing entity', async () => {
    prisma.contact.findUnique.mockResolvedValue(null);
    await expect(handler.execute(
      new ReplaceFiltersCommand('contact', 'c-999', ['v1']),
    )).rejects.toThrow(NotFoundException);
  });
});
