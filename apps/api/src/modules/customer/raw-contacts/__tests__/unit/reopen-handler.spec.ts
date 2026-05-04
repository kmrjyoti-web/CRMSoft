import { NotFoundException } from '@nestjs/common';
import { ReopenRawContactHandler } from '../../application/commands/reopen-raw-contact/reopen-raw-contact.handler';
import { ReopenRawContactCommand } from '../../application/commands/reopen-raw-contact/reopen-raw-contact.command';
import { RawContactEntity } from '../../domain/entities/raw-contact.entity';

describe('ReopenRawContactHandler', () => {
  let handler: ReopenRawContactHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new ReopenRawContactHandler(repo, publisher);
  });

  it('should reopen REJECTED → RAW', async () => {
    const rc = RawContactEntity.create('rc-1', {
      firstName: 'Test', lastName: 'User', createdById: 'u-1',
    });
    rc.reject('test');
    repo.findById.mockResolvedValue(rc);

    await handler.execute(new ReopenRawContactCommand('rc-1'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new ReopenRawContactCommand('rc-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when VERIFIED (terminal)', async () => {
    const rc = RawContactEntity.fromPersistence({
      id: 'rc-1', firstName: 'T', lastName: 'U', status: 'VERIFIED',
      source: 'MANUAL', createdById: 'u-1', createdAt: new Date(), updatedAt: new Date(),
    });
    repo.findById.mockResolvedValue(rc);

    await expect(handler.execute(new ReopenRawContactCommand('rc-1')))
      .rejects.toThrow('Cannot reopen');
  });
});
