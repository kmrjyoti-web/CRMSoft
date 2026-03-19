import { Test, TestingModule } from '@nestjs/testing';
import { PluginMenuService } from '../services/plugin-menu.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('PluginMenuService', () => {
  let service: PluginMenuService;

  const mockPrisma = {
    pluginRegistry: {
      findUnique: jest.fn(),
    },
    menu: {
      updateMany: jest.fn(),
    },
  };
(mockPrisma as any).platform = mockPrisma;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginMenuService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(PluginMenuService);
    jest.clearAllMocks();
  });

  describe('enableMenusForPlugin', () => {
    it('should enable menus matching plugin menuCodes', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue({
        menuCodes: ['whatsapp-dashboard', 'whatsapp-templates'],
      });
      mockPrisma.menu.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.enableMenusForPlugin('tenant-1', 'whatsapp_cloud');

      expect(result.enabled).toHaveLength(2);
      expect(mockPrisma.menu.updateMany).toHaveBeenCalledTimes(2);
      expect(mockPrisma.menu.updateMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', code: 'whatsapp-dashboard', isActive: false },
        data: { isActive: true },
      });
    });

    it('should return empty if plugin has no menuCodes', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue({
        menuCodes: [],
      });

      const result = await service.enableMenusForPlugin('tenant-1', 'aws_s3');

      expect(result.enabled).toHaveLength(0);
      expect(mockPrisma.menu.updateMany).not.toHaveBeenCalled();
    });

    it('should skip menus that are already active', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue({
        menuCodes: ['whatsapp-dashboard'],
      });
      mockPrisma.menu.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.enableMenusForPlugin('tenant-1', 'whatsapp_cloud');

      expect(result.enabled).toHaveLength(0);
    });
  });

  describe('disableMenusForPlugin', () => {
    it('should disable menus matching plugin menuCodes', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue({
        menuCodes: ['whatsapp-dashboard', 'whatsapp-templates'],
      });
      mockPrisma.menu.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.disableMenusForPlugin('tenant-1', 'whatsapp_cloud');

      expect(result.disabled).toHaveLength(2);
      expect(mockPrisma.menu.updateMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', code: 'whatsapp-dashboard', isActive: true },
        data: { isActive: false },
      });
    });

    it('should return empty if plugin not found', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(null);

      const result = await service.disableMenusForPlugin('tenant-1', 'unknown');

      expect(result.disabled).toHaveLength(0);
    });
  });
});
