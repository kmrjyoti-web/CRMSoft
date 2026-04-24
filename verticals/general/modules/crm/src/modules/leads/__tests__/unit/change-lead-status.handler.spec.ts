import { NotFoundException } from '@nestjs/common';
import { ChangeLeadStatusHandler } from '../../application/commands/change-lead-status/change-lead-status.handler';
import { ChangeLeadStatusCommand } from '../../application/commands/change-lead-status/change-lead-status.command';
import { LeadEntity } from '../../domain/entities/lead.entity';

describe('ChangeLeadStatusHandler', () => {
  let handler: ChangeLeadStatusHandler;
  let repo: any;
  let publisher: any;

  const createLead = (status: string) => {
    return LeadEntity.fromPersistence({
      id: 'lead-1', leadNumber: 'LD-00001', contactId: 'c-1', status,
      priority: 'HIGH', createdById: 'u-1', allocatedToId: 'sales-1',
      createdAt: new Date(), updatedAt: new Date(),
    });
  };

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new ChangeLeadStatusHandler(repo, publisher);
  });

  it('should change ALLOCATED → IN_PROGRESS', async () => {
    repo.findById.mockResolvedValue(createLead('ALLOCATED'));
    await handler.execute(new ChangeLeadStatusCommand('lead-1', 'IN_PROGRESS'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should change IN_PROGRESS → DEMO_SCHEDULED', async () => {
    repo.findById.mockResolvedValue(createLead('IN_PROGRESS'));
    await handler.execute(new ChangeLeadStatusCommand('lead-1', 'DEMO_SCHEDULED'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should mark LOST with reason', async () => {
    repo.findById.mockResolvedValue(createLead('IN_PROGRESS'));
    await handler.execute(new ChangeLeadStatusCommand('lead-1', 'LOST', 'Budget constraints'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw when lead not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new ChangeLeadStatusCommand('lead-999', 'IN_PROGRESS')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw on invalid transition', async () => {
    repo.findById.mockResolvedValue(createLead('NEW'));
    await expect(handler.execute(new ChangeLeadStatusCommand('lead-1', 'WON')))
      .rejects.toThrow('Invalid transition');
  });

  it('should throw when LOST without reason', async () => {
    repo.findById.mockResolvedValue(createLead('IN_PROGRESS'));
    await expect(handler.execute(new ChangeLeadStatusCommand('lead-1', 'LOST')))
      .rejects.toThrow('Lost reason is required');
  });

  it('should throw when terminal status (WON → anything)', async () => {
    repo.findById.mockResolvedValue(createLead('WON'));
    await expect(handler.execute(new ChangeLeadStatusCommand('lead-1', 'IN_PROGRESS')))
      .rejects.toThrow('Invalid transition');
  });
});
