import { CronSeedService } from '../services/cron-seed.service';

const mockPrisma = {
  cronJobConfig: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
} as any;

function makeService() {
  return new CronSeedService(mockPrisma);
}

describe('CronSeedService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create seed jobs when none exist', async () => {
    mockPrisma.cronJobConfig.findUnique.mockResolvedValue(null);
    mockPrisma.cronJobConfig.create.mockResolvedValue({});

    const service = makeService();
    await service.seed();

    // Should have called create for each seed job
    expect(mockPrisma.cronJobConfig.create).toHaveBeenCalled();
    const callCount = mockPrisma.cronJobConfig.create.mock.calls.length;
    expect(callCount).toBeGreaterThanOrEqual(30); // 40 seed jobs
  });

  it('should skip creation when jobs already exist', async () => {
    mockPrisma.cronJobConfig.findUnique.mockResolvedValue({ id: 'existing' });

    const service = makeService();
    await service.seed();

    expect(mockPrisma.cronJobConfig.create).not.toHaveBeenCalled();
  });
});
