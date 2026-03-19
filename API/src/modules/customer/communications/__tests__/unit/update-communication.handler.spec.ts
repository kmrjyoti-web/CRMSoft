import { NotFoundException } from '@nestjs/common';
import { UpdateCommunicationHandler } from '../../application/commands/update-communication/update-communication.handler';
import { UpdateCommunicationCommand } from '../../application/commands/update-communication/update-communication.command';
import { CommunicationEntity } from '../../domain/entities/communication.entity';

describe('UpdateCommunicationHandler', () => {
  let handler: UpdateCommunicationHandler;
  let repo: any;
  let prisma: any;

  beforeEach(() => {
    repo = { findById: jest.fn() };
    prisma = { communication: { update: jest.fn() } };
(prisma as any).working = prisma;
    handler = new UpdateCommunicationHandler(repo, prisma);
  });

  it('should update value', async () => {
    const comm = CommunicationEntity.create('comm-1', {
      type: 'PHONE', value: '+91-9876543210', contactId: 'c-1',
    });
    repo.findById.mockResolvedValue(comm);
    await handler.execute(new UpdateCommunicationCommand('comm-1', { value: '+91-222' }));
    expect(prisma.communication.update).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new UpdateCommunicationCommand('comm-999', { value: 'X' })))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when no fields', async () => {
    const comm = CommunicationEntity.create('comm-1', {
      type: 'PHONE', value: '+91-9876543210', contactId: 'c-1',
    });
    repo.findById.mockResolvedValue(comm);
    await expect(handler.execute(new UpdateCommunicationCommand('comm-1', {})))
      .rejects.toThrow('No fields provided');
  });
});
