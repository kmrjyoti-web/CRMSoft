import { CreateRawContactHandler } from '../../application/commands/create-raw-contact/create-raw-contact.handler';
import { CreateRawContactCommand } from '../../application/commands/create-raw-contact/create-raw-contact.command';

describe('CreateRawContactHandler', () => {
  let handler: CreateRawContactHandler;
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
      rawContactFilter: { createMany: jest.fn() },
    };
(prisma as any).working = prisma;
    handler = new CreateRawContactHandler(repo, publisher, prisma);
  });

  it('should create raw contact and return UUID', async () => {
    const id = await handler.execute(new CreateRawContactCommand('Vikram', 'Sharma', 'user-1'));
    expect(id).toBeDefined();
    expect(id.length).toBe(36);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should create communication records', async () => {
    await handler.execute(new CreateRawContactCommand(
      'Vikram', 'Sharma', 'user-1', undefined, undefined, undefined, undefined, undefined,
      [{ type: 'PHONE', value: '+91-9876543210', priorityType: 'PRIMARY' }],
    ));
    expect(prisma.communication.create).toHaveBeenCalledTimes(1);
  });

  it('should create filter associations', async () => {
    await handler.execute(new CreateRawContactCommand(
      'Vikram', 'Sharma', 'user-1', undefined, undefined, undefined, undefined, undefined,
      undefined, ['filter-1', 'filter-2'],
    ));
    expect(prisma.rawContactFilter.createMany).toHaveBeenCalledTimes(1);
  });

  it('should throw when firstName empty', async () => {
    await expect(handler.execute(new CreateRawContactCommand('', 'Sharma', 'user-1')))
      .rejects.toThrow('First name is required');
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw when lastName empty', async () => {
    await expect(handler.execute(new CreateRawContactCommand('Vikram', '', 'user-1')))
      .rejects.toThrow('Last name is required');
  });

  it('should call publisher.mergeObjectContext', async () => {
    await handler.execute(new CreateRawContactCommand('Vikram', 'Sharma', 'user-1'));
    expect(publisher.mergeObjectContext).toHaveBeenCalledTimes(1);
  });
});
