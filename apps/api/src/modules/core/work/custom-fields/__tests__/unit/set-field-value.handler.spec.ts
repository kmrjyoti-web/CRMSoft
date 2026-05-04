import { SetFieldValueHandler } from '../../application/commands/set-field-value/set-field-value.handler';
import { SetFieldValueCommand } from '../../application/commands/set-field-value/set-field-value.command';

describe('SetFieldValueHandler', () => {
  let handler: SetFieldValueHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      entityConfigValue: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'val-1' }),
        update: jest.fn().mockResolvedValue({ id: 'val-1' }),
      },
      $transaction: jest.fn().mockImplementation(async (cb) => {
        if (typeof cb === 'function') return cb(prisma);
        return Promise.all(cb);
      }),
    };
    handler = new SetFieldValueHandler(prisma);
  });

  it('should save multiple field values in a transaction', async () => {
    const result = await handler.execute(
      new SetFieldValueCommand('LEAD', 'lead-1', [
        { definitionId: 'def-1', valueText: 'High' },
        { definitionId: 'def-2', valueNumber: 42 },
      ]),
    );
    expect(result.saved).toBe(2);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('should handle date values', async () => {
    const result = await handler.execute(
      new SetFieldValueCommand('CONTACT', 'c-1', [
        { definitionId: 'def-3', valueDate: '2025-06-15' },
      ]),
    );
    expect(result.saved).toBe(1);
  });

  it('should handle boolean values', async () => {
    const result = await handler.execute(
      new SetFieldValueCommand('LEAD', 'l-1', [
        { definitionId: 'def-4', valueBoolean: true },
      ]),
    );
    expect(result.saved).toBe(1);
  });
});
