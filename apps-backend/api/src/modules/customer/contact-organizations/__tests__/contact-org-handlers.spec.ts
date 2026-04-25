// @ts-nocheck
import { NotFoundException, ConflictException } from '@nestjs/common';

// ─── Shared fixtures ─────────────────────────────────────────────────────────
const makeMappingEntity = (overrides: any = {}) => ({
  id: 'mapping-1',
  contactId: 'contact-1',
  organizationId: 'org-1',
  relationType: { value: 'EMPLOYEE' },
  isPrimary: false,
  isActive: true,
  designation: 'Manager',
  department: 'Sales',
  changeRelationType: jest.fn(),
  reactivate: jest.fn(),
  deactivate: jest.fn(),
  commit: jest.fn(),
  ...overrides,
});

const makePrisma = () => {
  const p: any = {
    contact: { findUnique: jest.fn() },
    organization: { findUnique: jest.fn() },
    contactOrganization: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  p.working = p;
  return p;
};

const makeRepo = (entity: any = null) => ({
  findById: jest.fn().mockResolvedValue(entity ?? makeMappingEntity()),
  findByContactAndOrg: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
});

const makePublisher = () => ({
  mergeObjectContext: jest.fn((e: any) => {
    if (!e.commit) e.commit = jest.fn();
    return e;
  }),
});

// ─── Imports ─────────────────────────────────────────────────────────────────
import { ChangeRelationTypeHandler } from '../application/commands/change-relation-type/change-relation-type.handler';
import { ChangeRelationTypeCommand } from '../application/commands/change-relation-type/change-relation-type.command';
import { LinkContactToOrgHandler } from '../application/commands/link-contact-to-org/link-contact-to-org.handler';
import { LinkContactToOrgCommand } from '../application/commands/link-contact-to-org/link-contact-to-org.command';
import { SetPrimaryContactHandler } from '../application/commands/set-primary-contact/set-primary-contact.handler';
import { SetPrimaryContactCommand } from '../application/commands/set-primary-contact/set-primary-contact.command';
import { UnlinkContactFromOrgHandler } from '../application/commands/unlink-contact-from-org/unlink-contact-from-org.handler';
import { UnlinkContactFromOrgCommand } from '../application/commands/unlink-contact-from-org/unlink-contact-from-org.command';
import { UpdateMappingHandler } from '../application/commands/update-mapping/update-mapping.handler';
import { UpdateMappingCommand } from '../application/commands/update-mapping/update-mapping.command';
import { GetOrgsByContactHandler } from '../application/queries/get-by-contact/get-by-contact.handler';
import { GetOrgsByContactQuery } from '../application/queries/get-by-contact/get-by-contact.query';
import { GetContactOrgByIdHandler } from '../application/queries/get-by-id/get-by-id.handler';
import { GetContactOrgByIdQuery } from '../application/queries/get-by-id/get-by-id.query';
import { GetContactsByOrgHandler } from '../application/queries/get-by-organization/get-by-organization.handler';
import { GetContactsByOrgQuery } from '../application/queries/get-by-organization/get-by-organization.query';

// ═══════════════════════════════════════════════════════════════════════════════
// ChangeRelationTypeHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('ChangeRelationTypeHandler', () => {
  let handler: ChangeRelationTypeHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = makeRepo();
    publisher = makePublisher();
    handler = new ChangeRelationTypeHandler(repo, publisher);
  });

  it('should change relation type on active mapping', async () => {
    await handler.execute(new ChangeRelationTypeCommand('mapping-1', 'CONSULTANT'));
    expect(repo.save).toHaveBeenCalledTimes(1);
    const entity = repo.save.mock.calls[0][0];
    expect(entity.changeRelationType).toHaveBeenCalledWith('CONSULTANT');
  });

  it('should throw NotFoundException when mapping not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new ChangeRelationTypeCommand('missing', 'CONSULTANT'))).rejects.toThrow(NotFoundException);
  });

  it('should throw when mapping is deactivated', async () => {
    repo.findById.mockResolvedValue(makeMappingEntity({ isActive: false }));
    await expect(handler.execute(new ChangeRelationTypeCommand('mapping-1', 'CONSULTANT'))).rejects.toThrow('Cannot change relation on deactivated mapping');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LinkContactToOrgHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('LinkContactToOrgHandler', () => {
  let handler: LinkContactToOrgHandler;
  let repo: any;
  let publisher: any;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    repo = makeRepo();
    publisher = makePublisher();
    prisma.contact.findUnique.mockResolvedValue({ id: 'contact-1', isActive: true });
    prisma.organization.findUnique.mockResolvedValue({ id: 'org-1', isActive: true });
    handler = new LinkContactToOrgHandler(repo, publisher, prisma);
  });

  it('should link contact to org and return mapping id', async () => {
    const id = await handler.execute(new LinkContactToOrgCommand('contact-1', 'org-1', 'EMPLOYEE', false));
    expect(id).toBeDefined();
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException when contact not found', async () => {
    prisma.contact.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new LinkContactToOrgCommand('missing', 'org-1'))).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when organization not found', async () => {
    prisma.organization.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new LinkContactToOrgCommand('contact-1', 'missing'))).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException when active link already exists', async () => {
    repo.findByContactAndOrg.mockResolvedValue(makeMappingEntity({ isActive: true }));
    await expect(handler.execute(new LinkContactToOrgCommand('contact-1', 'org-1'))).rejects.toThrow(ConflictException);
  });

  it('should reactivate deactivated link instead of creating new', async () => {
    const deactivated = makeMappingEntity({ isActive: false, id: 'mapping-existing' });
    repo.findByContactAndOrg.mockResolvedValue(deactivated);
    const id = await handler.execute(new LinkContactToOrgCommand('contact-1', 'org-1'));
    expect(id).toBe('mapping-existing');
    expect(deactivated.reactivate).toHaveBeenCalled();
  });

  it('should unset existing primary when isPrimary=true', async () => {
    prisma.contactOrganization.updateMany.mockResolvedValue({ count: 1 });
    await handler.execute(new LinkContactToOrgCommand('contact-1', 'org-1', 'EMPLOYEE', true));
    expect(prisma.contactOrganization.updateMany).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SetPrimaryContactHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('SetPrimaryContactHandler', () => {
  let handler: SetPrimaryContactHandler;
  let repo: any;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    repo = makeRepo(makeMappingEntity({ isPrimary: false, isActive: true }));
    handler = new SetPrimaryContactHandler(repo, prisma);
  });

  it('should set contact as primary for the organization', async () => {
    prisma.contactOrganization.updateMany.mockResolvedValue({ count: 1 });
    prisma.contactOrganization.update.mockResolvedValue({});
    await handler.execute(new SetPrimaryContactCommand('mapping-1'));
    expect(prisma.contactOrganization.updateMany).toHaveBeenCalled();
    expect(prisma.contactOrganization.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isPrimary: true } }),
    );
  });

  it('should skip if already primary', async () => {
    repo.findById.mockResolvedValue(makeMappingEntity({ isPrimary: true }));
    await handler.execute(new SetPrimaryContactCommand('mapping-1'));
    expect(prisma.contactOrganization.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when mapping not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new SetPrimaryContactCommand('missing'))).rejects.toThrow(NotFoundException);
  });

  it('should throw when mapping is deactivated', async () => {
    repo.findById.mockResolvedValue(makeMappingEntity({ isActive: false, isPrimary: false }));
    await expect(handler.execute(new SetPrimaryContactCommand('mapping-1'))).rejects.toThrow('Cannot set primary on deactivated mapping');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// UnlinkContactFromOrgHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('UnlinkContactFromOrgHandler', () => {
  let handler: UnlinkContactFromOrgHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = makeRepo();
    publisher = makePublisher();
    handler = new UnlinkContactFromOrgHandler(repo, publisher);
  });

  it('should unlink (deactivate) mapping', async () => {
    await handler.execute(new UnlinkContactFromOrgCommand('mapping-1'));
    expect(repo.save).toHaveBeenCalledTimes(1);
    const entity = repo.save.mock.calls[0][0];
    expect(entity.deactivate).toHaveBeenCalled();
  });

  it('should throw NotFoundException when mapping not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new UnlinkContactFromOrgCommand('missing'))).rejects.toThrow(NotFoundException);
  });

  it('should throw when already deactivated', async () => {
    repo.findById.mockResolvedValue(makeMappingEntity({ isActive: false }));
    await expect(handler.execute(new UnlinkContactFromOrgCommand('mapping-1'))).rejects.toThrow('Mapping is already deactivated');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// UpdateMappingHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('UpdateMappingHandler', () => {
  let handler: UpdateMappingHandler;
  let repo: any;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    repo = makeRepo();
    handler = new UpdateMappingHandler(repo, prisma);
  });

  it('should update mapping designation and department', async () => {
    prisma.contactOrganization.update.mockResolvedValue({});
    await handler.execute(new UpdateMappingCommand('mapping-1', { designation: 'Director', department: 'Engineering' }));
    expect(prisma.contactOrganization.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { designation: 'Director', department: 'Engineering' } }),
    );
  });

  it('should throw NotFoundException when mapping not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new UpdateMappingCommand('missing', { designation: 'x' }))).rejects.toThrow(NotFoundException);
  });

  it('should throw when mapping is deactivated', async () => {
    repo.findById.mockResolvedValue(makeMappingEntity({ isActive: false }));
    await expect(handler.execute(new UpdateMappingCommand('mapping-1', { designation: 'x' }))).rejects.toThrow('Cannot update deactivated mapping');
  });

  it('should throw when no fields to update', async () => {
    await expect(handler.execute(new UpdateMappingCommand('mapping-1', {}))).rejects.toThrow('No fields provided to update');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetOrgsByContactHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetOrgsByContactHandler', () => {
  let handler: GetOrgsByContactHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new GetOrgsByContactHandler(prisma);
  });

  it('should return organizations for a contact filtered by active', async () => {
    prisma.contactOrganization.findMany.mockResolvedValue([{ id: 'mapping-1' }]);
    const result = await handler.execute(new GetOrgsByContactQuery('contact-1'));
    expect(prisma.contactOrganization.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ contactId: 'contact-1', isActive: true }) }),
    );
    expect(result).toHaveLength(1);
  });

  it('should not filter by isActive when activeOnly=false', async () => {
    prisma.contactOrganization.findMany.mockResolvedValue([]);
    await handler.execute(new GetOrgsByContactQuery('contact-1', false));
    const call = prisma.contactOrganization.findMany.mock.calls[0][0];
    expect(call.where.isActive).toBeUndefined();
  });

  it('should propagate DB error', async () => {
    prisma.contactOrganization.findMany.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new GetOrgsByContactQuery('contact-1'))).rejects.toThrow('DB error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetContactOrgByIdHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetContactOrgByIdHandler', () => {
  let handler: GetContactOrgByIdHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new GetContactOrgByIdHandler(prisma);
  });

  it('should return mapping by id', async () => {
    const mapping = { id: 'mapping-1', contactId: 'contact-1', organizationId: 'org-1' };
    prisma.contactOrganization.findUnique.mockResolvedValue(mapping);
    const result = await handler.execute(new GetContactOrgByIdQuery('mapping-1'));
    expect(result).toEqual(mapping);
  });

  it('should throw NotFoundException when not found', async () => {
    prisma.contactOrganization.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new GetContactOrgByIdQuery('missing'))).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetContactsByOrgHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetContactsByOrgHandler', () => {
  let handler: GetContactsByOrgHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new GetContactsByOrgHandler(prisma);
  });

  it('should return contacts for an organization filtered by active', async () => {
    prisma.contactOrganization.findMany.mockResolvedValue([{ id: 'mapping-1' }]);
    const result = await handler.execute(new GetContactsByOrgQuery('org-1'));
    expect(prisma.contactOrganization.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ organizationId: 'org-1', isActive: true }) }),
    );
    expect(result).toHaveLength(1);
  });

  it('should not filter by isActive when activeOnly=false', async () => {
    prisma.contactOrganization.findMany.mockResolvedValue([]);
    await handler.execute(new GetContactsByOrgQuery('org-1', false));
    const call = prisma.contactOrganization.findMany.mock.calls[0][0];
    expect(call.where.isActive).toBeUndefined();
  });

  it('should propagate DB error', async () => {
    prisma.contactOrganization.findMany.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new GetContactsByOrgQuery('org-1'))).rejects.toThrow('DB error');
  });
});
