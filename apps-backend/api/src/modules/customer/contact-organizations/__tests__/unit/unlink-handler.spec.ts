import { NotFoundException } from '@nestjs/common';
import { UnlinkContactFromOrgHandler } from '../../application/commands/unlink-contact-from-org/unlink-contact-from-org.handler';
import { UnlinkContactFromOrgCommand } from '../../application/commands/unlink-contact-from-org/unlink-contact-from-org.command';
import { ContactOrganizationEntity } from '../../domain/entities/contact-organization.entity';

describe('UnlinkContactFromOrgHandler', () => {
  let handler: UnlinkContactFromOrgHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new UnlinkContactFromOrgHandler(repo, publisher);
  });

  it('should deactivate active mapping', async () => {
    const mapping = ContactOrganizationEntity.create('m-1', { contactId: 'c-1', organizationId: 'org-1' });
    repo.findById.mockResolvedValue(mapping);
    await handler.execute(new UnlinkContactFromOrgCommand('m-1'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new UnlinkContactFromOrgCommand('m-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when already deactivated', async () => {
    const mapping = ContactOrganizationEntity.create('m-1', { contactId: 'c-1', organizationId: 'org-1' });
    mapping.deactivate();
    repo.findById.mockResolvedValue(mapping);
    await expect(handler.execute(new UnlinkContactFromOrgCommand('m-1')))
      .rejects.toThrow('already deactivated');
  });
});
