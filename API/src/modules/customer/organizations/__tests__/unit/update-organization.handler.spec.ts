import { NotFoundException } from '@nestjs/common';
import { UpdateOrganizationHandler } from '../../application/commands/update-organization/update-organization.handler';
import { UpdateOrganizationCommand } from '../../application/commands/update-organization/update-organization.command';
import { OrganizationEntity } from '../../domain/entities/organization.entity';

describe('UpdateOrganizationHandler', () => {
  let handler: UpdateOrganizationHandler;
  let repo: any;
  let publisher: any;
  let prisma: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    prisma = {
      organizationFilter: { deleteMany: jest.fn(), createMany: jest.fn() },
    };
    handler = new UpdateOrganizationHandler(repo, publisher, prisma);
  });

  it('should update active organization', async () => {
    const org = OrganizationEntity.create('org-1', { name: 'Old', createdById: 'u-1' });
    repo.findById.mockResolvedValue(org);

    await handler.execute(new UpdateOrganizationCommand('org-1', { name: 'New Name' }));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should replace filters when provided', async () => {
    const org = OrganizationEntity.create('org-1', { name: 'Corp', createdById: 'u-1' });
    repo.findById.mockResolvedValue(org);

    await handler.execute(
      new UpdateOrganizationCommand('org-1', { city: 'Delhi' }, ['f-1', 'f-2']),
    );
    expect(prisma.organizationFilter.deleteMany).toHaveBeenCalledTimes(1);
    expect(prisma.organizationFilter.createMany).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(
      handler.execute(new UpdateOrganizationCommand('org-999', { name: 'X' })),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw when deactivated', async () => {
    const org = OrganizationEntity.create('org-1', { name: 'Corp', createdById: 'u-1' });
    org.deactivate();
    repo.findById.mockResolvedValue(org);

    await expect(
      handler.execute(new UpdateOrganizationCommand('org-1', { name: 'New' })),
    ).rejects.toThrow('Cannot update deactivated');
  });
});
