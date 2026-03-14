import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PluginService } from '../services/plugin.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { EncryptionService } from '../../tenant-config/services/encryption.service';
import { PluginMenuService } from '../services/plugin-menu.service';

describe('PluginService', () => {
  let service: PluginService;

  const MOCK_PLUGIN = {
    id: 'plugin-1',
    code: 'whatsapp_cloud',
    name: 'WhatsApp Business Cloud API',
    category: 'COMMUNICATION',
    status: 'PLUGIN_ACTIVE',
    configSchema: {
      fields: [
        { name: 'phoneNumberId', label: 'Phone Number ID', type: 'string', required: true },
        { name: 'accessToken', label: 'Access Token', type: 'secret', required: true },
      ],
    },
    hookPoints: ['lead.created', 'quotation.sent'],
    menuCodes: ['whatsapp-templates'],
    webhookConfig: { inbound: '/webhooks/whatsapp/{tenantId}' },
    sortOrder: 1,
  };

  const MOCK_TENANT_PLUGIN = {
    id: 'tp-1',
    tenantId: 'tenant-1',
    pluginId: 'plugin-1',
    isEnabled: true,
    status: 'TP_ACTIVE',
    credentials: 'encrypted-data',
    settings: { environment: 'production' },
    errorCount: 0,
    consecutiveErrors: 0,
    plugin: MOCK_PLUGIN,
  };

  const mockPrisma = {
    pluginRegistry: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    tenantPlugin: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockEncryption = {
    encrypt: jest.fn().mockReturnValue('encrypted-blob'),
    decrypt: jest.fn().mockReturnValue({ phoneNumberId: '123', accessToken: 'tok_xxx' }),
  };

  const mockMenuService = {
    enableMenusForPlugin: jest.fn().mockResolvedValue({ enabled: [] }),
    disableMenusForPlugin: jest.fn().mockResolvedValue({ disabled: [] }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EncryptionService, useValue: mockEncryption },
        { provide: PluginMenuService, useValue: mockMenuService },
      ],
    }).compile();

    service = module.get(PluginService);
    jest.clearAllMocks();
  });

  describe('getAllPlugins', () => {
    it('should return all active plugins', async () => {
      mockPrisma.pluginRegistry.findMany.mockResolvedValue([MOCK_PLUGIN]);

      const result = await service.getAllPlugins();

      expect(result).toHaveLength(1);
      expect(mockPrisma.pluginRegistry.findMany).toHaveBeenCalledWith({
        where: { status: 'PLUGIN_ACTIVE', industryCode: null },
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      });
    });
  });

  describe('getPluginByCode', () => {
    it('should return plugin by code', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);

      const result = await service.getPluginByCode('whatsapp_cloud');

      expect(result.code).toBe('whatsapp_cloud');
    });

    it('should throw NotFoundException for invalid code', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(null);

      await expect(service.getPluginByCode('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPluginsByCategory', () => {
    it('should filter plugins by category', async () => {
      mockPrisma.pluginRegistry.findMany.mockResolvedValue([MOCK_PLUGIN]);

      const result = await service.getPluginsByCategory('COMMUNICATION' as any);

      expect(mockPrisma.pluginRegistry.findMany).toHaveBeenCalledWith({
        where: { category: 'COMMUNICATION', status: 'PLUGIN_ACTIVE', industryCode: null },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('enablePlugin', () => {
    it('should encrypt credentials and create tenant plugin', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.upsert.mockResolvedValue({
        ...MOCK_TENANT_PLUGIN,
        credentials: 'encrypted-blob',
      });

      const result = await service.enablePlugin(
        'tenant-1',
        'whatsapp_cloud',
        { phoneNumberId: '123', accessToken: 'tok_xxx' },
        { environment: 'production' },
        'user-1',
      );

      expect(mockEncryption.encrypt).toHaveBeenCalledWith({
        phoneNumberId: '123',
        accessToken: 'tok_xxx',
      });
      expect(result.credentials).toBeUndefined(); // Never return credentials
      expect(mockPrisma.tenantPlugin.upsert).toHaveBeenCalled();
    });

    it('should validate required credentials', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);

      await expect(
        service.enablePlugin('tenant-1', 'whatsapp_cloud', {}, undefined, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate webhook URL when webhookConfig is present', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.upsert.mockResolvedValue(MOCK_TENANT_PLUGIN);

      const result = await service.enablePlugin(
        'tenant-1',
        'whatsapp_cloud',
        { phoneNumberId: '123', accessToken: 'tok_xxx' },
      );

      expect(result.webhookUrl).toContain('whatsapp_cloud');
      expect(result.webhookUrl).toContain('tenant-1');
    });
  });

  describe('disablePlugin', () => {
    it('should mark plugin as inactive', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.update.mockResolvedValue({
        ...MOCK_TENANT_PLUGIN,
        isEnabled: false,
        status: 'TP_INACTIVE',
      });

      const result = await service.disablePlugin('tenant-1', 'whatsapp_cloud', 'user-1');

      expect(mockPrisma.tenantPlugin.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isEnabled: false,
            status: 'TP_INACTIVE',
          }),
        }),
      );
    });
  });

  describe('updateCredentials', () => {
    it('should encrypt and update credentials', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.update.mockResolvedValue(MOCK_TENANT_PLUGIN);

      const result = await service.updateCredentials(
        'tenant-1',
        'whatsapp_cloud',
        { phoneNumberId: '456', accessToken: 'tok_new' },
        'user-1',
      );

      expect(result).toEqual({ success: true });
      expect(mockEncryption.encrypt).toHaveBeenCalled();
      expect(mockPrisma.tenantPlugin.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            credentials: 'encrypted-blob',
            errorCount: 0,
            consecutiveErrors: 0,
          }),
        }),
      );
    });
  });

  describe('getDecryptedCredentials', () => {
    it('should decrypt and return credentials', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.findUnique.mockResolvedValue(MOCK_TENANT_PLUGIN);

      const result = await service.getDecryptedCredentials('tenant-1', 'whatsapp_cloud');

      expect(mockEncryption.decrypt).toHaveBeenCalledWith('encrypted-data');
      expect(result).toEqual({ phoneNumberId: '123', accessToken: 'tok_xxx' });
    });

    it('should return null if no credentials', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.findUnique.mockResolvedValue({
        ...MOCK_TENANT_PLUGIN,
        credentials: null,
      });

      const result = await service.getDecryptedCredentials('tenant-1', 'whatsapp_cloud');
      expect(result).toBeNull();
    });

    it('should throw if plugin is disabled', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.findUnique.mockResolvedValue({
        ...MOCK_TENANT_PLUGIN,
        isEnabled: false,
      });

      await expect(
        service.getDecryptedCredentials('tenant-1', 'whatsapp_cloud'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('isPluginEnabled', () => {
    it('should return true for enabled plugin', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.findUnique.mockResolvedValue(MOCK_TENANT_PLUGIN);

      const result = await service.isPluginEnabled('tenant-1', 'whatsapp_cloud');
      expect(result).toBe(true);
    });

    it('should return false for disabled plugin', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.findUnique.mockResolvedValue({
        ...MOCK_TENANT_PLUGIN,
        isEnabled: false,
        status: 'TP_INACTIVE',
      });

      const result = await service.isPluginEnabled('tenant-1', 'whatsapp_cloud');
      expect(result).toBe(false);
    });

    it('should return false for non-existent plugin', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.findUnique.mockResolvedValue(null);

      const result = await service.isPluginEnabled('tenant-1', 'whatsapp_cloud');
      expect(result).toBe(false);
    });
  });

  describe('recordError', () => {
    it('should increment error counts', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.update.mockResolvedValue({
        ...MOCK_TENANT_PLUGIN,
        errorCount: 1,
        consecutiveErrors: 1,
      });

      await service.recordError('tenant-1', 'whatsapp_cloud', 'API timeout');

      expect(mockPrisma.tenantPlugin.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            errorCount: { increment: 1 },
            consecutiveErrors: { increment: 1 },
            lastError: 'API timeout',
          }),
        }),
      );
    });

    it('should auto-disable after 10 consecutive errors', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.update.mockResolvedValue({
        ...MOCK_TENANT_PLUGIN,
        id: 'tp-1',
        consecutiveErrors: 10,
      });

      await service.recordError('tenant-1', 'whatsapp_cloud', 'API timeout');

      // Should be called twice: once for error, once for auto-disable
      expect(mockPrisma.tenantPlugin.update).toHaveBeenCalledTimes(2);
      expect(mockPrisma.tenantPlugin.update).toHaveBeenLastCalledWith({
        where: { id: 'tp-1' },
        data: { status: 'TP_ERROR', isEnabled: false },
      });
    });
  });

  describe('clearErrors', () => {
    it('should reset consecutive errors and set status to ACTIVE', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.update.mockResolvedValue(MOCK_TENANT_PLUGIN);

      await service.clearErrors('tenant-1', 'whatsapp_cloud');

      expect(mockPrisma.tenantPlugin.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { consecutiveErrors: 0, status: 'TP_ACTIVE' },
        }),
      );
    });
  });

  describe('recordUsage', () => {
    it('should increment monthly usage', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.update.mockResolvedValue(MOCK_TENANT_PLUGIN);

      await service.recordUsage('tenant-1', 'whatsapp_cloud');

      expect(mockPrisma.tenantPlugin.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            monthlyUsage: { increment: 1 },
          }),
        }),
      );
    });
  });
});
