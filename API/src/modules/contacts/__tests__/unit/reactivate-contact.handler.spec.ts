import { NotFoundException } from '@nestjs/common';
import { ReactivateContactHandler } from '../../application/commands/reactivate-contact/reactivate-contact.handler';
import { ReactivateContactCommand } from '../../application/commands/reactivate-contact/reactivate-contact.command';
import { ContactEntity } from '../../domain/entities/contact.entity';

describe('ReactivateContactHandler', () => {
  let handler: ReactivateContactHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new ReactivateContactHandler(repo, publisher);
  });

  it('should reactivate deactivated contact', async () => {
    const c = ContactEntity.create('c-1', { firstName: 'T', lastName: 'U', createdById: 'u-1' });
    c.deactivate();
    repo.findById.mockResolvedValue(c);
    await handler.execute(new ReactivateContactCommand('c-1'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new ReactivateContactCommand('c-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when already active', async () => {
    const c = ContactEntity.create('c-1', { firstName: 'T', lastName: 'U', createdById: 'u-1' });
    repo.findById.mockResolvedValue(c);
    await expect(handler.execute(new ReactivateContactCommand('c-1')))
      .rejects.toThrow('already active');
  });
});
