import { NotFoundException } from '@nestjs/common';
import { UpdateContactHandler } from '../../application/commands/update-contact/update-contact.handler';
import { UpdateContactCommand } from '../../application/commands/update-contact/update-contact.command';
import { ContactEntity } from '../../domain/entities/contact.entity';

describe('UpdateContactHandler', () => {
  let handler: UpdateContactHandler;
  let repo: any;
  let publisher: any;
  let prisma: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    prisma = { contactFilter: { deleteMany: jest.fn(), createMany: jest.fn() } };
    handler = new UpdateContactHandler(repo, publisher, prisma);
  });

  it('should update active contact', async () => {
    const c = ContactEntity.create('c-1', { firstName: 'Old', lastName: 'User', createdById: 'u-1' });
    repo.findById.mockResolvedValue(c);
    await handler.execute(new UpdateContactCommand('c-1', 'u-2', { firstName: 'New' }));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should replace filters when provided', async () => {
    const c = ContactEntity.create('c-1', { firstName: 'T', lastName: 'U', createdById: 'u-1' });
    repo.findById.mockResolvedValue(c);
    await handler.execute(new UpdateContactCommand('c-1', 'u-2', { notes: 'X' }, ['f-1']));
    expect(prisma.contactFilter.deleteMany).toHaveBeenCalledTimes(1);
    expect(prisma.contactFilter.createMany).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new UpdateContactCommand('c-999', 'u-2', { firstName: 'X' })))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when deactivated', async () => {
    const c = ContactEntity.create('c-1', { firstName: 'T', lastName: 'U', createdById: 'u-1' });
    c.deactivate();
    repo.findById.mockResolvedValue(c);
    await expect(handler.execute(new UpdateContactCommand('c-1', 'u-2', { firstName: 'X' })))
      .rejects.toThrow('Cannot update deactivated');
  });
});
