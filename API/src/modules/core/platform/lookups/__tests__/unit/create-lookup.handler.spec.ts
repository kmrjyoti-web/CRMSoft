import { ConflictException } from '@nestjs/common';
import { CreateLookupHandler } from '../../application/commands/create-lookup/create-lookup.handler';
import { CreateLookupCommand } from '../../application/commands/create-lookup/create-lookup.command';

describe('CreateLookupHandler', () => {
  let handler: CreateLookupHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      masterLookup: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'lk-1' }),
      },
    };
    handler = new CreateLookupHandler(prisma);
  });

  it('should create lookup and return ID', async () => {
    const id = await handler.execute(new CreateLookupCommand('industry', 'Industry'));
    expect(id).toBe('lk-1');
    expect(prisma.masterLookup.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'INDUSTRY' }) }),
    );
  });

  it('should uppercase and replace spaces', async () => {
    await handler.execute(new CreateLookupCommand('lead source', 'Lead Source'));
    expect(prisma.masterLookup.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'LEAD_SOURCE' }) }),
    );
  });

  it('should throw ConflictException on duplicate', async () => {
    prisma.masterLookup.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(handler.execute(new CreateLookupCommand('INDUSTRY', 'Industry')))
      .rejects.toThrow(ConflictException);
  });
});
