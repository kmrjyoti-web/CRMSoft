import { DeploymentsService } from '../modules/deployments/deployments.service';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Prevent real shell calls
jest.mock('child_process', () => ({
  exec: jest.fn((cmd: string, cb: Function) => cb(null, { stdout: '', stderr: '' })),
}));

const mockPrisma = {
  whiteLabelPartner: {
    findUnique: jest.fn(),
  },
  partnerDeployment: {
    upsert: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  partnerAuditLog: {
    findMany: jest.fn(),
  },
};

const mockAudit = { log: jest.fn() };

const mockConfig = {
  get: (key: string, def?: string) => def ?? '',
};

const makeService = () =>
  new DeploymentsService(
    mockPrisma as any,
    mockAudit as any,
    mockConfig as unknown as ConfigService,
  );

describe('DeploymentsService', () => {
  afterEach(() => jest.clearAllMocks());

  it('deploy() creates/updates deployment record and ultimately sets status to RUNNING', async () => {
    const partner = {
      id: 'p1',
      partnerCode: 'acme',
      gitBranches: [{ branchName: 'partner/acme/main', branchType: 'MAIN', isActive: true }],
    };
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(partner);
    mockPrisma.partnerDeployment.upsert.mockResolvedValue({ partnerId: 'p1', status: 'DEPLOYING' });
    const runningDeployment = { partnerId: 'p1', status: 'RUNNING', healthStatus: 'healthy' };
    mockPrisma.partnerDeployment.update.mockResolvedValue(runningDeployment);

    const svc = makeService();
    const result = await svc.deploy('p1', { version: '1.0.0', deployedBy: 'admin' });

    expect(result.status).toBe('RUNNING');
    expect(result.healthStatus).toBe('healthy');
    expect(mockPrisma.partnerDeployment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { partnerId: 'p1' },
        create: expect.objectContaining({ status: 'DEPLOYING', currentVersion: '1.0.0' }),
      }),
    );
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'PARTNER_DEPLOYED' }),
    );
  });

  it('rollback() updates deployment to RUNNING with the target version', async () => {
    const partner = { id: 'p1', partnerCode: 'acme' };
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(partner);
    // First update → DEPLOYING, second → RUNNING
    mockPrisma.partnerDeployment.update
      .mockResolvedValueOnce({ partnerId: 'p1', status: 'DEPLOYING', currentVersion: '0.9.0' })
      .mockResolvedValueOnce({ partnerId: 'p1', status: 'RUNNING', currentVersion: '0.9.0', healthStatus: 'healthy' });

    const svc = makeService();
    const result = await svc.rollback('p1', '0.9.0');

    expect(result.status).toBe('RUNNING');
    expect(result.currentVersion).toBe('0.9.0');
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'PARTNER_ROLLED_BACK', details: expect.objectContaining({ targetVersion: '0.9.0' }) }),
    );
  });

  it('checkHealth() returns healthy=true when deployment status is RUNNING', async () => {
    const deployment = { partnerId: 'p1', status: 'RUNNING', healthStatus: 'healthy' };
    mockPrisma.partnerDeployment.findUnique.mockResolvedValue(deployment);
    mockPrisma.partnerDeployment.update.mockResolvedValue({ ...deployment, lastHealthCheck: new Date() });

    const svc = makeService();
    const result = await svc.checkHealth('p1');

    expect(result.healthy).toBe(true);
    expect(result.healthStatus).toBe('healthy');
    expect(result.status).toBe('RUNNING');
  });

  it('checkHealth() returns healthy=false and degraded status when deployment is STOPPED', async () => {
    const deployment = { partnerId: 'p1', status: 'STOPPED', healthStatus: 'degraded' };
    mockPrisma.partnerDeployment.findUnique.mockResolvedValue(deployment);
    mockPrisma.partnerDeployment.update.mockResolvedValue({ ...deployment, lastHealthCheck: new Date() });

    const svc = makeService();
    const result = await svc.checkHealth('p1');

    expect(result.healthy).toBe(false);
    expect(result.healthStatus).toBe('degraded');
    expect(mockPrisma.partnerDeployment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ healthStatus: 'degraded' }) }),
    );
  });
});
