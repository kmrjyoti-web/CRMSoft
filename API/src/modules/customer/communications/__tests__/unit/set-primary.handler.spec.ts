import { NotFoundException } from '@nestjs/common';
import { SetPrimaryHandler } from '../../application/commands/set-primary/set-primary.handler';
import { SetPrimaryCommunicationCommand } from '../../application/commands/set-primary/set-primary.command';
import { CommunicationEntity } from '../../domain/entities/communication.entity';

describe('SetPrimaryHandler', () => {
  let handler: SetPrimaryHandler;
  let repo: any;
  let prisma: any;

  beforeEach(() => {
    repo = { findById: jest.fn() };
    prisma = { communication: { updateMany: jest.fn(), update: jest.fn() } };
(prisma as any).working = prisma;
    handler = new SetPrimaryHandler(repo, prisma);
  });

  it('should set as primary and unset others', async () => {
    const comm = CommunicationEntity.create('comm-1', {
      type: 'PHONE', value: '+91-9876543210', contactId: 'c-1',
    });
    repo.findById.mockResolvedValue(comm);
    await handler.execute(new SetPrimaryCommunicationCommand('comm-1'));
    expect(prisma.communication.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.communication.update).toHaveBeenCalledTimes(1);
  });

  it('should skip if already primary', async () => {
    const comm = CommunicationEntity.create('comm-1', {
      type: 'PHONE', value: '+91-9876543210', contactId: 'c-1', isPrimary: true,
    });
    repo.findById.mockResolvedValue(comm);
    await handler.execute(new SetPrimaryCommunicationCommand('comm-1'));
    expect(prisma.communication.updateMany).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new SetPrimaryCommunicationCommand('comm-999')))
      .rejects.toThrow(NotFoundException);
  });
});
