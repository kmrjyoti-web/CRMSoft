import { TeamPerformanceService } from '../../services/team-performance.service';

describe('Team Performance & Leaderboard', () => {
  let prisma: any;
  let service: TeamPerformanceService;

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'u1', firstName: 'Alice', lastName: 'Smith', avatar: null, role: { name: 'Sales' } },
          { id: 'u2', firstName: 'Bob', lastName: 'Jones', avatar: null, role: { name: 'Sales' } },
        ]),
      },
      lead: {
        count: jest.fn().mockResolvedValue(5),
      },
      activity: {
        findMany: jest.fn().mockResolvedValue([
          { type: 'CALL' }, { type: 'CALL' }, { type: 'EMAIL' }, { type: 'MEETING' },
        ]),
      },
      demo: {
        groupBy: jest.fn().mockResolvedValue([
          { status: 'COMPLETED', _count: 3 },
          { status: 'SCHEDULED', _count: 1 },
        ]),
      },
      quotation: {
        findMany: jest.fn().mockResolvedValue([
          { status: 'SENT', totalAmount: 10000 },
          { status: 'ACCEPTED', totalAmount: 20000 },
        ]),
      },
      tourPlan: { count: jest.fn().mockResolvedValue(2) },
    };
    service = new TeamPerformanceService(prisma);
  });

  it('should return metrics for all active users', async () => {
    const result = await service.getTeamPerformance({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result.users).toHaveLength(2);
    expect(result.users[0]).toHaveProperty('leads');
    expect(result.users[0]).toHaveProperty('activities');
    expect(result.users[0]).toHaveProperty('demos');
    expect(result.users[0]).toHaveProperty('quotations');
    expect(result.users[0]).toHaveProperty('performanceScore');
  });

  it('should sort users by performance score descending', async () => {
    const result = await service.getTeamPerformance({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    for (let i = 1; i < result.users.length; i++) {
      expect(result.users[i - 1].performanceScore).toBeGreaterThanOrEqual(result.users[i].performanceScore);
    }
  });

  it('should include team summary with top performer', async () => {
    const result = await service.getTeamPerformance({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result.teamSummary.totalUsers).toBe(2);
    expect(result.teamSummary.topPerformer).toBeDefined();
    expect(result.teamSummary.topPerformer!.name).toBeDefined();
    expect(result.teamSummary.needsAttention).toBeDefined();
  });

  it('should return leaderboard sorted by chosen metric', async () => {
    const result = await service.getLeaderboard({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
      metric: 'revenue',
    });
    expect(result.metric).toBe('revenue');
    expect(result.rankings).toBeDefined();
    expect(result.rankings.length).toBeLessThanOrEqual(10);
    if (result.rankings.length > 0) {
      expect(result.rankings[0]).toHaveProperty('rank');
      expect(result.rankings[0]).toHaveProperty('value');
      expect(result.rankings[0].rank).toBe(1);
    }
  });

  it('should include myRank when currentUserId is provided', async () => {
    const result = await service.getLeaderboard({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
      metric: 'score', currentUserId: 'u1',
    });
    expect(result.myRank).toBeDefined();
    expect(result.myRank.rank).toBeGreaterThanOrEqual(1);
    expect(result.myRank).toHaveProperty('outOf');
  });
});
