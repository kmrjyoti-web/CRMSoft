import { NotFoundException } from '@nestjs/common';
import { DeleteCommunicationHandler } from '../../application/commands/delete-communication/delete-communication.handler';
import { DeleteCommunicationCommand } from '../../application/commands/delete-communication/delete-communication.command';
import { CommunicationEntity } from '../../domain/entities/communication.entity';

describe('DeleteCommunicationHandler', () => {
  let handler: DeleteCommunicationHandler;
  let repo: any;

  beforeEach(() => {
    repo = { findById: jest.fn(), delete: jest.fn() };
    handler = new DeleteCommunicationHandler(repo);
  });

  it('should delete communication', async () => {
    const comm = CommunicationEntity.create('comm-1', {
      type: 'PHONE', value: '+91-9876543210', contactId: 'c-1',
    });
    repo.findById.mockResolvedValue(comm);
    await handler.execute(new DeleteCommunicationCommand('comm-1'));
    expect(repo.delete).toHaveBeenCalledWith('comm-1');
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new DeleteCommunicationCommand('comm-999')))
      .rejects.toThrow(NotFoundException);
  });
});
