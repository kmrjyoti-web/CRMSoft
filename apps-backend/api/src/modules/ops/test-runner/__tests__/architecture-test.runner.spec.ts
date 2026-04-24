import * as childProcess from 'child_process';
import { ArchitectureTestRunner } from '../infrastructure/runners/architecture-test.runner';
import { TestType } from '@prisma/platform-client';

// Spy on execSync instead of mocking the whole module (avoids Prisma init conflict)
let execSyncSpy: jest.SpyInstance;

beforeEach(() => {
  execSyncSpy = jest.spyOn(childProcess, 'execSync');
});

afterEach(() => {
  execSyncSpy.mockRestore();
});

function buildRunner() {
  return new ArchitectureTestRunner();
}

const DEPCRUISE_CLEAN = JSON.stringify({ output: { violations: [], modules: [] } });
const DEPCRUISE_WITH_ERROR = JSON.stringify({
  output: {
    violations: [
      { rule: { name: 'no-cross-module', severity: 'error' }, from: 'src/modules/leads/foo.ts', to: 'src/modules/contacts/bar.ts' },
    ],
    modules: [],
  },
});

describe('ArchitectureTestRunner', () => {
  it('type is ARCHITECTURE', () => {
    expect(buildRunner().type).toBe(TestType.ARCHITECTURE);
  });

  it('returns PASS when depcruise finds no error violations', async () => {
    execSyncSpy.mockReturnValue(DEPCRUISE_CLEAN as any);

    const runner = buildRunner();
    const result = await runner.run({});

    const dcResult = result.results.find(r => r.suiteName === 'DependencyCruiser');
    expect(dcResult?.status).toBe('PASS');
  });

  it('reports FAIL for each error-severity violation', async () => {
    execSyncSpy.mockImplementation((cmd: string) => {
      if (cmd.includes('depcruise')) {
        const e: any = new Error('violations found');
        e.stdout = DEPCRUISE_WITH_ERROR;
        throw e;
      }
      return '' as any;
    });

    const runner = buildRunner();
    const result = await runner.run({});

    const failed = result.results.filter(r => r.status === 'FAIL');
    expect(failed.length).toBeGreaterThanOrEqual(1);
    expect(failed[0].errorMessage).toContain('no-cross-module');
  });

  it('returns PASS for domain layer purity when no violations found', async () => {
    execSyncSpy.mockImplementation((cmd: string) => {
      if (cmd.includes('depcruise')) return DEPCRUISE_CLEAN as any;
      return '' as any; // empty grep = no domain violations
    });

    const runner = buildRunner();
    const result = await runner.run({});

    const purityResult = result.results.find(r => r.suiteName === 'DDD Layer Purity');
    expect(purityResult?.status).toBe('PASS');
  });

  it('returns FAIL for domain violations when grep finds imports', async () => {
    execSyncSpy.mockImplementation((cmd: string) => {
      if (cmd.includes('depcruise')) return DEPCRUISE_CLEAN as any;
      if (cmd.includes('grep') && cmd.includes('infrastructure')) {
        return 'src/modules/leads/domain/lead.entity.ts:3:import { LeadRepo } from "../infrastructure/lead.repo"' as any;
      }
      return '' as any;
    });

    const runner = buildRunner();
    const result = await runner.run({});

    const purityResult = result.results.find(r => r.suiteName === 'DDD Layer Purity');
    expect(purityResult?.status).toBe('FAIL');
  });

  it('returns SKIP for circular dep check when madge is not installed', async () => {
    execSyncSpy.mockImplementation((cmd: string) => {
      if (cmd.includes('depcruise')) return DEPCRUISE_CLEAN as any;
      if (cmd.includes('madge')) throw new Error('madge: command not found');
      return '' as any;
    });

    const runner = buildRunner();
    const result = await runner.run({});

    const circular = result.results.find(r => r.suiteName === 'Circular Dependencies');
    expect(circular?.status).toBe('SKIP');
  });
});
