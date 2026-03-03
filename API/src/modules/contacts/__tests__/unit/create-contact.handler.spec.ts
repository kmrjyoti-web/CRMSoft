import { CreateContactHandler } from '../../application/commands/create-contact/create-contact.handler';
import { CreateContactCommand } from '../../application/commands/create-contact/create-contact.command';

describe('CreateContactHandler', () => {
  let handler: CreateContactHandler;
  let repo: any;
  let publisher: any;
  let prisma: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    prisma = {
      communication: { create: jest.fn() },
      contactOrganization: { create: jest.fn() },
      contactFilter: { createMany: jest.fn() },
    };
    handler = new CreateContactHandler(repo, publisher, prisma);
  });

  it('should create contact and return UUID', async () => {
    const id = await handler.execute(
      new CreateContactCommand('Vikram', 'Sharma', 'user-1'),
    );
    expect(id).toBeDefined();
    expect(id.length).toBe(36);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should create communications', async () => {
    await handler.execute(new CreateContactCommand(
      'Vikram', 'Sharma', 'user-1', undefined, undefined, undefined,
      [{ type: 'EMAIL', value: 'v@t.com', isPrimary: true }],
    ));
    expect(prisma.communication.create).toHaveBeenCalledTimes(1);
  });

  it('should link to organization', async () => {
    await handler.execute(new CreateContactCommand(
      'Vikram', 'Sharma', 'user-1', 'CTO', 'Eng', undefined,
      undefined, 'org-1', 'PRIMARY_CONTACT',
    ));
    expect(prisma.contactOrganization.create).toHaveBeenCalledTimes(1);
  });

  it('should create filters', async () => {
    await handler.execute(new CreateContactCommand(
      'Vikram', 'Sharma', 'user-1', undefined, undefined, undefined,
      undefined, undefined, undefined, ['f-1', 'f-2'],
    ));
    expect(prisma.contactFilter.createMany).toHaveBeenCalledTimes(1);
  });

  it('should throw when firstName empty', async () => {
    await expect(handler.execute(
      new CreateContactCommand('', 'Sharma', 'user-1'),
    )).rejects.toThrow('First name is required');
    expect(repo.save).not.toHaveBeenCalled();
  });
});
