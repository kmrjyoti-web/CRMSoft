import { NotFoundException, ConflictException } from '@nestjs/common';
import { AddValueHandler } from '../../application/commands/add-value/add-value.handler';
import { AddValueCommand } from '../../application/commands/add-value/add-value.command';

describe('AddValueHandler', () => {
  let handler: AddValueHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      masterLookup: { findUnique: jest.fn().mockResolvedValue({ id: 'lk-1', category: 'INDUSTRY' }) },
      lookupValue: {
        findFirst: jest.fn().mockResolvedValue(null),
        aggregate: jest.fn().mockResolvedValue({ _max: { rowIndex: 2 } }),
        updateMany: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'val-1' }),
      },
    };
(prisma as any).platform = prisma;
    handler = new AddValueHandler(prisma);
  });

  it('should add value with auto rowIndex', async () => {
    const id = await handler.execute(new AddValueCommand('lk-1', 'IT', 'IT / Software'));
    expect(id).toBe('val-1');
    expect(prisma.lookupValue.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ rowIndex: 3 }) }),
    );
  });

  it('should unset default when isDefault=true', async () => {
    await handler.execute(new AddValueCommand('lk-1', 'IT', 'IT', undefined, undefined, true));
    expect(prisma.lookupValue.updateMany).toHaveBeenCalledTimes(1);
  });

  it('should throw when lookup not found', async () => {
    prisma.masterLookup.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new AddValueCommand('lk-999', 'IT', 'IT')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw on duplicate value', async () => {
    prisma.lookupValue.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(handler.execute(new AddValueCommand('lk-1', 'IT', 'IT')))
      .rejects.toThrow(ConflictException);
  });
});
