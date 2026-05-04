import { RecycleBinController } from '../recycle-bin.controller';

const makeContact = (overrides = {}) => ({
  id: 'c-1', firstName: 'Rahul', lastName: 'Sharma',
  designation: 'Manager', isDeleted: true, deletedAt: new Date('2026-01-10'), deletedById: 'user-1',
  ...overrides,
});

const makeOrg = (overrides = {}) => ({
  id: 'o-1', name: 'Acme Corp', industry: 'IT',
  isDeleted: true, deletedAt: new Date('2026-01-09'), deletedById: 'user-1',
  ...overrides,
});

// Helper to call controller and cast to any (ApiResponse typing)
async function getAll(ctrl: RecycleBinController, entityType?: string, limit?: string): Promise<any> {
  return ctrl.getAll(entityType, limit);
}

describe('RecycleBinController', () => {
  let controller: RecycleBinController;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      working: {
        contact: { findMany: jest.fn().mockResolvedValue([]) },
        organization: { findMany: jest.fn().mockResolvedValue([]) },
        lead: { findMany: jest.fn().mockResolvedValue([]) },
        activity: { findMany: jest.fn().mockResolvedValue([]) },
        rawContact: { findMany: jest.fn().mockResolvedValue([]) },
      },
      user: { findMany: jest.fn().mockResolvedValue([]) },
    };
    controller = new RecycleBinController(prisma);
  });

  afterEach(() => jest.clearAllMocks());

  it('should return contacts in recycle bin', async () => {
    prisma.working.contact.findMany.mockResolvedValue([makeContact()]);
    const result = await getAll(controller);
    expect(result.data.some((i: any) => i.entityType === 'contact')).toBe(true);
    expect(result.data[0].name).toBe('Rahul Sharma');
  });

  it('should return empty array when recycle bin is empty', async () => {
    const result = await getAll(controller);
    expect(result.data).toEqual([]);
  });

  it('should filter by entityType=contact and skip other entities', async () => {
    prisma.working.contact.findMany.mockResolvedValue([makeContact()]);
    const result = await getAll(controller, 'contact');
    expect(result.data).toHaveLength(1);
    expect(prisma.working.organization.findMany).not.toHaveBeenCalled();
  });

  it('should filter by entityType=organization', async () => {
    prisma.working.organization.findMany.mockResolvedValue([makeOrg()]);
    const result = await getAll(controller, 'organization');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].entityType).toBe('organization');
    expect(prisma.working.contact.findMany).not.toHaveBeenCalled();
  });

  it('should resolve deletedBy user name in batch', async () => {
    prisma.working.contact.findMany.mockResolvedValue([makeContact({ deletedById: 'user-1' })]);
    prisma.user.findMany.mockResolvedValue([{ id: 'user-1', firstName: 'Admin', lastName: 'User' }]);
    const result = await getAll(controller, 'contact');
    expect(result.data[0].deletedBy).toBe('Admin User');
  });

  it('should sort items by deletedAt descending', async () => {
    const old = makeContact({ id: 'c-old', deletedAt: new Date('2026-01-01') });
    const recent = makeOrg({ id: 'o-new', deletedAt: new Date('2026-03-01') });
    prisma.working.contact.findMany.mockResolvedValue([old]);
    prisma.working.organization.findMany.mockResolvedValue([recent]);
    const result = await getAll(controller);
    expect(result.data[0].id).toBe('o-new');
    expect(result.data[1].id).toBe('c-old');
  });

  it('should include subtitle for organizations', async () => {
    prisma.working.organization.findMany.mockResolvedValue([makeOrg()]);
    const result = await getAll(controller, 'organization');
    expect(result.data[0].subtitle).toBe('IT');
  });

  it('should respect limit parameter', async () => {
    prisma.working.contact.findMany.mockResolvedValue([]);
    await getAll(controller, 'contact', '5');
    expect(prisma.working.contact.findMany.mock.calls[0][0].take).toBe(5);
  });
});
