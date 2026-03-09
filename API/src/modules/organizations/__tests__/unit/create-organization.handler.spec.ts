import { ConflictException } from '@nestjs/common';
import { CreateOrganizationHandler } from '../../application/commands/create-organization/create-organization.handler';
import { CreateOrganizationCommand } from '../../application/commands/create-organization/create-organization.command';
import { OrganizationEntity } from '../../domain/entities/organization.entity';

describe('CreateOrganizationHandler', () => {
  let handler: CreateOrganizationHandler;
  let repo: any;
  let publisher: any;
  let prisma: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn(), findByName: jest.fn().mockResolvedValue(null) };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    prisma = { organizationFilter: { createMany: jest.fn() } };
    handler = new CreateOrganizationHandler(repo, publisher, prisma);
  });

  it('should create organization and return UUID', async () => {
    const id = await handler.execute(
      new CreateOrganizationCommand('TechCorp', 'user-1'),
    );
    expect(id).toBeDefined();
    expect(id.length).toBe(36);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should create filter associations', async () => {
    await handler.execute(
      new CreateOrganizationCommand(
        'TechCorp', 'user-1', undefined, undefined, undefined,
        undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined, ['f-1', 'f-2'],
      ),
    );
    expect(prisma.organizationFilter.createMany).toHaveBeenCalledTimes(1);
  });

  it('should throw ConflictException on duplicate name', async () => {
    repo.findByName.mockResolvedValue(
      OrganizationEntity.create('existing', { name: 'TechCorp', createdById: 'u-1' }),
    );
    await expect(
      handler.execute(new CreateOrganizationCommand('TechCorp', 'user-1')),
    ).rejects.toThrow(ConflictException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw when name too short', async () => {
    await expect(
      handler.execute(new CreateOrganizationCommand('A', 'user-1')),
    ).rejects.toThrow('at least 2 characters');
  });

  it('should throw when email invalid', async () => {
    await expect(
      handler.execute(new CreateOrganizationCommand('Corp', 'user-1', undefined, 'bad')),
    ).rejects.toThrow('Invalid email');
  });
});
