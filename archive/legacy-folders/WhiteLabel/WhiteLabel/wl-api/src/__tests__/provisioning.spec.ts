import { ProvisioningService } from '../modules/provisioning/provisioning.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Mock child_process exec to avoid real system calls
jest.mock('child_process', () => ({
  exec: jest.fn((cmd: string, cb: Function) => cb(null, { stdout: '', stderr: '' })),
}));

const mockPrisma = {
  whiteLabelPartner: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  partnerFeatureFlag: {
    upsert: jest.fn(),
  },
  partnerDeployment: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockAudit = { log: jest.fn() };

const mockConfig = {
  get: (key: string, def?: string) => {
    const m: Record<string, string> = {
      POSTGRES_USER: 'postgres',
      POSTGRES_HOST: 'localhost',
      POSTGRES_PASSWORD: 'postgres',
      POSTGRES_PORT: '5432',
    };
    return m[key] ?? def;
  },
};

const makeService = () =>
  new ProvisioningService(
    mockPrisma as any,
    mockAudit as any,
    mockConfig as unknown as ConfigService,
  );

describe('ProvisioningService', () => {
  afterEach(() => jest.clearAllMocks());

  it('provision() creates feature flags and deployment record for unprovisioned partner', async () => {
    const partner = { id: 'p1', partnerCode: 'acme', dbConnectionConfig: null };
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(partner);
    mockPrisma.partnerFeatureFlag.upsert.mockResolvedValue({});
    mockPrisma.partnerDeployment.upsert.mockResolvedValue({ partnerId: 'p1', status: 'STOPPED' });
    mockPrisma.whiteLabelPartner.update.mockResolvedValue({ ...partner, status: 'ACTIVE' });

    const svc = makeService();
    const result = await svc.provision('p1');

    expect(result.success).toBe(true);
    expect(result.databases).toBeDefined();
    expect(result.databases.length).toBe(4);
    expect(mockPrisma.partnerFeatureFlag.upsert).toHaveBeenCalled();
    expect(mockPrisma.partnerDeployment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { partnerId: 'p1' } }),
    );
  });

  it('provision() throws BadRequestException if partner is already provisioned', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({
      id: 'p1',
      partnerCode: 'acme',
      dbConnectionConfig: { identity: 'postgresql://postgres:postgres@localhost:5432/identity_acme' },
    });

    const svc = makeService();
    await expect(svc.provision('p1')).rejects.toThrow(BadRequestException);
  });

  it('getStatus() returns provisioning status with databases list', async () => {
    const partner = {
      id: 'p1',
      partnerCode: 'acme',
      status: 'ACTIVE',
      dbConnectionConfig: {
        identity: 'postgresql://postgres:postgres@localhost:5432/identity_acme',
        platform: 'postgresql://postgres:postgres@localhost:5432/platform_acme',
      },
      featureFlags: [{ featureCode: 'CRM_CORE', isEnabled: true }],
      deployment: { status: 'RUNNING' },
    };
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(partner);

    const svc = makeService();
    const result = await svc.getStatus('p1');

    expect(result.isProvisioned).toBe(true);
    expect(result.databases).toHaveLength(2);
    expect(result.databases[0].status).toBe('ACTIVE');
    // Connection string should mask credentials
    expect(result.databases[0].url).not.toContain('postgres:postgres@');
    expect(result.featureFlags).toBeDefined();
  });

  it('deprovision() throws BadRequestException for wrong confirmation string', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({
      id: 'p1',
      partnerCode: 'acme',
    });

    const svc = makeService();
    await expect(svc.deprovision('p1', 'WRONG-CONFIRMATION')).rejects.toThrow(BadRequestException);
  });

  it('deprovision() with correct DELETE-{partnerCode} confirmation updates partner status to CANCELLED', async () => {
    const partner = { id: 'p1', partnerCode: 'acme' };
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(partner);
    mockPrisma.whiteLabelPartner.update.mockResolvedValue({ ...partner, status: 'CANCELLED', dbConnectionConfig: null });

    const svc = makeService();
    await svc.deprovision('p1', 'DELETE-acme');

    expect(mockPrisma.whiteLabelPartner.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    );
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'PARTNER_DEPROVISIONED' }),
    );
  });

  it('getDatabases() returns provisioned=false when dbConnectionConfig is null', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({
      id: 'p1',
      partnerCode: 'acme',
      dbConnectionConfig: null,
    });

    const svc = makeService();
    const result = await svc.getDatabases('p1');

    expect(result.provisioned).toBe(false);
    expect(result.databases).toHaveLength(0);
  });
});
