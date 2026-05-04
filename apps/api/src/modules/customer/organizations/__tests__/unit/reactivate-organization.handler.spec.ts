import { NotFoundException } from '@nestjs/common';
import { ReactivateOrganizationHandler } from '../../application/commands/reactivate-organization/reactivate-organization.handler';
import { ReactivateOrganizationCommand } from '../../application/commands/reactivate-organization/reactivate-organization.command';
import { OrganizationEntity } from '../../domain/entities/organization.entity';

describe('ReactivateOrganizationHandler', () => {
  let handler: ReactivateOrganizationHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new ReactivateOrganizationHandler(repo, publisher);
  });

  it('should reactivate deactivated org', async () => {
    const org = OrganizationEntity.create('org-1', { name: 'Corp', createdById: 'u-1' });
    org.deactivate();
    repo.findById.mockResolvedValue(org);

    await handler.execute(new ReactivateOrganizationCommand('org-1'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new ReactivateOrganizationCommand('org-999')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw when already active', async () => {
    const org = OrganizationEntity.create('org-1', { name: 'Corp', createdById: 'u-1' });
    repo.findById.mockResolvedValue(org);

    await expect(handler.execute(new ReactivateOrganizationCommand('org-1')))
      .rejects.toThrow('already active');
  });
});
