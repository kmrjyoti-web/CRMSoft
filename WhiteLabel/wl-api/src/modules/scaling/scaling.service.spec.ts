import { Test, TestingModule } from '@nestjs/testing';
import { ScalingService } from './scaling.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  whiteLabelPartner: { findUnique: jest.fn(), findMany: jest.fn() },
  partnerScalingPolicy: { upsert: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  partnerScalingEvent: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  partnerUsageLog: { findMany: jest.fn() },
};
const mockAudit = { log: jest.fn() };

const mockActivePartner = { id: 'p-1', companyName: 'Acme', plan: 'PROFESSIONAL', maxTenants: 10, status: 'ACTIVE' };
const mockPolicy = {
  partnerId: 'p-1',
  maxInstances: 5,
  minInstances: 1,
  currentInstances: 1,
  scaleUpThreshold: 75,
  scaleDownThreshold: 25,
  isAutoScalingEnabled: true,
  cooldownMinutes: 15,
  lastScaledAt: null,
};

describe('ScalingService', () => {
  let service: ScalingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScalingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get(ScalingService);
    jest.clearAllMocks();
  });

  describe('getOrCreatePolicy', () => {
    it('should create default policy for a new partner', async () => {
      mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(mockActivePartner);
      mockPrisma.partnerScalingPolicy.upsert.mockResolvedValue(mockPolicy);

      const result = await service.getOrCreatePolicy('p-1');

      expect(mockPrisma.partnerScalingPolicy.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ create: expect.objectContaining({ maxInstances: 5 }) }),
      );
      expect(result).toEqual(mockPolicy);
    });

    it('should throw NotFoundException for unknown partner', async () => {
      mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(null);
      await expect(service.getOrCreatePolicy('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('evaluatePartner', () => {
    it('should return DISABLED when auto-scaling is off', async () => {
      mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(mockActivePartner);
      mockPrisma.partnerScalingPolicy.upsert.mockResolvedValue({ ...mockPolicy, isAutoScalingEnabled: false });

      const result = await service.evaluatePartner('p-1');
      expect(result.action).toBe('DISABLED');
    });

    it('should scale up when usage exceeds threshold', async () => {
      mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(mockActivePartner);
      mockPrisma.partnerScalingPolicy.upsert.mockResolvedValue(mockPolicy);
      // usage: totalChargedToPartner=8100, capacity=10000 → 81% > 75% threshold
      mockPrisma.partnerUsageLog.findMany.mockResolvedValue([
        { totalChargedToPartner: 8100 },
      ]);
      mockPrisma.partnerScalingPolicy.update.mockResolvedValue({});
      mockPrisma.partnerScalingEvent.create.mockResolvedValue({});
      mockAudit.log.mockResolvedValue({});

      const result = await service.evaluatePartner('p-1');
      expect(result.action).toBe('SCALE_UP');
      expect(mockPrisma.partnerScalingEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ eventType: 'SCALE_UP' }) }),
      );
    });

    it('should scale down when usage falls below threshold', async () => {
      mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(mockActivePartner);
      mockPrisma.partnerScalingPolicy.upsert.mockResolvedValue({ ...mockPolicy, currentInstances: 3 });
      // usage: 20% < 25% threshold
      mockPrisma.partnerUsageLog.findMany.mockResolvedValue([{ totalChargedToPartner: 2000 }]);
      mockPrisma.partnerScalingPolicy.update.mockResolvedValue({});
      mockPrisma.partnerScalingEvent.create.mockResolvedValue({});
      mockAudit.log.mockResolvedValue({});

      const result = await service.evaluatePartner('p-1');
      expect(result.action).toBe('SCALE_DOWN');
    });

    it('should respect cooldown period', async () => {
      const recentScaleTime = new Date(Date.now() - 5 * 60 * 1000); // 5 min ago
      mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(mockActivePartner);
      mockPrisma.partnerScalingPolicy.upsert.mockResolvedValue({ ...mockPolicy, lastScaledAt: recentScaleTime });

      const result = await service.evaluatePartner('p-1');
      expect(result.action).toBe('COOLDOWN');
    });
  });

  describe('tenant isolation', () => {
    it('should only evaluate ACTIVE partners in evaluateAll', async () => {
      mockPrisma.whiteLabelPartner.findMany.mockResolvedValue([
        { id: 'p-1', companyName: 'Acme' },
        { id: 'p-2', companyName: 'Bravo' },
      ]);
      mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(mockActivePartner);
      mockPrisma.partnerScalingPolicy.upsert.mockResolvedValue({ ...mockPolicy, isAutoScalingEnabled: false });

      await service.evaluateAll();

      expect(mockPrisma.whiteLabelPartner.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'ACTIVE' } }),
      );
    });
  });
});
