import { NotFoundException } from '@nestjs/common';
import { LinkToEntityHandler } from '../../application/commands/link-to-entity/link-to-entity.handler';
import { LinkToEntityCommand } from '../../application/commands/link-to-entity/link-to-entity.command';
import { CommunicationEntity } from '../../domain/entities/communication.entity';

describe('LinkToEntityHandler', () => {
  let handler: LinkToEntityHandler;
  let repo: any;
  let prisma: any;

  beforeEach(() => {
    repo = { findById: jest.fn() };
    prisma = { communication: { update: jest.fn() } };
(prisma as any).working = prisma;
    handler = new LinkToEntityHandler(repo, prisma);
  });

  it('should link to contact', async () => {
    const comm = CommunicationEntity.create('comm-1', {
      type: 'PHONE', value: '+91-9876543210', rawContactId: 'rc-1',
    });
    repo.findById.mockResolvedValue(comm);
    await handler.execute(new LinkToEntityCommand('comm-1', 'contact', 'c-1'));
    expect(prisma.communication.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { contactId: 'c-1' } }),
    );
  });

  it('should link to organization', async () => {
    const comm = CommunicationEntity.create('comm-1', {
      type: 'PHONE', value: '+91-9876543210', contactId: 'c-1',
    });
    repo.findById.mockResolvedValue(comm);
    await handler.execute(new LinkToEntityCommand('comm-1', 'organization', 'org-1'));
    expect(prisma.communication.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { organizationId: 'org-1' } }),
    );
  });

  it('should link to lead', async () => {
    const comm = CommunicationEntity.create('comm-1', {
      type: 'PHONE', value: '+91-9876543210', contactId: 'c-1',
    });
    repo.findById.mockResolvedValue(comm);
    await handler.execute(new LinkToEntityCommand('comm-1', 'lead', 'lead-1'));
    expect(prisma.communication.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { leadId: 'lead-1' } }),
    );
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new LinkToEntityCommand('comm-999', 'contact', 'c-1')))
      .rejects.toThrow(NotFoundException);
  });
});
