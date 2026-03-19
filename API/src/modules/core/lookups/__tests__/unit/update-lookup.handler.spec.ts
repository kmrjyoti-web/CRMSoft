import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateLookupHandler } from '../../application/commands/update-lookup/update-lookup.handler';
import { UpdateLookupCommand } from '../../application/commands/update-lookup/update-lookup.command';

describe('UpdateLookupHandler', () => {
  let handler: UpdateLookupHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      masterLookup: {
        findUnique: jest.fn().mockResolvedValue({ id: 'lk-1', category: 'INDUSTRY', isSystem: false }),
        update: jest.fn(),
      },
    };
    handler = new UpdateLookupHandler(prisma);
  });

  it('should update lookup', async () => {
    await handler.execute(new UpdateLookupCommand('lk-1', { displayName: 'New Name' }));
    expect(prisma.masterLookup.update).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    prisma.masterLookup.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new UpdateLookupCommand('lk-999', { displayName: 'X' })))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException for system lookup', async () => {
    prisma.masterLookup.findUnique.mockResolvedValue({ id: 'lk-1', isSystem: true });
    await expect(handler.execute(new UpdateLookupCommand('lk-1', { displayName: 'X' })))
      .rejects.toThrow(ForbiddenException);
  });
});
