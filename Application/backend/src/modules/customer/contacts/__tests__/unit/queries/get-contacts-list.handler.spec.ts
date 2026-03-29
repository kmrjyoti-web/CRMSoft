import { GetContactsListHandler } from '../../../application/queries/get-contacts-list/get-contacts-list.handler';
import { GetContactsListQuery } from '../../../application/queries/get-contacts-list/get-contacts-list.query';

const mockContact = {
  id: 'c-1',
  firstName: 'Raj',
  lastName: 'Patel',
  designation: 'Manager',
  department: 'Sales',
  dataStatus: 'CLEAN',
  isActive: true,
  entityVerificationStatus: 'UNVERIFIED',
  createdAt: new Date(),
  communications: [{ id: 'comm-1', type: 'MOBILE', value: '9876543210', isPrimary: true }],
  contactOrganizations: [{ organization: { id: 'org-1', name: 'Acme Ltd' } }],
};

function makeHandler() {
  const prisma: any = {
    contact: {
      findMany: jest.fn().mockResolvedValue([mockContact]),
      count: jest.fn().mockResolvedValue(1),
    },
  };
  prisma.working = prisma;
  return { handler: new GetContactsListHandler(prisma), prisma };
}

const baseQuery = (overrides: Partial<GetContactsListQuery> = {}) =>
  new GetContactsListQuery(1, 20, 'createdAt', 'desc', ...Object.values(overrides) as any);

describe('GetContactsListHandler', () => {
  it('should return paginated contacts', async () => {
    const { handler } = makeHandler();
    const result = await handler.execute(new GetContactsListQuery(1, 20, 'createdAt', 'desc'));
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should apply search filter with OR clause', async () => {
    const { handler, prisma } = makeHandler();
    await handler.execute(new GetContactsListQuery(1, 20, 'createdAt', 'desc', 'Raj'));
    const where = prisma.contact.findMany.mock.calls[0][0].where;
    expect(where.OR).toBeDefined();
    expect(where.OR.some((c: any) => 'firstName' in c)).toBe(true);
  });

  it('should filter by organizationId', async () => {
    const { handler, prisma } = makeHandler();
    await handler.execute(new GetContactsListQuery(1, 20, 'createdAt', 'desc', undefined, undefined, undefined, undefined, 'org-1'));
    const where = prisma.contact.findMany.mock.calls[0][0].where;
    expect(where.contactOrganizations?.some?.organizationId).toBe('org-1');
  });

  it('should filter by isActive', async () => {
    const { handler, prisma } = makeHandler();
    await handler.execute(new GetContactsListQuery(1, 20, 'createdAt', 'desc', undefined, true));
    const where = prisma.contact.findMany.mock.calls[0][0].where;
    expect(where.isActive).toBe(true);
  });

  it('should return empty result when no contacts match', async () => {
    const { handler, prisma } = makeHandler();
    prisma.contact.findMany.mockResolvedValue([]);
    prisma.contact.count.mockResolvedValue(0);
    const result = await handler.execute(new GetContactsListQuery(1, 20, 'createdAt', 'desc'));
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
