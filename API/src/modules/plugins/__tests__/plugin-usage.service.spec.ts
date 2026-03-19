import { Test, TestingModule } from '@nestjs/testing';
import { PluginUsageService } from '../services/plugin-usage.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('PluginUsageService', () => {
  let service: PluginUsageService;

  const MOCK_TENANT_PLUGIN = {
    id: 'tp-1',
    tenantId: 'tenant-1',
    pluginId: 'plugin-1',
    isEnabled: true,
    status: 'TP_ACTIVE',
    monthlyUsage: 150,
    monthlyLimit: 1000,
    lastUsedAt: new Date(),
    plugin: {
      code: 'whatsapp_cloud',
      name: 'WhatsApp',
      category: 'COMMUNICATION',
    },
  };

  const mockPrisma = {
    pluginRegistry: {
      findUnique: jest.fn(),
    },
    tenantPlugin: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    pluginHookLog: {
      findMany: jest.fn(),
    },
  };
(mockPrisma as any).platform = mockPrisma;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginUsageService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(PluginUsageService);
    jest.clearAllMocks();
  });

  describe('getTenantUsage', () => {
    it('should return usage summaries with percentage', async () => {
      mockPrisma.tenantPlugin.findMany.mockResolvedValue([MOCK_TENANT_PLUGIN]);

      const result = await service.getTenantUsage('tenant-1');

      expect(result).toHaveLength(1);
      expect(result[0].pluginCode).toBe('whatsapp_cloud');
      expect(result[0].monthlyUsage).toBe(150);
      expect(result[0].usagePercent).toBe(15);
    });
  });

  describe('getTenantStats', () => {
    it('should return aggregated stats', async () => {
      mockPrisma.tenantPlugin.findMany.mockResolvedValue([MOCK_TENANT_PLUGIN]);

      const result = await service.getTenantStats('tenant-1');

      expect(result.totalPlugins).toBe(1);
      expect(result.activePlugins).toBe(1);
      expect(result.totalUsage).toBe(150);
      expect(result.byCategory.COMMUNICATION).toBe(150);
    });
  });

  describe('resetMonthlyUsage', () => {
    it('should reset all plugins with usage > 0', async () => {
      mockPrisma.tenantPlugin.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.resetMonthlyUsage();

      expect(result).toBe(5);
      expect(mockPrisma.tenantPlugin.updateMany).toHaveBeenCalledWith({
        where: { monthlyUsage: { gt: 0 } },
        data: expect.objectContaining({ monthlyUsage: 0 }),
      });
    });
  });

  describe('checkQuota', () => {
    it('should return allowed=true when under limit', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue({ id: 'plugin-1' });
      mockPrisma.tenantPlugin.findUnique.mockResolvedValue(MOCK_TENANT_PLUGIN);

      const result = await service.checkQuota('tenant-1', 'whatsapp_cloud');

      expect(result.allowed).toBe(true);
      expect(result.usage).toBe(150);
      expect(result.limit).toBe(1000);
    });

    it('should return allowed=true when no limit set', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue({ id: 'plugin-1' });
      mockPrisma.tenantPlugin.findUnique.mockResolvedValue({
        ...MOCK_TENANT_PLUGIN,
        monthlyLimit: null,
      });

      const result = await service.checkQuota('tenant-1', 'whatsapp_cloud');

      expect(result.allowed).toBe(true);
      expect(result.limit).toBeNull();
    });

    it('should return allowed=false when over limit', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue({ id: 'plugin-1' });
      mockPrisma.tenantPlugin.findUnique.mockResolvedValue({
        ...MOCK_TENANT_PLUGIN,
        monthlyUsage: 1000,
        monthlyLimit: 1000,
      });

      const result = await service.checkQuota('tenant-1', 'whatsapp_cloud');

      expect(result.allowed).toBe(false);
    });
  });

  describe('getRecentActivity', () => {
    it('should return hook logs', async () => {
      mockPrisma.pluginHookLog.findMany.mockResolvedValue([
        { id: 'log-1', hookPoint: 'lead.created', status: 'SUCCESS' },
      ]);

      const result = await service.getRecentActivity('tenant-1');

      expect(result).toHaveLength(1);
    });

    it('should filter by pluginCode when provided', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue({ id: 'plugin-1' });
      mockPrisma.pluginHookLog.findMany.mockResolvedValue([]);

      await service.getRecentActivity('tenant-1', 'whatsapp_cloud', 20);

      expect(mockPrisma.pluginHookLog.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', pluginId: 'plugin-1' },
        orderBy: { executedAt: 'desc' },
        take: 20,
      });
    });
  });
});
