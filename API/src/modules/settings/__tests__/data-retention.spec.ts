import { DataRetentionService } from '../services/data-retention.service';

const mockLeadDelegate = {
  count: jest.fn(),
  findFirst: jest.fn(),
  deleteMany: jest.fn(),
  updateMany: jest.fn(),
};

const mockPrisma = {
  dataRetentionPolicy: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  lead: mockLeadDelegate,
} as any;

describe('DataRetentionService', () => {
  let service: DataRetentionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DataRetentionService(mockPrisma);
  });

  it('should preview correct count of affected records', async () => {
    mockPrisma.dataRetentionPolicy.findUnique.mockResolvedValue({
      entityName: 'Lead',
      retentionDays: 365,
      action: 'ARCHIVE',
      scopeFilter: {},
    });
    mockLeadDelegate.count.mockResolvedValue(42);
    mockLeadDelegate.findFirst.mockResolvedValue({ createdAt: new Date('2024-01-01') });

    const result = await service.preview('t1', 'Lead');
    expect(result.recordCount).toBe(42);
    expect(result.action).toBe('ARCHIVE');
  });

  it('should skip entity requiring approval during execute', async () => {
    mockPrisma.dataRetentionPolicy.findMany.mockResolvedValue([
      {
        id: 'p1', entityName: 'Lead', retentionDays: 365,
        action: 'ARCHIVE', isEnabled: true, requireApproval: true, scopeFilter: {},
      },
    ]);

    const results = await service.execute('t1');
    expect(results).toHaveLength(1);
    expect(results[0].skipped).toBe(true);
    expect(results[0].reason).toBe('Requires approval');
  });

  it('should hard-delete records when action is HARD_DELETE', async () => {
    mockPrisma.dataRetentionPolicy.findMany.mockResolvedValue([
      {
        id: 'p2', entityName: 'Lead', retentionDays: 90,
        action: 'HARD_DELETE', isEnabled: true, requireApproval: false, scopeFilter: {},
      },
    ]);
    mockLeadDelegate.deleteMany.mockResolvedValue({ count: 15 });
    mockPrisma.dataRetentionPolicy.update.mockResolvedValue({});

    const results = await service.execute('t1');
    expect(results[0].recordsAffected).toBe(15);
    expect(results[0].skipped).toBe(false);
    expect(mockLeadDelegate.deleteMany).toHaveBeenCalled();
  });
});
