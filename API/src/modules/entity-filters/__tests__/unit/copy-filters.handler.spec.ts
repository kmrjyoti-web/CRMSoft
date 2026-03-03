import { CopyFiltersHandler } from '../../application/commands/copy-filters/copy-filters.handler';
import { CopyFiltersCommand } from '../../application/commands/copy-filters/copy-filters.command';

describe('CopyFiltersHandler', () => {
  let handler: CopyFiltersHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      rawContactFilter: {
        findMany: jest.fn().mockResolvedValue([
          { lookupValueId: 'v1' }, { lookupValueId: 'v2' }, { lookupValueId: 'v3' },
        ]),
      },
      contactFilter: { create: jest.fn().mockResolvedValue({ id: 'f-new' }) },
    };
    handler = new CopyFiltersHandler(prisma);
  });

  it('should copy all filters from rawContact to contact', async () => {
    const copied = await handler.execute(
      new CopyFiltersCommand('raw_contact', 'rc-1', 'contact', 'c-1'),
    );
    expect(copied).toBe(3);
    expect(prisma.contactFilter.create).toHaveBeenCalledTimes(3);
  });

  it('should skip duplicates on copy', async () => {
    prisma.contactFilter.create
      .mockResolvedValueOnce({ id: 'f-1' })
      .mockRejectedValueOnce({ code: 'P2002' })
      .mockResolvedValueOnce({ id: 'f-3' });

    const copied = await handler.execute(
      new CopyFiltersCommand('raw_contact', 'rc-1', 'contact', 'c-1'),
    );
    expect(copied).toBe(2);
  });
});
