import { Test, TestingModule } from '@nestjs/testing';
import { DbAuditorService } from '../db-auditor.service';
import { NamingCheckService } from '../checks/naming-check.service';
import { CrossDbIncludeCheckService } from '../checks/cross-db-include-check.service';
import { FkOrphanCheckService } from '../checks/fk-orphan-check.service';

describe('DbAuditorService', () => {
  let service: DbAuditorService;
  let namingCheck: NamingCheckService;
  let crossDbCheck: CrossDbIncludeCheckService;
  let fkOrphanCheck: FkOrphanCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DbAuditorService,
        {
          provide: NamingCheckService,
          useValue: { run: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: CrossDbIncludeCheckService,
          useValue: { run: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: FkOrphanCheckService,
          useValue: { run: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    service = module.get(DbAuditorService);
    namingCheck = module.get(NamingCheckService);
    crossDbCheck = module.get(CrossDbIncludeCheckService);
    fkOrphanCheck = module.get(FkOrphanCheckService);
  });

  it('should run all checks and return report with zero findings', async () => {
    const report = await service.runAll();
    expect(report.summary.totalFindings).toBe(0);
    expect(report.summary.errors).toBe(0);
    expect(report.runId).toBeDefined();
    expect(report.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should aggregate findings from all checks', async () => {
    (namingCheck.run as jest.Mock).mockResolvedValue([
      { severity: 'error', check: 'naming', db: 'PlatformDB', rule: 'test', message: 'test finding' },
    ]);
    (crossDbCheck.run as jest.Mock).mockResolvedValue([
      { severity: 'warn', check: 'crossDbInclude', db: 'WorkingDB', rule: 'test', message: 'test warn' },
    ]);

    const report = await service.runAll();
    expect(report.summary.totalFindings).toBe(2);
    expect(report.summary.errors).toBe(1);
    expect(report.summary.warnings).toBe(1);
    expect(report.summary.byCheck.naming).toBe(1);
    expect(report.summary.byCheck.crossDbInclude).toBe(1);
  });

  it('should run a single check when requested', async () => {
    await service.runCheck('naming');
    expect(namingCheck.run).toHaveBeenCalled();
    expect(crossDbCheck.run).not.toHaveBeenCalled();
    expect(fkOrphanCheck.run).not.toHaveBeenCalled();
  });

  it('should store last report', async () => {
    expect(service.getLastReport()).toBeNull();
    await service.runAll();
    expect(service.getLastReport()).not.toBeNull();
  });

  it('should handle check failures gracefully', async () => {
    (namingCheck.run as jest.Mock).mockRejectedValue(new Error('parse failed'));
    const report = await service.runAll();
    expect(report.summary.errors).toBe(1);
    expect(report.findings[0].rule).toBe('check-failed');
  });

  it('should pass db and deep options to checks', async () => {
    await service.runAll({ db: 'working', deep: true });
    expect(namingCheck.run).toHaveBeenCalledWith('working');
    expect(fkOrphanCheck.run).toHaveBeenCalledWith('working', true);
  });
});
