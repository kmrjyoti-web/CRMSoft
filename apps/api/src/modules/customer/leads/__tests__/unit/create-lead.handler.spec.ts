import { NotFoundException } from '@nestjs/common';
import { CreateLeadHandler } from '../../application/commands/create-lead/create-lead.handler';
import { CreateLeadCommand } from '../../application/commands/create-lead/create-lead.command';

describe('CreateLeadHandler', () => {
  let handler: CreateLeadHandler;
  let repo: any;
  let publisher: any;
  let prisma: any;
  let txMock: any;
  let workflowEngine: any;

  beforeEach(() => {
    repo = {
      save: jest.fn(),
      nextLeadNumber: jest.fn().mockResolvedValue('LD-00001'),
    };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    txMock = {
      leadFilter: { createMany: jest.fn() },
    };
    prisma = {
      contact: { findUnique: jest.fn().mockResolvedValue({ id: 'c-1', isActive: true }) },
      organization: { findUnique: jest.fn().mockResolvedValue({ id: 'org-1' }) },
      $transaction: jest.fn(async (cb: any) => cb(txMock)),
    };
(prisma as any).working = prisma;
    workflowEngine = {
      initializeWorkflow: jest.fn().mockResolvedValue({}),
    };
    handler = new CreateLeadHandler(repo, publisher, prisma, workflowEngine);
  });

  it('should create lead and return UUID', async () => {
    const id = await handler.execute(new CreateLeadCommand('c-1', 'user-1'));
    expect(id).toBeDefined();
    expect(id.length).toBe(36);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.nextLeadNumber).toHaveBeenCalledTimes(1);
  });

  it('should create with organization', async () => {
    const id = await handler.execute(
      new CreateLeadCommand('c-1', 'user-1', 'org-1', 'HIGH', 50000),
    );
    expect(id).toBeDefined();
    expect(prisma.organization.findUnique).toHaveBeenCalledTimes(1);
  });

  it('should create filter associations', async () => {
    await handler.execute(
      new CreateLeadCommand('c-1', 'user-1', undefined, undefined, undefined, undefined, undefined, ['f-1']),
    );
    expect(txMock.leadFilter.createMany).toHaveBeenCalledTimes(1);
  });

  it('should throw when contact not found', async () => {
    prisma.contact.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new CreateLeadCommand('c-999', 'user-1')))
      .rejects.toThrow(NotFoundException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw when contact deactivated', async () => {
    prisma.contact.findUnique.mockResolvedValue({ id: 'c-1', isActive: false });
    await expect(handler.execute(new CreateLeadCommand('c-1', 'user-1')))
      .rejects.toThrow('Cannot create lead for deactivated contact');
  });

  it('should throw when organization not found', async () => {
    prisma.organization.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new CreateLeadCommand('c-1', 'user-1', 'org-999')))
      .rejects.toThrow(NotFoundException);
  });
});
