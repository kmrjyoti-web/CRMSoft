import { TestOrchestratorService } from '../application/services/test-orchestrator.service';
import { TestType } from '@prisma/platform-client';

// Mock runners
function makeRunner(type: TestType, passed: number, failed: number) {
  return {
    type,
    run: jest.fn().mockResolvedValue({
      type,
      total: passed + failed,
      passed,
      failed,
      skipped: 0,
      errors: 0,
      duration: 100,
      results: [],
    }),
  };
}

function buildOrchestrator(overrides: { failed?: number } = {}) {
  const mockPrisma = {
    platform: {
      testRun: {
        update: jest.fn().mockResolvedValue({}),
      },
      testResult: {
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    },
  };

  const failedCount = overrides.failed ?? 0;

  const orchestrator = new TestOrchestratorService(
    mockPrisma as any,
    makeRunner(TestType.UNIT, 10, failedCount) as any,
    makeRunner(TestType.FUNCTIONAL, 5, 0) as any,
    makeRunner(TestType.SMOKE, 14, 0) as any,
    makeRunner(TestType.ARCHITECTURE, 3, 0) as any,
    makeRunner(TestType.PENETRATION, 12, 0) as any,
    makeRunner(TestType.INTEGRATION, 6, 0) as any,
  );

  return { orchestrator, mockPrisma };
}

describe('TestOrchestratorService', () => {
  it('runs all 6 types in correct order', async () => {
    const { orchestrator, mockPrisma } = buildOrchestrator();
    const updateCalls: string[] = [];

    mockPrisma.platform.testRun.update.mockImplementation((args: any) => {
      if (args.data.currentPhase) updateCalls.push(args.data.currentPhase);
      return Promise.resolve({});
    });

    await orchestrator.runAll('run-1', [], {});

    // Smoke should run before Unit
    const smokeIdx = updateCalls.findIndex(p => p.includes('smoke'));
    const unitIdx = updateCalls.findIndex(p => p.includes('unit'));
    expect(smokeIdx).toBeLessThan(unitIdx);

    // Architecture should run after Integration
    const intIdx = updateCalls.findIndex(p => p.includes('integration'));
    const archIdx = updateCalls.findIndex(p => p.includes('architecture'));
    expect(intIdx).toBeLessThan(archIdx);
  });

  it('sets status to COMPLETED when all tests pass', async () => {
    const { orchestrator, mockPrisma } = buildOrchestrator({ failed: 0 });

    await orchestrator.runAll('run-1', [], {});

    const finalUpdate = mockPrisma.platform.testRun.update.mock.calls.find(
      (c: any) => c[0].data.status === 'COMPLETED',
    );
    expect(finalUpdate).toBeDefined();
    expect(finalUpdate[0].data.progressPercent).toBe(100);
  });

  it('sets status to FAILED when any test fails', async () => {
    const { orchestrator, mockPrisma } = buildOrchestrator({ failed: 2 });

    await orchestrator.runAll('run-1', [], {});

    const finalUpdate = mockPrisma.platform.testRun.update.mock.calls.find(
      (c: any) => c[0].data.status === 'FAILED',
    );
    expect(finalUpdate).toBeDefined();
  });

  it('aggregates totals correctly across all runners', async () => {
    const { orchestrator, mockPrisma } = buildOrchestrator({ failed: 1 });

    await orchestrator.runAll('run-1', [], {});

    const finalCall = mockPrisma.platform.testRun.update.mock.calls.find(
      (c: any) => c[0].data.totalTests !== undefined,
    );
    expect(finalCall).toBeDefined();
    // 6 runners: UNIT (10+1=11), FUNCTIONAL(5), SMOKE(14), ARCH(3), PEN(12), INTEGRATION(6) = 51
    expect(finalCall[0].data.totalTests).toBe(51);
    expect(finalCall[0].data.passed).toBe(50); // 51 - 1 failed
    expect(finalCall[0].data.failed).toBe(1);
  });

  it('only runs specified test types when subset provided', async () => {
    const { orchestrator, mockPrisma } = buildOrchestrator();

    await orchestrator.runAll('run-1', [TestType.UNIT, TestType.SMOKE], {});

    // Only UNIT (10) + SMOKE (14) = 24 total
    const finalCall = mockPrisma.platform.testRun.update.mock.calls.find(
      (c: any) => c[0].data.totalTests !== undefined,
    );
    expect(finalCall[0].data.totalTests).toBe(24);
  });

  it('builds summary object per test type', async () => {
    const { orchestrator, mockPrisma } = buildOrchestrator();

    await orchestrator.runAll('run-1', [TestType.UNIT], {});

    const finalCall = mockPrisma.platform.testRun.update.mock.calls.find(
      (c: any) => c[0].data.summary !== undefined,
    );
    expect(finalCall[0].data.summary).toHaveProperty('UNIT');
    expect(finalCall[0].data.summary.UNIT).toMatchObject({ total: 10, passed: 10, failed: 0 });
  });
});
