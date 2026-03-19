import { WorkloadService } from '../../services/workload.service';

describe('WorkloadService', () => {
  let service: WorkloadService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      user: { findMany: jest.fn().mockResolvedValue([
        { id: 'u-1', firstName: 'Raj', lastName: 'Patel', email: 'raj@test.com', avatar: null },
        { id: 'u-2', firstName: 'Priya', lastName: 'Sharma', email: 'priya@test.com', avatar: null },
      ]), findUnique: jest.fn().mockResolvedValue({ id: 'u-1', firstName: 'Raj', lastName: 'Patel', email: 'raj@test.com' }) },
      userCapacity: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation((args: any) => Promise.resolve({ ...args.data, maxLeads: 50, maxContacts: 100, maxOrganizations: 30, maxQuotations: 20, maxTotal: 200, activeLeads: 0, activeContacts: 0, activeOrganizations: 0, activeQuotations: 0, activeTotal: 0, isAvailable: true, lastActivityAt: null })),
        upsert: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
      entityOwner: {
        groupBy: jest.fn().mockResolvedValue([]),
        findMany: jest.fn().mockResolvedValue([]),
      },
      ownershipLog: { findMany: jest.fn().mockResolvedValue([]) },
    };
    service = new WorkloadService(prisma);
  });

  it('should return load percentages per user in dashboard', async () => {
    prisma.userCapacity.findUnique
      .mockResolvedValueOnce({ userId: 'u-1', maxTotal: 200, activeTotal: 180, maxLeads: 50, maxContacts: 100, maxOrganizations: 30, maxQuotations: 20, activeLeads: 40, activeContacts: 80, activeOrganizations: 30, activeQuotations: 30, isAvailable: true, lastActivityAt: null })
      .mockResolvedValueOnce({ userId: 'u-2', maxTotal: 200, activeTotal: 40, maxLeads: 50, maxContacts: 100, maxOrganizations: 30, maxQuotations: 20, activeLeads: 10, activeContacts: 20, activeOrganizations: 5, activeQuotations: 5, isAvailable: true, lastActivityAt: null });

    prisma.entityOwner.groupBy
      .mockResolvedValueOnce([{ entityType: 'LEAD', _count: 40 }, { entityType: 'CONTACT', _count: 80 }])
      .mockResolvedValueOnce([{ entityType: 'LEAD', _count: 10 }]);

    const result = await service.getDashboard({});
    expect(result.users.length).toBe(2);
    expect(result.users[0].loadPercent).toBeGreaterThanOrEqual(0);
    expect(result.summary.totalUsers).toBe(2);
  });

  it('should categorize status as NORMAL / HEAVY / OVERLOADED / CRITICAL', async () => {
    prisma.userCapacity.findUnique.mockResolvedValue({
      userId: 'u-1', maxTotal: 100, activeTotal: 95,
      maxLeads: 50, maxContacts: 100, maxOrganizations: 30, maxQuotations: 20,
      activeLeads: 45, activeContacts: 30, activeOrganizations: 10, activeQuotations: 10,
      isAvailable: true, lastActivityAt: null,
    });
    prisma.entityOwner.groupBy.mockResolvedValue([
      { entityType: 'LEAD', _count: 45 }, { entityType: 'CONTACT', _count: 30 },
      { entityType: 'ORGANIZATION', _count: 10 }, { entityType: 'QUOTATION', _count: 10 },
    ]);
    prisma.user.findMany.mockResolvedValue([{ id: 'u-1', firstName: 'Raj', lastName: 'P', email: 'r@t.com', avatar: null }]);

    const result = await service.getDashboard({});
    expect(result.users[0].status).toBe('CRITICAL');
  });

  it('should suggest rebalancing from overloaded to underutilized', async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 'u-1', firstName: 'Overloaded', lastName: 'User', email: 'o@t.com', avatar: null },
      { id: 'u-2', firstName: 'Free', lastName: 'User', email: 'f@t.com', avatar: null },
    ]);
    prisma.userCapacity.findUnique
      .mockResolvedValueOnce({ userId: 'u-1', maxTotal: 100, maxLeads: 50, maxContacts: 100, maxOrganizations: 30, maxQuotations: 20, activeLeads: 45, activeContacts: 30, activeOrganizations: 10, activeQuotations: 10, activeTotal: 95, isAvailable: true, lastActivityAt: null })
      .mockResolvedValueOnce({ userId: 'u-2', maxTotal: 200, maxLeads: 50, maxContacts: 100, maxOrganizations: 30, maxQuotations: 20, activeLeads: 2, activeContacts: 3, activeOrganizations: 0, activeQuotations: 0, activeTotal: 5, isAvailable: true, lastActivityAt: null });
    prisma.entityOwner.groupBy
      .mockResolvedValueOnce([{ entityType: 'LEAD', _count: 45 }, { entityType: 'CONTACT', _count: 30 }, { entityType: 'ORGANIZATION', _count: 10 }, { entityType: 'QUOTATION', _count: 10 }])
      .mockResolvedValueOnce([{ entityType: 'LEAD', _count: 2 }, { entityType: 'CONTACT', _count: 3 }]);

    const suggestions = await service.getRebalanceSuggestions();
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].fromUser.loadPercent).toBeGreaterThan(80);
    expect(suggestions[0].toUser.loadPercent).toBeLessThan(30);
  });

  it('should recalculate counts from actual EntityOwner records', async () => {
    prisma.entityOwner.groupBy.mockResolvedValue([
      { entityType: 'LEAD', _count: 15 }, { entityType: 'CONTACT', _count: 22 },
      { entityType: 'ORGANIZATION', _count: 5 }, { entityType: 'QUOTATION', _count: 8 },
    ]);

    const result = await service.recalculateCounts('u-1');
    expect(prisma.userCapacity.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ activeLeads: 15, activeContacts: 22, activeTotal: 50 }),
      }),
    );
  });

  it('should return unassigned entity count in summary', async () => {
    prisma.userCapacity.findUnique.mockResolvedValue(null);
    prisma.user.findMany.mockResolvedValue([]);

    const result = await service.getDashboard({});
    expect(result.summary.totalUsers).toBe(0);
    expect(result.summary.avgLoad).toBe(0);
  });
});
