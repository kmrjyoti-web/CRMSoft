import { ErrorAutoReportService } from '../error-auto-report.service';

const mockPlatform = {
  errorLog: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  errorAutoReportRule: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

const mockPrisma = { platform: mockPlatform };

function buildService() {
  return new ErrorAutoReportService(mockPrisma as any);
}

describe('ErrorAutoReportService.reportToProvider', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns { reported: false } when error log not found', async () => {
    mockPlatform.errorLog.findUnique.mockResolvedValue(null);

    const result = await buildService().reportToProvider('missing-id', 'u-1');
    expect(result).toEqual({ reported: false });
    expect(mockPlatform.errorLog.update).not.toHaveBeenCalled();
  });

  it('marks reportedToProvider=true on the error log', async () => {
    mockPlatform.errorLog.findUnique.mockResolvedValue({
      id: 'el-1',
      severity: 'CRITICAL',
      tenantId: 't-1',
    });
    mockPlatform.errorLog.update.mockResolvedValue({});
    mockPlatform.errorAutoReportRule.findMany.mockResolvedValue([]);

    await buildService().reportToProvider('el-1', 'u-admin');

    expect(mockPlatform.errorLog.update).toHaveBeenCalledWith({
      where: { id: 'el-1' },
      data: expect.objectContaining({
        reportedToProvider: true,
        reportedToProviderAt: expect.any(Date),
        reportedToProviderById: 'u-admin',
      }),
    });
  });

  it('returns { reported: true } on success', async () => {
    mockPlatform.errorLog.findUnique.mockResolvedValue({ id: 'el-2', severity: 'CRITICAL' });
    mockPlatform.errorLog.update.mockResolvedValue({});
    mockPlatform.errorAutoReportRule.findMany.mockResolvedValue([]);

    const result = await buildService().reportToProvider('el-2', 'u-1');
    expect(result).toEqual({ reported: true });
  });

  it('fires all CRITICAL auto-report rules (ignoring throttle)', async () => {
    mockPlatform.errorLog.findUnique.mockResolvedValue({ id: 'el-3', severity: 'CRITICAL' });
    mockPlatform.errorLog.update.mockResolvedValue({});
    mockPlatform.errorAutoReportRule.findMany.mockResolvedValue([
      { id: 'rule-1', name: 'Critical Slack', channels: ['SLACK'], lastTriggeredAt: new Date() },
      { id: 'rule-2', name: 'Critical Email', channels: ['EMAIL'], lastTriggeredAt: null },
    ]);
    mockPlatform.errorAutoReportRule.update.mockResolvedValue({});

    await buildService().reportToProvider('el-3', 'u-1');

    expect(mockPlatform.errorAutoReportRule.update).toHaveBeenCalledTimes(2);
    expect(mockPlatform.errorAutoReportRule.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'rule-1' } }),
    );
    expect(mockPlatform.errorAutoReportRule.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'rule-2' } }),
    );
  });

  it('still returns { reported: true } if firing rules throws', async () => {
    mockPlatform.errorLog.findUnique.mockResolvedValue({ id: 'el-4', severity: 'CRITICAL' });
    mockPlatform.errorLog.update.mockResolvedValue({});
    mockPlatform.errorAutoReportRule.findMany.mockRejectedValue(new Error('DB error'));

    const result = await buildService().reportToProvider('el-4', 'u-1');
    expect(result).toEqual({ reported: true });
  });
});
