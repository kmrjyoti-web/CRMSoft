import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LogManualTestHandler } from '../application/commands/log-manual-test/log-manual-test.handler';
import { LogManualTestCommand } from '../application/commands/log-manual-test/log-manual-test.command';
import { UpdateManualTestLogHandler } from '../application/commands/update-manual-test-log/update-manual-test-log.handler';
import { UpdateManualTestLogCommand } from '../application/commands/update-manual-test-log/update-manual-test-log.command';
import { ListManualTestLogsHandler } from '../application/queries/list-manual-test-logs/list-manual-test-logs.handler';
import { ListManualTestLogsQuery } from '../application/queries/list-manual-test-logs/list-manual-test-logs.query';
import { GetManualTestSummaryHandler } from '../application/queries/get-manual-test-summary/get-manual-test-summary.handler';
import { GetManualTestSummaryQuery } from '../application/queries/get-manual-test-summary/get-manual-test-summary.query';
import { MANUAL_TEST_LOG_REPOSITORY } from '../infrastructure/repositories/manual-test-log.repository';

const mockRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByTenantId: jest.fn(),
  update: jest.fn(),
  getSummary: jest.fn(),
};

async function buildModule(handlers: any[]) {
  return Test.createTestingModule({
    providers: [
      ...handlers,
      { provide: MANUAL_TEST_LOG_REPOSITORY, useValue: mockRepo },
    ],
  }).compile();
}

describe('ManualTest — Log + Update', () => {
  let logHandler: LogManualTestHandler;
  let updateHandler: UpdateManualTestLogHandler;

  beforeEach(async () => {
    const module = await buildModule([LogManualTestHandler, UpdateManualTestLogHandler]);
    logHandler = module.get<LogManualTestHandler>(LogManualTestHandler);
    updateHandler = module.get<UpdateManualTestLogHandler>(UpdateManualTestLogHandler);
    jest.clearAllMocks();
  });

  it('should create a manual test log', async () => {
    const created = { id: 'log-001', module: 'payment', status: 'PASS' };
    mockRepo.create.mockResolvedValue(created);

    const cmd = new LogManualTestCommand('tenant-001', 'user-001', {
      module: 'payment',
      pageName: 'Invoice List',
      action: 'Create Invoice',
      expectedResult: 'Invoice created with status DRAFT',
      actualResult: 'Invoice created with status DRAFT',
      status: 'PASS',
      severity: 'MEDIUM',
    });

    const result = await logHandler.execute(cmd);
    expect(result).toEqual(created);
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: 'tenant-001',
      userId: 'user-001',
      module: 'payment',
      status: 'PASS',
    }));
  });

  it('should update an existing manual test log', async () => {
    const existing = { id: 'log-002', status: 'FAIL' };
    const updated = { id: 'log-002', status: 'PASS', bugReported: false };
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.update.mockResolvedValue(updated);

    const cmd = new UpdateManualTestLogCommand('log-002', {
      status: 'PASS',
      notes: 'Retested and passed',
    });

    const result = await updateHandler.execute(cmd);
    expect(result).toEqual(updated);
    expect(mockRepo.update).toHaveBeenCalledWith('log-002', { status: 'PASS', notes: 'Retested and passed' });
  });

  it('should throw NotFoundException when updating a non-existent log', async () => {
    mockRepo.findById.mockResolvedValue(null);

    const cmd = new UpdateManualTestLogCommand('nonexistent-id', { status: 'PASS' });
    await expect(updateHandler.execute(cmd)).rejects.toThrow(NotFoundException);
    await expect(updateHandler.execute(cmd)).rejects.toThrow('ManualTestLog not found');
  });
});

describe('ManualTest — List + Filter', () => {
  let listHandler: ListManualTestLogsHandler;

  beforeEach(async () => {
    const module = await buildModule([ListManualTestLogsHandler]);
    listHandler = module.get<ListManualTestLogsHandler>(ListManualTestLogsHandler);
    jest.clearAllMocks();
  });

  it('should list logs for a tenant with no filters', async () => {
    const logs = [{ id: 'log-1' }, { id: 'log-2' }];
    mockRepo.findByTenantId.mockResolvedValue(logs);

    const query = new ListManualTestLogsQuery('tenant-001', {});
    const result = await listHandler.execute(query);

    expect(result).toEqual(logs);
    expect(mockRepo.findByTenantId).toHaveBeenCalledWith('tenant-001', {});
  });

  it('should pass filters to repository', async () => {
    mockRepo.findByTenantId.mockResolvedValue([]);

    const query = new ListManualTestLogsQuery('tenant-001', {
      module: 'payment',
      status: 'FAIL',
      page: 2,
      limit: 25,
    });
    await listHandler.execute(query);

    expect(mockRepo.findByTenantId).toHaveBeenCalledWith('tenant-001', {
      module: 'payment',
      status: 'FAIL',
      page: 2,
      limit: 25,
    });
  });
});

describe('ManualTest — Summary', () => {
  let summaryHandler: GetManualTestSummaryHandler;

  beforeEach(async () => {
    const module = await buildModule([GetManualTestSummaryHandler]);
    summaryHandler = module.get<GetManualTestSummaryHandler>(GetManualTestSummaryHandler);
    jest.clearAllMocks();
  });

  it('should return summary with totals and breakdowns', async () => {
    const summary = {
      total: 42,
      byStatus: { PASS: 30, FAIL: 8, BLOCKED: 4 },
      byModule: [
        { module: 'payment', PASS: 15, FAIL: 3, total: 18 },
        { module: 'customer', PASS: 15, FAIL: 5, BLOCKED: 4, total: 24 },
      ],
    };
    mockRepo.getSummary.mockResolvedValue(summary);

    const query = new GetManualTestSummaryQuery('tenant-001', { testRunId: 'run-001' });
    const result = await summaryHandler.execute(query);

    expect(result).toEqual(summary);
    expect(mockRepo.getSummary).toHaveBeenCalledWith('tenant-001', { testRunId: 'run-001' });
  });

  it('should support date range filters', async () => {
    mockRepo.getSummary.mockResolvedValue({ total: 10, byStatus: {}, byModule: [] });

    const query = new GetManualTestSummaryQuery('tenant-001', {
      from: '2025-01-01',
      to: '2025-12-31',
    });
    await summaryHandler.execute(query);

    expect(mockRepo.getSummary).toHaveBeenCalledWith('tenant-001', {
      from: '2025-01-01',
      to: '2025-12-31',
    });
  });
});
