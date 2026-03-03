import { NotFoundException } from '@nestjs/common';
import { SetPrimaryContactHandler } from '../../application/commands/set-primary-contact/set-primary-contact.handler';
import { SetPrimaryContactCommand } from '../../application/commands/set-primary-contact/set-primary-contact.command';
import { ContactOrganizationEntity } from '../../domain/entities/contact-organization.entity';

describe('SetPrimaryContactHandler', () => {
  let handler: SetPrimaryContactHandler;
  let repo: any;
  let prisma: any;

  beforeEach(() => {
    repo = { findById: jest.fn() };
    prisma = { contactOrganization: { updateMany: jest.fn(), update: jest.fn() } };
    handler = new SetPrimaryContactHandler(repo, prisma);
  });

  it('should set as primary and unset others', async () => {
    const mapping = ContactOrganizationEntity.create('m-1', { contactId: 'c-1', organizationId: 'org-1' });
    repo.findById.mockResolvedValue(mapping);
    await handler.execute(new SetPrimaryContactCommand('m-1'));
    expect(prisma.contactOrganization.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.contactOrganization.update).toHaveBeenCalledTimes(1);
  });

  it('should skip if already primary', async () => {
    const mapping = ContactOrganizationEntity.create('m-1', {
      contactId: 'c-1', organizationId: 'org-1', isPrimary: true,
    });
    repo.findById.mockResolvedValue(mapping);
    await handler.execute(new SetPrimaryContactCommand('m-1'));
    expect(prisma.contactOrganization.updateMany).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new SetPrimaryContactCommand('m-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when deactivated', async () => {
    const mapping = ContactOrganizationEntity.create('m-1', { contactId: 'c-1', organizationId: 'org-1' });
    mapping.deactivate();
    repo.findById.mockResolvedValue(mapping);
    await expect(handler.execute(new SetPrimaryContactCommand('m-1')))
      .rejects.toThrow('Cannot set primary on deactivated');
  });
});
