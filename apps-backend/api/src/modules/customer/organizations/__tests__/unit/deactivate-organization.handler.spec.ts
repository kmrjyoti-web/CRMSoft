import { NotFoundException } from '@nestjs/common';
import { DeactivateOrganizationHandler } from '../../application/commands/deactivate-organization/deactivate-organization.handler';
import { DeactivateOrganizationCommand } from '../../application/commands/deactivate-organization/deactivate-organization.command';
import { OrganizationEntity } from '../../domain/entities/organization.entity';

describe('DeactivateOrganizationHandler', () => {
  let handler: DeactivateOrganizationHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new DeactivateOrganizationHandler(repo, publisher);
  });

  it('should deactivate active org', async () => {
    const org = OrganizationEntity.create('org-1', { name: 'Corp', createdById: 'u-1' });
    repo.findById.mockResolvedValue(org);

    await handler.execute(new DeactivateOrganizationCommand('org-1'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new DeactivateOrganizationCommand('org-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when already deactivated', async () => {
    const org = OrganizationEntity.create('org-1', { name: 'Corp', createdById: 'u-1' });
    org.deactivate();
    repo.findById.mockResolvedValue(org);

    await expect(handler.execute(new DeactivateOrganizationCommand('org-1')))
      .rejects.toThrow('already deactivated');
  });
});
