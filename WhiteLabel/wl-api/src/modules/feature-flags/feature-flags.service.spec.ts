import { Test, TestingModule } from '@nestjs/testing';
import { FeatureFlagsService, AVAILABLE_FEATURES } from './feature-flags.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  whiteLabelPartner: { findUnique: jest.fn() },
  partnerFeatureFlag: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  },
};

const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<FeatureFlagsService>(FeatureFlagsService);
  });

  // ─── Happy path ──────────────────────────────────────────────────────────────

  it('should return available features catalog', () => {
    const features = service.getAvailableFeatures();
    expect(features.length).toBeGreaterThan(0);
    expect(features[0]).toHaveProperty('code');
    expect(features[0]).toHaveProperty('label');
    expect(features[0]).toHaveProperty('category');
  });

  it('should return feature flags with enabled status for a partner', async () => {
    const partnerId = 'partner-1';
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: partnerId });
    mockPrisma.partnerFeatureFlag.findMany.mockResolvedValue([
      { featureCode: 'LEADS_MODULE', isEnabled: true, config: null, id: 'flag-1' },
    ]);

    const result = await service.getByPartner(partnerId);
    expect(result).toHaveLength(AVAILABLE_FEATURES.length);
    const leads = result.find((f) => f.code === 'LEADS_MODULE');
    expect(leads?.isEnabled).toBe(true);
    const contacts = result.find((f) => f.code === 'CONTACTS_MODULE');
    expect(contacts?.isEnabled).toBe(false);
  });

  it('should return only enabled feature codes', async () => {
    const partnerId = 'partner-1';
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: partnerId });
    mockPrisma.partnerFeatureFlag.findMany.mockResolvedValue([
      { featureCode: 'LEADS_MODULE', isEnabled: true },
      { featureCode: 'INVOICING_MODULE', isEnabled: true },
    ]);

    const result = await service.getEnabled(partnerId);
    expect(result).toContain('LEADS_MODULE');
    expect(result).toContain('INVOICING_MODULE');
    expect(result).toHaveLength(2);
  });

  it('should upsert feature flag on toggle', async () => {
    const partnerId = 'partner-1';
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: partnerId });
    mockPrisma.partnerFeatureFlag.upsert.mockResolvedValue({ featureCode: 'LEADS_MODULE', isEnabled: true });

    const result = await service.toggle(partnerId, 'LEADS_MODULE', true);
    expect(mockPrisma.partnerFeatureFlag.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ isEnabled: true }) }),
    );
    expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'FEATURE_ENABLED' }));
  });

  it('should bulk set multiple features', async () => {
    const partnerId = 'partner-1';
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: partnerId });
    mockPrisma.partnerFeatureFlag.upsert.mockResolvedValue({});

    const result = await service.bulkSet(partnerId, [
      { featureCode: 'LEADS_MODULE', isEnabled: true },
      { featureCode: 'CONTACTS_MODULE', isEnabled: false },
    ]);
    expect(result.updated).toBe(2);
  });

  it('should return dashboard with top enabled features', async () => {
    mockPrisma.partnerFeatureFlag.findMany.mockResolvedValue([
      { featureCode: 'LEADS_MODULE' },
      { featureCode: 'LEADS_MODULE' },
      { featureCode: 'CONTACTS_MODULE' },
    ]);

    const result = await service.getDashboard();
    expect(result.totalFlags).toBe(3);
    const leads = result.byFeature.find((f: any) => f.code === 'LEADS_MODULE');
    expect(leads?.enabledCount).toBe(2);
  });

  // ─── Error cases ─────────────────────────────────────────────────────────────

  it('should throw NotFoundException for unknown partner in getByPartner', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(null);
    await expect(service.getByPartner('ghost')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException for unknown partner in toggle', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(null);
    await expect(service.toggle('ghost', 'LEADS_MODULE', true)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException for unknown feature code in toggle', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: 'p1' });
    await expect(service.toggle('p1', 'NONEXISTENT_FEATURE', true)).rejects.toThrow(NotFoundException);
  });

  it('should log audit on disable', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue({ id: 'p1' });
    mockPrisma.partnerFeatureFlag.upsert.mockResolvedValue({});
    await service.toggle('p1', 'LEADS_MODULE', false);
    expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'FEATURE_DISABLED' }));
  });
});
