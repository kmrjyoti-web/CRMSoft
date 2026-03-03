import { NotFoundException } from '@nestjs/common';
import { MarkDuplicateHandler } from '../../application/commands/mark-duplicate/mark-duplicate.handler';
import { MarkDuplicateCommand } from '../../application/commands/mark-duplicate/mark-duplicate.command';
import { RawContactEntity } from '../../domain/entities/raw-contact.entity';

describe('MarkDuplicateHandler', () => {
  let handler: MarkDuplicateHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new MarkDuplicateHandler(repo, publisher);
  });

  it('should mark RAW as DUPLICATE', async () => {
    const rc = RawContactEntity.create('rc-1', {
      firstName: 'Test', lastName: 'User', createdById: 'u-1',
    });
    repo.findById.mockResolvedValue(rc);

    await handler.execute(new MarkDuplicateCommand('rc-1'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new MarkDuplicateCommand('rc-999')))
      .rejects.toThrow(NotFoundException);
  });
});
