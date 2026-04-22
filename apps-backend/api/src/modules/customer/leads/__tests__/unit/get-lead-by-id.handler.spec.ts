import { NotFoundException } from '@nestjs/common';
import { GetLeadByIdHandler } from '../../application/queries/get-lead-by-id/get-lead-by-id.handler';
import { GetLeadByIdQuery } from '../../application/queries/get-lead-by-id/get-lead-by-id.query';

const mockLead = {
  id: 'lead-1',
  tenantId: 't-1',
  status: 'NEW',
  contact: null,
  organization: null,
  filters: [],
  activities: [],
  demos: [],
  quotations: [],
  _count: { activities: 0, demos: 0, quotations: 0 },
};

function makePrisma(findResult: any) {
  return {
    working: {
      lead: { findUnique: jest.fn().mockResolvedValue(findResult) },
    },
  };
}

describe('GetLeadByIdHandler', () => {
  it('should return lead with validNextStatuses and isTerminal', async () => {
    const prisma = makePrisma(mockLead);
    const handler = new GetLeadByIdHandler(prisma as any);
    const result = await handler.execute(new GetLeadByIdQuery('lead-1'));

    expect(result.id).toBe('lead-1');
    expect(Array.isArray(result.validNextStatuses)).toBe(true);
    expect(typeof result.isTerminal).toBe('boolean');
    expect(prisma.working.lead.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'lead-1' } }),
    );
  });

  it('should throw NotFoundException when lead does not exist', async () => {
    const prisma = makePrisma(null);
    const handler = new GetLeadByIdHandler(prisma as any);
    await expect(handler.execute(new GetLeadByIdQuery('lead-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should include full relation shape in query', async () => {
    const prisma = makePrisma(mockLead);
    const handler = new GetLeadByIdHandler(prisma as any);
    await handler.execute(new GetLeadByIdQuery('lead-1'));

    expect(prisma.working.lead.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          activities: expect.any(Object),
          demos: expect.any(Object),
          quotations: expect.any(Object),
        }),
      }),
    );
  });

  it('should return isTerminal=true for a terminal status like LOST', async () => {
    const prisma = makePrisma({ ...mockLead, status: 'LOST' });
    const handler = new GetLeadByIdHandler(prisma as any);
    const result = await handler.execute(new GetLeadByIdQuery('lead-1'));
    expect(result.isTerminal).toBe(true);
    expect(result.validNextStatuses).toHaveLength(0);
  });

  it('should return isTerminal=false for an active status like NEW', async () => {
    const prisma = makePrisma({ ...mockLead, status: 'NEW' });
    const handler = new GetLeadByIdHandler(prisma as any);
    const result = await handler.execute(new GetLeadByIdQuery('lead-1'));
    expect(result.isTerminal).toBe(false);
    expect(result.validNextStatuses.length).toBeGreaterThan(0);
  });
});
