import { ConflictException, NotFoundException } from '@nestjs/common';
import { LinkContactToOrgHandler } from '../../application/commands/link-contact-to-org/link-contact-to-org.handler';
import { LinkContactToOrgCommand } from '../../application/commands/link-contact-to-org/link-contact-to-org.command';
import { ContactOrganizationEntity } from '../../domain/entities/contact-organization.entity';

describe('LinkContactToOrgHandler', () => {
  let handler: LinkContactToOrgHandler;
  let repo: any;
  let publisher: any;
  let prisma: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn(), findByContactAndOrg: jest.fn().mockResolvedValue(null) };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    prisma = {
      contact: { findUnique: jest.fn().mockResolvedValue({ id: 'c-1', isActive: true }) },
      organization: { findUnique: jest.fn().mockResolvedValue({ id: 'org-1', isActive: true }) },
      contactOrganization: { updateMany: jest.fn() },
    };
(prisma as any).working = prisma;
    handler = new LinkContactToOrgHandler(repo, publisher, prisma);
  });

  it('should link contact to org', async () => {
    const id = await handler.execute(new LinkContactToOrgCommand('c-1', 'org-1', 'EMPLOYEE'));
    expect(id).toBeDefined();
    expect(id.length).toBe(36);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should unset primary when isPrimary=true', async () => {
    await handler.execute(new LinkContactToOrgCommand('c-1', 'org-1', 'PRIMARY_CONTACT', true));
    expect(prisma.contactOrganization.updateMany).toHaveBeenCalledTimes(1);
  });

  it('should reactivate deactivated link', async () => {
    const deactivated = ContactOrganizationEntity.create('existing', {
      contactId: 'c-1', organizationId: 'org-1',
    });
    deactivated.deactivate();
    repo.findByContactAndOrg.mockResolvedValue(deactivated);

    const id = await handler.execute(new LinkContactToOrgCommand('c-1', 'org-1'));
    expect(id).toBe('existing');
  });

  it('should throw ConflictException on duplicate active link', async () => {
    const active = ContactOrganizationEntity.create('existing', {
      contactId: 'c-1', organizationId: 'org-1',
    });
    repo.findByContactAndOrg.mockResolvedValue(active);

    await expect(handler.execute(new LinkContactToOrgCommand('c-1', 'org-1')))
      .rejects.toThrow(ConflictException);
  });

  it('should throw when contact not found', async () => {
    prisma.contact.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new LinkContactToOrgCommand('c-999', 'org-1')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when org not found', async () => {
    prisma.organization.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new LinkContactToOrgCommand('c-1', 'org-999')))
      .rejects.toThrow(NotFoundException);
  });
});
