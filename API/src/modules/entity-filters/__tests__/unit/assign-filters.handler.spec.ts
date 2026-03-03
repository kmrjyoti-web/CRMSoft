import { NotFoundException } from '@nestjs/common';
import { AssignFiltersHandler } from '../../application/commands/assign-filters/assign-filters.handler';
import { AssignFiltersCommand } from '../../application/commands/assign-filters/assign-filters.command';

describe('AssignFiltersHandler', () => {
  let handler: AssignFiltersHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      lead: { findUnique: jest.fn().mockResolvedValue({ id: 'lead-1' }) },
      lookupValue: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'val-1' }, { id: 'val-2' },
        ]),
      },
      leadFilter: { create: jest.fn().mockResolvedValue({ id: 'f-1' }) },
    };
    handler = new AssignFiltersHandler(prisma);
  });

  it('should assign filters to lead', async () => {
    const result = await handler.execute(
      new AssignFiltersCommand('lead', 'lead-1', ['val-1', 'val-2']),
    );
    expect(result.assigned).toBe(2);
    expect(result.skipped).toBe(0);
    expect(prisma.leadFilter.create).toHaveBeenCalledTimes(2);
  });

  it('should skip invalid lookup value IDs', async () => {
    const result = await handler.execute(
      new AssignFiltersCommand('lead', 'lead-1', ['val-1', 'val-2', 'val-invalid']),
    );
    expect(result.assigned).toBe(2);
    expect(result.skipped).toBe(1);
  });

  it('should skip duplicates (P2002)', async () => {
    prisma.leadFilter.create
      .mockResolvedValueOnce({ id: 'f-1' })
      .mockRejectedValueOnce({ code: 'P2002' });

    const result = await handler.execute(
      new AssignFiltersCommand('lead', 'lead-1', ['val-1', 'val-2']),
    );
    expect(result.assigned).toBe(1);
    expect(result.skipped).toBe(1);
  });

  it('should throw NotFoundException for missing entity', async () => {
    prisma.lead.findUnique.mockResolvedValue(null);
    await expect(handler.execute(
      new AssignFiltersCommand('lead', 'lead-999', ['val-1']),
    )).rejects.toThrow(NotFoundException);
  });
});
