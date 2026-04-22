import { NotFoundException } from '@nestjs/common';
import { CreateTargetHandler } from '../application/commands/create-target/create-target.handler';
import { UpdateTargetHandler } from '../application/commands/update-target/update-target.handler';
import { DeleteTargetHandler } from '../application/commands/delete-target/delete-target.handler';
import { ListTargetsHandler } from '../application/queries/list-targets/list-targets.handler';
import { GetTargetHandler } from '../application/queries/get-target/get-target.handler';
import { GetLeaderboardHandler } from '../application/queries/get-leaderboard/get-leaderboard.handler';
import { GetTeamPerformanceHandler } from '../application/queries/get-team-performance/get-team-performance.handler';
import { CreateTargetCommand } from '../application/commands/create-target/create-target.command';
import { UpdateTargetCommand } from '../application/commands/update-target/update-target.command';
import { DeleteTargetCommand } from '../application/commands/delete-target/delete-target.command';
import { ListTargetsQuery } from '../application/queries/list-targets/list-targets.query';
import { GetTargetQuery } from '../application/queries/get-target/get-target.query';
import { GetLeaderboardQuery } from '../application/queries/get-leaderboard/get-leaderboard.query';
import { GetTeamPerformanceQuery } from '../application/queries/get-team-performance/get-team-performance.query';
import { PerformanceController } from '../presentation/performance.controller';

const mockTarget = {
  id: 'target-1',
  name: 'Q1 Revenue',
  metric: 'REVENUE',
  targetValue: 100000,
  currentValue: 75000,
  achievedPercent: 75,
  period: 'MONTHLY',
  periodStart: new Date('2026-01-01'),
  periodEnd: new Date('2026-01-31'),
  userId: 'user-1',
  roleId: 'role-1',
  notes: 'Q1 target',
  createdById: 'admin-1',
  isActive: true,
  isDeleted: false,
};

describe('Performance Handlers', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      working: {
        salesTarget: {
          create: jest.fn().mockResolvedValue(mockTarget),
          update: jest.fn().mockResolvedValue(mockTarget),
          findMany: jest.fn().mockResolvedValue([mockTarget]),
          findFirst: jest.fn().mockResolvedValue(mockTarget),
          count: jest.fn().mockResolvedValue(1),
        },
      },
    };
  });

  // ─── CreateTargetHandler ───────────────────────────────────────────────────

  describe('CreateTargetHandler', () => {
    it('should create salesTarget with correct data', async () => {
      const handler = new CreateTargetHandler(prisma);
      const cmd = new CreateTargetCommand(
        'admin-1',
        'REVENUE',
        100000,
        'MONTHLY',
        '2026-01-01',
        '2026-01-31',
        'Q1 Revenue',
        'user-1',
        'role-1',
        'Q1 target',
      );

      const result = await handler.execute(cmd);

      expect(prisma.working.salesTarget.create).toHaveBeenCalledWith({
        data: {
          name: 'Q1 Revenue',
          metric: 'REVENUE',
          targetValue: 100000,
          period: 'MONTHLY',
          periodStart: new Date('2026-01-01'),
          periodEnd: new Date('2026-01-31'),
          userId: 'user-1',
          roleId: 'role-1',
          notes: 'Q1 target',
          createdById: 'admin-1',
        },
      });
      expect(result.id).toBe('target-1');
    });
  });

  // ─── UpdateTargetHandler ───────────────────────────────────────────────────

  describe('UpdateTargetHandler', () => {
    it('should update target with provided fields', async () => {
      const updatedTarget = { ...mockTarget, name: 'Q1 Revenue Updated', targetValue: 120000 };
      prisma.working.salesTarget.update.mockResolvedValue(updatedTarget);
      const handler = new UpdateTargetHandler(prisma);
      const cmd = new UpdateTargetCommand('target-1', 'admin-1', {
        name: 'Q1 Revenue Updated',
        targetValue: 120000,
      });

      const result = await handler.execute(cmd);

      expect(prisma.working.salesTarget.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'target-1' } }),
      );
      expect(result.name).toBe('Q1 Revenue Updated');
      expect(result.targetValue).toBe(120000);
    });

    it('should convert periodStart/periodEnd strings to Date objects', async () => {
      const handler = new UpdateTargetHandler(prisma);
      const cmd = new UpdateTargetCommand('target-1', 'admin-1', {
        periodStart: '2026-02-01',
        periodEnd: '2026-02-28',
      });

      await handler.execute(cmd);

      expect(prisma.working.salesTarget.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            periodStart: new Date('2026-02-01'),
            periodEnd: new Date('2026-02-28'),
          }),
        }),
      );
    });
  });

  // ─── DeleteTargetHandler ───────────────────────────────────────────────────

  describe('DeleteTargetHandler', () => {
    it('should soft delete target by setting isDeleted: true and isActive: false', async () => {
      const deletedTarget = { ...mockTarget, isDeleted: true, isActive: false };
      prisma.working.salesTarget.update.mockResolvedValue(deletedTarget);
      const handler = new DeleteTargetHandler(prisma);
      const cmd = new DeleteTargetCommand('target-1', 'admin-1');

      const result = await handler.execute(cmd);

      expect(prisma.working.salesTarget.update).toHaveBeenCalledWith({
        where: { id: 'target-1' },
        data: { isDeleted: true, isActive: false },
      });
      expect(result.isDeleted).toBe(true);
      expect(result.isActive).toBe(false);
    });
  });

  // ─── ListTargetsHandler ────────────────────────────────────────────────────

  describe('ListTargetsHandler', () => {
    it('should return paginated list of targets', async () => {
      const handler = new ListTargetsHandler(prisma);
      const query = new ListTargetsQuery(1, 20);

      const result = await handler.execute(query);

      expect(prisma.working.salesTarget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isDeleted: false }),
          skip: 0,
          take: 20,
        }),
      );
      expect(prisma.working.salesTarget.count).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should apply userId filter when provided', async () => {
      const handler = new ListTargetsHandler(prisma);
      const query = new ListTargetsQuery(1, 20, 'createdAt', 'desc', 'user-1');

      await handler.execute(query);

      expect(prisma.working.salesTarget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isDeleted: false, userId: 'user-1' }),
        }),
      );
    });
  });

  // ─── GetTargetHandler ──────────────────────────────────────────────────────

  describe('GetTargetHandler', () => {
    it('should return a single target by id', async () => {
      const handler = new GetTargetHandler(prisma);
      const query = new GetTargetQuery('target-1');

      const result = await handler.execute(query);

      expect(prisma.working.salesTarget.findFirst).toHaveBeenCalledWith({
        where: { id: 'target-1', isDeleted: false },
      });
      expect(result.id).toBe('target-1');
    });

    it('should throw NotFoundException when target does not exist', async () => {
      prisma.working.salesTarget.findFirst.mockResolvedValue(null);
      const handler = new GetTargetHandler(prisma);
      const query = new GetTargetQuery('nonexistent');

      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── GetLeaderboardHandler ─────────────────────────────────────────────────

  describe('GetLeaderboardHandler', () => {
    it('should return ranked list ordered by achievedPercent', async () => {
      const targets = [
        { ...mockTarget, id: 't-1', userId: 'user-1', achievedPercent: 90, targetValue: 100000, currentValue: 90000 },
        { ...mockTarget, id: 't-2', userId: 'user-2', achievedPercent: 60, targetValue: 100000, currentValue: 60000 },
      ];
      prisma.working.salesTarget.findMany.mockResolvedValue(targets);
      const handler = new GetLeaderboardHandler(prisma);
      const query = new GetLeaderboardQuery('MONTHLY', 10);

      const result = await handler.execute(query);

      expect(prisma.working.salesTarget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isDeleted: false, isActive: true, period: 'MONTHLY' }),
          orderBy: { achievedPercent: 'desc' },
          take: 10,
        }),
      );
      expect(result).toHaveLength(2);
      expect(result[0].rank).toBe(1);
      expect(result[0].userId).toBe('user-1');
      expect(result[1].rank).toBe(2);
      expect(result[0].achievedPercent).toBe(90);
    });
  });

  // ─── GetTeamPerformanceHandler ─────────────────────────────────────────────

  describe('GetTeamPerformanceHandler', () => {
    it('should group targets by userId and compute avgAchievement', async () => {
      const targets = [
        { ...mockTarget, id: 't-1', userId: 'user-1', targetValue: 100000, currentValue: 80000 },
        { ...mockTarget, id: 't-2', userId: 'user-1', targetValue: 50000, currentValue: 25000 },
        { ...mockTarget, id: 't-3', userId: 'user-2', targetValue: 200000, currentValue: 200000 },
      ];
      prisma.working.salesTarget.findMany.mockResolvedValue(targets);
      const handler = new GetTeamPerformanceHandler(prisma);
      const query = new GetTeamPerformanceQuery('MONTHLY');

      const result = await handler.execute(query);

      expect(result.period).toBe('MONTHLY');
      expect(result.totalTargets).toBe(3);
      expect(result.members).toHaveLength(2);

      const user1: any = result.members.find((m: any) => m.userId === 'user-1');
      expect(user1).toBeDefined();
      expect(user1.targetCount).toBe(2);
      expect(user1.totalTarget).toBe(150000);
      expect(user1.totalAchieved).toBe(105000);
      expect(user1.avgAchievement).toBe(70);

      const user2: any = result.members.find((m: any) => m.userId === 'user-2');
      expect(user2.avgAchievement).toBe(100);
    });
  });
});

// ─── PerformanceController ────────────────────────────────────────────────────

describe('PerformanceController', () => {
  let controller: PerformanceController;
  let mockCommandBus: { execute: jest.Mock };
  let mockQueryBus: { execute: jest.Mock };

  const controllerMockTarget = {
    id: 'target-1',
    name: 'Q1 Revenue',
    metric: 'REVENUE',
    targetValue: 100000,
    currentValue: 75000,
    achievedPercent: 75,
    period: 'MONTHLY',
    periodStart: new Date('2026-01-01'),
    periodEnd: new Date('2026-01-31'),
    userId: 'user-1',
    roleId: 'role-1',
    isActive: true,
    isDeleted: false,
  };

  beforeEach(() => {
    mockCommandBus = { execute: jest.fn() };
    mockQueryBus = { execute: jest.fn() };
    controller = new PerformanceController(mockCommandBus as any, mockQueryBus as any);
  });

  it('should dispatch CreateTargetCommand on createTarget', async () => {
    mockCommandBus.execute.mockResolvedValue(controllerMockTarget);
    const dto = {
      name: 'Q1 Revenue',
      metric: 'REVENUE',
      targetValue: 100000,
      period: 'MONTHLY',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
      userId: 'user-1',
      roleId: 'role-1',
    } as any;

    const result = await controller.createTarget(dto, 'admin-1');

    expect(mockCommandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        createdById: 'admin-1',
        metric: 'REVENUE',
        targetValue: 100000,
        period: 'MONTHLY',
      }),
    );
    expect(result.message).toBe('Target created');
    expect(result.data.id).toBe('target-1');
  });

  it('should dispatch ListTargetsQuery on listTargets', async () => {
    mockQueryBus.execute.mockResolvedValue({ data: [controllerMockTarget], total: 1, page: 1, limit: 20 });
    const query = { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' } as any;

    const result = await controller.listTargets(query);

    expect(mockQueryBus.execute).toHaveBeenCalledWith(expect.any(Object));
    expect(result.data).toHaveLength(1);
    expect(result.meta!.total).toBe(1);
  });

  it('should dispatch GetLeaderboardQuery on getLeaderboard', async () => {
    const leaderboard = [{ rank: 1, userId: 'user-1', achievedPercent: 90 }];
    mockQueryBus.execute.mockResolvedValue(leaderboard);

    const result = await controller.getLeaderboard('MONTHLY', 10);

    expect(mockQueryBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({ period: 'MONTHLY', limit: 10 }),
    );
    expect(result.data).toEqual(leaderboard);
  });

  it('should dispatch DeleteTargetCommand on deleteTarget', async () => {
    const deletedTarget = { ...controllerMockTarget, isDeleted: true, isActive: false };
    mockCommandBus.execute.mockResolvedValue(deletedTarget);

    const result = await controller.deleteTarget('target-1', 'admin-1');

    expect(mockCommandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'target-1', deletedById: 'admin-1' }),
    );
    expect(result.message).toBe('Target deleted');
  });

  it('should dispatch GetTeamPerformanceQuery on getTeamPerformance', async () => {
    const teamData = { period: 'MONTHLY', totalTargets: 3, members: [] };
    mockQueryBus.execute.mockResolvedValue(teamData);

    const result = await controller.getTeamPerformance('MONTHLY');

    expect(mockQueryBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({ period: 'MONTHLY' }),
    );
    expect(result.data.period).toBe('MONTHLY');
  });
});
