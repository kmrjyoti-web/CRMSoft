import { NotFoundException } from '@nestjs/common';
import { UpdateRawContactHandler } from '../../application/commands/update-raw-contact/update-raw-contact.handler';
import { UpdateRawContactCommand } from '../../application/commands/update-raw-contact/update-raw-contact.command';
import { RawContactEntity } from '../../domain/entities/raw-contact.entity';

describe('UpdateRawContactHandler', () => {
  let handler: UpdateRawContactHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new UpdateRawContactHandler(repo, publisher);
  });

  it('should update RAW contact', async () => {
    const rc = RawContactEntity.create('rc-1', {
      firstName: 'Test', lastName: 'User', createdById: 'u-1',
    });
    repo.findById.mockResolvedValue(rc);

    await handler.execute(new UpdateRawContactCommand('rc-1', { firstName: 'Updated' }));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new UpdateRawContactCommand('rc-999', { firstName: 'X' })))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when terminal status', async () => {
    const rc = RawContactEntity.fromPersistence({
      id: 'rc-1', firstName: 'T', lastName: 'U', status: 'VERIFIED',
      source: 'MANUAL', createdById: 'u-1', createdAt: new Date(), updatedAt: new Date(),
    });
    repo.findById.mockResolvedValue(rc);

    await expect(handler.execute(new UpdateRawContactCommand('rc-1', { firstName: 'X' })))
      .rejects.toThrow('Cannot update raw contact in terminal status');
  });
});
