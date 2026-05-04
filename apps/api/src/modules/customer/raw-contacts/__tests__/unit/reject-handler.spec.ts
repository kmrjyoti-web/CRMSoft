import { NotFoundException } from '@nestjs/common';
import { RejectRawContactHandler } from '../../application/commands/reject-raw-contact/reject-raw-contact.handler';
import { RejectRawContactCommand } from '../../application/commands/reject-raw-contact/reject-raw-contact.command';
import { RawContactEntity } from '../../domain/entities/raw-contact.entity';

describe('RejectRawContactHandler', () => {
  let handler: RejectRawContactHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new RejectRawContactHandler(repo, publisher);
  });

  it('should reject RAW contact', async () => {
    const rc = RawContactEntity.create('rc-1', {
      firstName: 'Test', lastName: 'User', createdById: 'u-1',
    });
    repo.findById.mockResolvedValue(rc);

    await handler.execute(new RejectRawContactCommand('rc-1', 'Bad data'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new RejectRawContactCommand('rc-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when already VERIFIED (terminal)', async () => {
    const rc = RawContactEntity.fromPersistence({
      id: 'rc-1', firstName: 'T', lastName: 'U', status: 'VERIFIED',
      source: 'MANUAL', createdById: 'u-1', createdAt: new Date(), updatedAt: new Date(),
    });
    repo.findById.mockResolvedValue(rc);

    await expect(handler.execute(new RejectRawContactCommand('rc-1')))
      .rejects.toThrow('Cannot reject');
  });
});
