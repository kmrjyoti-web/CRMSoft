import { WarningEvaluatorService } from '../services/warning-evaluator.service';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000);
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);

function makeMockPrisma(device: any, rules: any[], flushCommands: any[] = []) {
  const obj: any = {
    syncDevice: {
      findFirst: jest.fn().mockResolvedValue(device),
    },
    syncWarningRule: {
      findMany: jest.fn().mockResolvedValue(rules),
    },
    syncFlushCommand: {
      findMany: jest.fn().mockResolvedValue(flushCommands),
    },
  };
  obj.working = obj;
  return obj;
}

function makeRule(overrides: any = {}) {
  return {
    id: 'rule-1',
    name: 'Test Rule',
    trigger: 'TIME_SINCE_SYNC',
    thresholdValue: 4,
    thresholdUnit: 'hours',
    level1Action: 'WARN_ONLY',
    level1Threshold: 4,
    level1Message: 'Warning: {{value}} hours since sync',
    level2Action: 'BLOCK_AFTER_DELAY',
    level2Threshold: 12,
    level2Message: 'Block after delay',
    level2DelayMinutes: 30,
    level3Action: 'BLOCK_UNTIL_SYNC',
    level3Threshold: 48,
    level3Message: 'Must sync now',
    appliesToRoles: [],
    appliesToUsers: [],
    isEnabled: true,
    priority: 1,
    policy: null,
    ...overrides,
  };
}

describe('WarningEvaluatorService', () => {
  it('triggers TIME_SINCE_SYNC warning at level 1', async () => {
    const device = {
      lastSyncAt: hoursAgo(6),
      entitySyncState: {},
      pendingUploadCount: 0,
    };
    const rules = [makeRule()];
    const prisma = makeMockPrisma(device, rules);
    const service = new WarningEvaluatorService(prisma);

    const result = await service.evaluateWarnings('user-1', 'dev-1');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].level).toBe(1);
    expect(result.warnings[0].action).toBe('WARN_ONLY');
    expect(result.overallEnforcement).toBe('WARN_ONLY');
  });

  it('escalates DATA_AGE from L1 to L3', async () => {
    const device = {
      lastSyncAt: daysAgo(10),
      entitySyncState: {
        Lead: { lastPulledAt: daysAgo(10).toISOString() },
      },
      pendingUploadCount: 0,
    };
    const rules = [
      makeRule({
        id: 'rule-data-age',
        trigger: 'DATA_AGE',
        thresholdValue: 2,
        thresholdUnit: 'days',
        level1Threshold: 2,
        level2Threshold: 5,
        level3Threshold: 7,
        level3Action: 'BLOCK_UNTIL_SYNC',
        policy: { entityName: 'Lead' },
      }),
    ];
    const prisma = makeMockPrisma(device, rules);
    const service = new WarningEvaluatorService(prisma);

    const result = await service.evaluateWarnings('user-1', 'dev-1');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].level).toBe(3);
    expect(result.warnings[0].action).toBe('BLOCK_UNTIL_SYNC');
    expect(result.overallEnforcement).toBe('BLOCK_UNTIL_SYNC');
    expect(result.mustSyncEntities).toContain('Lead');
  });

  it('evaluates PENDING_UPLOAD_COUNT thresholds', async () => {
    const device = {
      lastSyncAt: new Date(),
      entitySyncState: {},
      pendingUploadCount: 250,
    };
    const rules = [
      makeRule({
        id: 'rule-pending',
        trigger: 'PENDING_UPLOAD_COUNT',
        thresholdValue: 50,
        thresholdUnit: 'records',
        level1Threshold: 50,
        level1Action: 'WARN_ONLY',
        level2Threshold: 200,
        level2Action: 'BLOCK_AFTER_DELAY',
        level2DelayMinutes: 15,
        level3Threshold: 500,
        level3Action: 'BLOCK_UNTIL_SYNC',
      }),
    ];
    const prisma = makeMockPrisma(device, rules);
    const service = new WarningEvaluatorService(prisma);

    const result = await service.evaluateWarnings('user-1', 'dev-1');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].level).toBe(2);
    expect(result.warnings[0].action).toBe('BLOCK_AFTER_DELAY');
    expect(result.overallEnforcement).toBe('BLOCK_AFTER_DELAY');
    expect(result.blockDelayMinutes).toBe(15);
  });

  it('BLOCK_AFTER_DELAY includes delay minutes', async () => {
    const device = {
      lastSyncAt: hoursAgo(20),
      entitySyncState: {},
      pendingUploadCount: 0,
    };
    const rules = [
      makeRule({
        level1Threshold: 4,
        level2Threshold: 12,
        level2DelayMinutes: 60,
        level3Threshold: 48,
      }),
    ];
    const prisma = makeMockPrisma(device, rules);
    const service = new WarningEvaluatorService(prisma);

    const result = await service.evaluateWarnings('user-1', 'dev-1');

    expect(result.warnings[0].level).toBe(2);
    expect(result.warnings[0].delayMinutes).toBe(60);
    expect(result.blockDelayMinutes).toBe(60);
  });

  it('overall enforcement uses worst-case across all rules', async () => {
    const device = {
      lastSyncAt: hoursAgo(50),
      entitySyncState: {},
      pendingUploadCount: 300,
      oldestPendingAt: hoursAgo(100),
    };
    const rules = [
      makeRule({
        id: 'rule-sync',
        trigger: 'TIME_SINCE_SYNC',
        level1Threshold: 4,
        level2Threshold: 12,
        level3Threshold: 48,
        level3Action: 'BLOCK_UNTIL_SYNC',
      }),
      makeRule({
        id: 'rule-pending',
        trigger: 'PENDING_UPLOAD_COUNT',
        level1Threshold: 50,
        level2Threshold: 200,
        level2Action: 'BLOCK_AFTER_DELAY',
        level2DelayMinutes: 15,
        level3Threshold: 500,
        level3Action: 'FLUSH_AND_RESYNC',
        priority: 2,
      }),
    ];
    const prisma = makeMockPrisma(device, rules);
    const service = new WarningEvaluatorService(prisma);

    const result = await service.evaluateWarnings('user-1', 'dev-1');

    // BLOCK_UNTIL_SYNC (3) vs BLOCK_AFTER_DELAY (2) → BLOCK_UNTIL_SYNC wins
    expect(result.overallEnforcement).toBe('BLOCK_UNTIL_SYNC');
    expect(result.warnings.length).toBe(2);
  });
});
