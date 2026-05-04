import { TenantConfigService } from '../services/tenant-config.service';

function makeMockPrisma(config: any = null) {
  return {
    tenantConfig: {
      findFirst: jest.fn().mockResolvedValue(config),
      findMany: jest.fn().mockResolvedValue(config ? [config] : []),
      update: jest.fn(),
      upsert: jest.fn(),
    },
  } as any;
}

const mockSeeder = {
  seedDefaults: jest.fn().mockResolvedValue({ seeded: 41 }),
} as any;

describe('TenantConfigService', () => {
  it('get returns config value from DB', async () => {
    const prisma = makeMockPrisma({
      configKey: 'timezone',
      configValue: 'Asia/Kolkata',
      defaultValue: 'UTC',
    });
    const service = new TenantConfigService(prisma, mockSeeder);

    const value = await service.get('tenant-1', 'timezone');

    expect(value).toBe('Asia/Kolkata');
  });

  it('get returns defaultValue when configValue is empty', async () => {
    const prisma = makeMockPrisma({
      configKey: 'currency',
      configValue: null,
      defaultValue: 'INR',
    });
    const service = new TenantConfigService(prisma, mockSeeder);

    const value = await service.get('tenant-1', 'currency');

    expect(value).toBe('INR');
  });

  it('set validates enum and rejects invalid value', async () => {
    const prisma = makeMockPrisma({
      id: 'cfg-1',
      configKey: 'currency',
      valueType: 'ENUM',
      isReadOnly: false,
      enumOptions: ['INR', 'USD', 'EUR'],
      validationRule: null,
      minValue: null,
      maxValue: null,
    });
    const service = new TenantConfigService(prisma, mockSeeder);

    await expect(
      service.set('tenant-1', 'currency', 'INVALID', 'user-1'),
    ).rejects.toThrow('must be one of');
  });

  it('set rejects read-only config', async () => {
    const prisma = makeMockPrisma({
      id: 'cfg-1',
      configKey: 'systemVersion',
      isReadOnly: true,
      valueType: 'STRING',
    });
    const service = new TenantConfigService(prisma, mockSeeder);

    await expect(
      service.set('tenant-1', 'systemVersion', '2.0', 'user-1'),
    ).rejects.toThrow('read-only');
  });

  it('seedDefaults delegates to ConfigSeederService', async () => {
    const prisma = makeMockPrisma();
    const service = new TenantConfigService(prisma, mockSeeder);

    const result = await service.seedDefaults('tenant-1');

    expect(result.seeded).toBe(41);
    expect(mockSeeder.seedDefaults).toHaveBeenCalledWith('tenant-1');
  });
});
