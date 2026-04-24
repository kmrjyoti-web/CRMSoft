import { NotFoundException } from '@nestjs/common';
import { AllocateLeadHandler } from '../../application/commands/allocate-lead/allocate-lead.handler';
import { AllocateLeadCommand } from '../../application/commands/allocate-lead/allocate-lead.command';
import { LeadEntity } from '../../domain/entities/lead.entity';

describe('AllocateLeadHandler', () => {
  let handler: AllocateLeadHandler;
  let repo: any;
  let publisher: any;
  let prisma: any;

  const createLead = (status = 'NEW') => {
    if (status === 'NEW') {
      return LeadEntity.create('lead-1', {
        leadNumber: 'LD-00001', contactId: 'c-1', priority: 'HIGH', createdById: 'u-1',
      });
    }
    return LeadEntity.fromPersistence({
      id: 'lead-1', leadNumber: 'LD-00001', contactId: 'c-1', status,
      priority: 'HIGH', createdById: 'u-1', createdAt: new Date(), updatedAt: new Date(),
    });
  };

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'sales-1', status: 'ACTIVE' }) },
    };
    handler = new AllocateLeadHandler(repo, publisher, prisma);
  });

  it('should allocate NEW lead', async () => {
    repo.findById.mockResolvedValue(createLead('NEW'));
    await handler.execute(new AllocateLeadCommand('lead-1', 'sales-1'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should allocate VERIFIED lead', async () => {
    repo.findById.mockResolvedValue(createLead('VERIFIED'));
    await handler.execute(new AllocateLeadCommand('lead-1', 'sales-1'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw when lead not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new AllocateLeadCommand('lead-999', 'sales-1')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when user not found', async () => {
    repo.findById.mockResolvedValue(createLead('NEW'));
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new AllocateLeadCommand('lead-1', 'sales-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when user inactive', async () => {
    repo.findById.mockResolvedValue(createLead('NEW'));
    prisma.user.findUnique.mockResolvedValue({ id: 'sales-1', status: 'INACTIVE' });
    await expect(handler.execute(new AllocateLeadCommand('lead-1', 'sales-1')))
      .rejects.toThrow('Cannot allocate to inactive user');
  });

  it('should throw when lead already IN_PROGRESS', async () => {
    repo.findById.mockResolvedValue(createLead('IN_PROGRESS'));
    await expect(handler.execute(new AllocateLeadCommand('lead-1', 'sales-1')))
      .rejects.toThrow('Cannot allocate');
  });
});
