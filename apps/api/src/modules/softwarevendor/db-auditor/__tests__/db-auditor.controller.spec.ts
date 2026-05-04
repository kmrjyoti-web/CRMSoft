import { Test, TestingModule } from '@nestjs/testing';
import { DbAuditorController } from '../db-auditor.controller';
import { DbAuditorService } from '../db-auditor.service';
import { AuditReport } from '../dto/audit-finding.dto';

const mockReport: AuditReport = {
  runId: 'test-run',
  startedAt: new Date(),
  finishedAt: new Date(),
  durationMs: 100,
  summary: {
    totalFindings: 0,
    errors: 0,
    warnings: 0,
    byCheck: { naming: 0, crossDbInclude: 0, fkOrphan: 0 },
    byDb: {},
  },
  findings: [],
};

describe('DbAuditorController', () => {
  let controller: DbAuditorController;
  let service: DbAuditorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DbAuditorController],
      providers: [
        {
          provide: DbAuditorService,
          useValue: {
            runAll: jest.fn().mockResolvedValue(mockReport),
            runCheck: jest.fn().mockResolvedValue(mockReport),
            getLastReport: jest.fn().mockReturnValue(mockReport),
          },
        },
      ],
    }).compile();

    controller = module.get(DbAuditorController);
    service = module.get(DbAuditorService);
  });

  it('GET /run should call runAll', async () => {
    const result = await controller.run();
    expect(result.runId).toBe('test-run');
    expect(service.runAll).toHaveBeenCalled();
  });

  it('GET /run with db param', async () => {
    await controller.run('working');
    expect(service.runAll).toHaveBeenCalledWith({ db: 'working', deep: false });
  });

  it('GET /run/:checkId should call runCheck', async () => {
    await controller.runCheck('naming');
    expect(service.runCheck).toHaveBeenCalledWith('naming', { db: undefined, deep: false });
  });

  it('GET /findings should return last report', () => {
    const result = controller.getFindings();
    expect(result).toEqual(mockReport);
  });

  it('GET /findings should return message when no report', () => {
    (service.getLastReport as jest.Mock).mockReturnValue(null);
    const result = controller.getFindings();
    expect(result).toHaveProperty('message');
  });
});
