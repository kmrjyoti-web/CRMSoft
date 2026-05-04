import { NotFoundException } from '@nestjs/common';
import { UpdateLeadHandler } from '../../application/commands/update-lead/update-lead.handler';
import { UpdateLeadCommand } from '../../application/commands/update-lead/update-lead.command';
import { LeadEntity } from '../../domain/entities/lead.entity';

describe('UpdateLeadHandler', () => {
  let handler: UpdateLeadHandler;
  let repo: any;
  let publisher: any;
  let prisma: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    prisma = { leadFilter: { deleteMany: jest.fn(), createMany: jest.fn() } };
(prisma as any).working = prisma;
    handler = new UpdateLeadHandler(repo, publisher, prisma);
  });

  it('should update active lead', async () => {
    const lead = LeadEntity.create('lead-1', {
      leadNumber: 'LD-00001', contactId: 'c-1', priority: 'MEDIUM', createdById: 'u-1',
    });
    repo.findById.mockResolvedValue(lead);

    await handler.execute(new UpdateLeadCommand('lead-1', { priority: 'HIGH', expectedValue: 75000 }));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should replace filters', async () => {
    const lead = LeadEntity.create('lead-1', {
      leadNumber: 'LD-00001', contactId: 'c-1', priority: 'MEDIUM', createdById: 'u-1',
    });
    repo.findById.mockResolvedValue(lead);

    await handler.execute(new UpdateLeadCommand('lead-1', { notes: 'X' }, ['f-1']));
    expect(prisma.leadFilter.deleteMany).toHaveBeenCalledTimes(1);
    expect(prisma.leadFilter.createMany).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new UpdateLeadCommand('lead-999', { priority: 'HIGH' })))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when terminal status', async () => {
    const lead = LeadEntity.fromPersistence({
      id: 'lead-1', leadNumber: 'LD-00001', contactId: 'c-1', status: 'WON',
      priority: 'HIGH', createdById: 'u-1', createdAt: new Date(), updatedAt: new Date(),
    });
    repo.findById.mockResolvedValue(lead);

    await expect(handler.execute(new UpdateLeadCommand('lead-1', { priority: 'LOW' })))
      .rejects.toThrow('Cannot update lead in terminal status');
  });
});
