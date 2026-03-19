import { SlaMonitorService } from '../sla-monitor.service';

describe('SlaMonitorService', () => {
  let service: SlaMonitorService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      workflowInstance: { findMany: jest.fn().mockResolvedValue([]) },
      workflowSlaEscalation: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      user: { findFirst: jest.fn().mockResolvedValue({ id: 'manager-1' }) },
    };
(prisma as any).working = prisma;
    service = new SlaMonitorService(prisma as any);
  });

  it('should skip instances without SLA metadata', async () => {
    prisma.workflowInstance.findMany.mockResolvedValue([
      { id: 'inst-1', currentStateId: 'st-1', currentState: { metadata: null }, updatedAt: new Date() },
      { id: 'inst-2', currentStateId: 'st-2', currentState: { metadata: { slaHours: 24 } }, updatedAt: new Date() },
    ]);

    await service.checkSlaBreaches();

    expect(prisma.workflowSlaEscalation.create).not.toHaveBeenCalled();
  });

  it('should skip instances within SLA time', async () => {
    prisma.workflowInstance.findMany.mockResolvedValue([{
      id: 'inst-1', currentStateId: 'st-1',
      currentState: { metadata: { slaHours: 48, escalationEnabled: true } },
      updatedAt: new Date(),
    }]);

    await service.checkSlaBreaches();

    expect(prisma.workflowSlaEscalation.create).not.toHaveBeenCalled();
  });

  it('should create escalation when SLA is breached', async () => {
    const breachedTime = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
    prisma.workflowInstance.findMany.mockResolvedValue([{
      id: 'inst-1', currentStateId: 'st-1',
      currentState: { code: 'IN_PROGRESS', metadata: { slaHours: 24, escalationEnabled: true } },
      updatedAt: breachedTime,
    }]);

    await service.checkSlaBreaches();

    expect(prisma.workflowSlaEscalation.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ instanceId: 'inst-1', slaHours: 24, escalationLevel: 1 }) }),
    );
  });

  it('should not duplicate escalation at same level', async () => {
    const breachedTime = new Date(Date.now() - 25 * 60 * 60 * 1000);
    prisma.workflowInstance.findMany.mockResolvedValue([{
      id: 'inst-1', currentStateId: 'st-1',
      currentState: { code: 'IN_PROGRESS', metadata: { slaHours: 24, escalationEnabled: true } },
      updatedAt: breachedTime,
    }]);
    prisma.workflowSlaEscalation.findFirst.mockResolvedValue({ id: 'esc-1', escalationLevel: 1 });

    await service.checkSlaBreaches();

    expect(prisma.workflowSlaEscalation.create).not.toHaveBeenCalled();
  });

  it('should escalate to higher levels based on breach duration', async () => {
    const breachedTime = new Date(Date.now() - 50 * 60 * 60 * 1000); // 50 hours = level 2
    prisma.workflowInstance.findMany.mockResolvedValue([{
      id: 'inst-1', currentStateId: 'st-1',
      currentState: { code: 'IN_PROGRESS', metadata: { slaHours: 24, escalationEnabled: true } },
      updatedAt: breachedTime,
    }]);

    await service.checkSlaBreaches();

    expect(prisma.workflowSlaEscalation.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ escalationLevel: 2 }) }),
    );
  });

  it('should resolve escalations when state changes', async () => {
    await service.resolveEscalations('inst-1', 'st-1');

    expect(prisma.workflowSlaEscalation.updateMany).toHaveBeenCalledWith({
      where: { instanceId: 'inst-1', stateId: 'st-1', isResolved: false },
      data: { isResolved: true, resolvedAt: expect.any(Date) },
    });
  });
});
