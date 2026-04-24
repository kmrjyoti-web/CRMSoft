import { AddCommunicationHandler } from '../../application/commands/add-communication/add-communication.handler';
import { AddCommunicationCommand } from '../../application/commands/add-communication/add-communication.command';

describe('AddCommunicationHandler', () => {
  let handler: AddCommunicationHandler;
  let repo: any;
  let publisher: any;
  let prisma: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    prisma = { communication: { updateMany: jest.fn() } };
(prisma as any).working = prisma;
    handler = new AddCommunicationHandler(repo, publisher, prisma);
  });

  it('should add phone communication', async () => {
    const id = await handler.execute(
      new AddCommunicationCommand('PHONE', '+91-9876543210', 'PRIMARY', false, undefined, undefined, 'c-1'),
    );
    expect(id).toBeDefined();
    expect(id.length).toBe(36);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should add email communication', async () => {
    const id = await handler.execute(
      new AddCommunicationCommand('EMAIL', 'test@example.com', 'WORK', false, 'Work Email', undefined, 'c-1'),
    );
    expect(id).toBeDefined();
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should unset existing primary when isPrimary=true', async () => {
    await handler.execute(
      new AddCommunicationCommand('PHONE', '+91-9876543210', 'PRIMARY', true, undefined, undefined, 'c-1'),
    );
    expect(prisma.communication.updateMany).toHaveBeenCalledTimes(1);
  });

  it('should not unset primary when isPrimary=false', async () => {
    await handler.execute(
      new AddCommunicationCommand('PHONE', '+91-9876543210', 'WORK', false, undefined, undefined, 'c-1'),
    );
    expect(prisma.communication.updateMany).not.toHaveBeenCalled();
  });

  it('should throw when no entity link', async () => {
    await expect(handler.execute(
      new AddCommunicationCommand('EMAIL', 'test@example.com'),
    )).rejects.toThrow('At least one entity link is required');
  });

  it('should throw when value empty', async () => {
    await expect(handler.execute(
      new AddCommunicationCommand('PHONE', '', undefined, false, undefined, undefined, 'c-1'),
    )).rejects.toThrow('Phone cannot be empty');
  });
});
