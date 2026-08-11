// @ts-nocheck
import { HealthController } from '../health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
      working: { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) },
      platform: { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) },
    };
    controller = new HealthController(prisma as any);
  });

  it('GET /health returns healthy status with required fields', async () => {
    const result = await controller.health();
    expect(result.status).toBe('healthy');
    expect(result).toHaveProperty('uptime');
    expect(result).toHaveProperty('version');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('environment');
  });

  it('GET /health/deep returns all DBs up and a valid status', async () => {
    const result = await controller.deepHealth();
    // status is 'healthy' or 'degraded' depending on memory — both are valid when DBs are up
    expect(['healthy', 'degraded']).toContain(result.status);
    expect(result.checks.workingDb.status).toBe('up');
    expect(result.checks.platformDb.status).toBe('up');
    expect(result.checks.identityDb.status).toBe('up');
  });

  it('GET /health/deep returns unhealthy when a DB is down', async () => {
    prisma.working.$queryRaw.mockRejectedValue(new Error('connection refused'));
    const result = await controller.deepHealth();
    expect(result.status).toBe('unhealthy');
    expect(result.checks.workingDb.status).toBe('down');
  });

  it('deep health includes memory and process checks', async () => {
    const result = await controller.deepHealth();
    expect(result.checks.memory).toBeDefined();
    expect(result.checks.process).toBeDefined();
    expect(result.checks.uptime).toBeDefined();
  });

  it('deep health timestamp is a valid ISO string', async () => {
    const result = await controller.deepHealth();
    expect(() => new Date(result.timestamp)).not.toThrow();
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
