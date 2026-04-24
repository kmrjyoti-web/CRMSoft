import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeactivateLookupHandler } from '../../application/commands/deactivate-lookup/deactivate-lookup.handler';
import { DeactivateLookupCommand } from '../../application/commands/deactivate-lookup/deactivate-lookup.command';

describe('DeactivateLookupHandler', () => {
  let handler: DeactivateLookupHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      masterLookup: {
        findUnique: jest.fn().mockResolvedValue({ id: 'lk-1', isSystem: false }),
        update: jest.fn(),
      },
    };
(prisma as any).platform = prisma;
    handler = new DeactivateLookupHandler(prisma);
  });

  it('should deactivate non-system lookup', async () => {
    await handler.execute(new DeactivateLookupCommand('lk-1'));
    expect(prisma.masterLookup.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
  });

  it('should throw NotFoundException', async () => {
    prisma.masterLookup.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new DeactivateLookupCommand('lk-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException for system lookup', async () => {
    prisma.masterLookup.findUnique.mockResolvedValue({ id: 'lk-1', isSystem: true });
    await expect(handler.execute(new DeactivateLookupCommand('lk-1')))
      .rejects.toThrow(ForbiddenException);
  });
});
