import { NotFoundException } from '@nestjs/common';
import { DeactivateContactHandler } from '../../application/commands/deactivate-contact/deactivate-contact.handler';
import { DeactivateContactCommand } from '../../application/commands/deactivate-contact/deactivate-contact.command';
import { ContactEntity } from '../../domain/entities/contact.entity';

describe('DeactivateContactHandler', () => {
  let handler: DeactivateContactHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new DeactivateContactHandler(repo, publisher);
  });

  it('should deactivate active contact', async () => {
    const c = ContactEntity.create('c-1', { firstName: 'T', lastName: 'U', createdById: 'u-1' });
    repo.findById.mockResolvedValue(c);
    await handler.execute(new DeactivateContactCommand('c-1'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new DeactivateContactCommand('c-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when already deactivated', async () => {
    const c = ContactEntity.create('c-1', { firstName: 'T', lastName: 'U', createdById: 'u-1' });
    c.deactivate();
    repo.findById.mockResolvedValue(c);
    await expect(handler.execute(new DeactivateContactCommand('c-1')))
      .rejects.toThrow('already deactivated');
  });
});
