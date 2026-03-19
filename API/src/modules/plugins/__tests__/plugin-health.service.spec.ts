import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PluginHealthService } from '../services/plugin-health.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { EncryptionService } from '../../softwarevendor/tenant-config/services/encryption.service';
import { PluginHandlerRegistry } from '../handlers/handler-registry';

describe('PluginHealthService', () => {
  let service: PluginHealthService;

  const MOCK_PLUGIN = {
    id: 'plugin-1',
    code: 'whatsapp_cloud',
    name: 'WhatsApp',
    category: 'COMMUNICATION',
    status: 'PLUGIN_ACTIVE',
  };

  const MOCK_TENANT_PLUGIN = {
    id: 'tp-1',
    tenantId: 'tenant-1',
    pluginId: 'plugin-1',
    isEnabled: true,
    status: 'TP_ACTIVE',
    credentials: 'encrypted-data',
    lastUsedAt: null,
    lastErrorAt: null,
    lastError: null,
    errorCount: 0,
    consecutiveErrors: 0,
    plugin: MOCK_PLUGIN,
  };

  const mockPrisma = {
    pluginRegistry: {
      findUnique: jest.fn(),
    },
    tenantPlugin: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockEncryption = {
    decrypt: jest.fn().mockReturnValue({ phoneNumberId: '123', accessToken: 'tok' }),
  };

  const mockHandler = {
    pluginCode: 'whatsapp_cloud',
    handle: jest.fn(),
    testConnection: jest.fn().mockResolvedValue({
      success: true,
      message: 'Connected',
      latencyMs: 50,
    }),
  };

  const mockHandlerRegistry = {
    get: jest.fn(),
    has: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginHealthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EncryptionService, useValue: mockEncryption },
        { provide: PluginHandlerRegistry, useValue: mockHandlerRegistry },
      ],
    }).compile();

    service = module.get(PluginHealthService);
    jest.clearAllMocks();
  });

  describe('testWithCredentials', () => {
    it('should delegate to handler.testConnection', async () => {
      mockHandlerRegistry.get.mockReturnValue(mockHandler);

      const result = await service.testWithCredentials('whatsapp_cloud', {
        phoneNumberId: '123',
        accessToken: 'tok',
      });

      expect(result.success).toBe(true);
      expect(mockHandler.testConnection).toHaveBeenCalledWith({
        phoneNumberId: '123',
        accessToken: 'tok',
      });
    });

    it('should return failure if no handler registered', async () => {
      mockHandlerRegistry.get.mockReturnValue(undefined);

      const result = await service.testWithCredentials('unknown_plugin', {});

      expect(result.success).toBe(false);
      expect(result.message).toContain('No handler');
    });
  });

  describe('testInstalled', () => {
    it('should decrypt credentials and test connection', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.findUnique.mockResolvedValue(MOCK_TENANT_PLUGIN);
      mockPrisma.tenantPlugin.update.mockResolvedValue(MOCK_TENANT_PLUGIN);
      mockHandlerRegistry.get.mockReturnValue(mockHandler);

      const result = await service.testInstalled('tenant-1', 'whatsapp_cloud');

      expect(result.success).toBe(true);
      expect(mockEncryption.decrypt).toHaveBeenCalledWith('encrypted-data');
      expect(mockHandler.testConnection).toHaveBeenCalled();
    });

    it('should throw NotFoundException if plugin not found', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(null);

      await expect(service.testInstalled('tenant-1', 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if plugin not installed', async () => {
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue(MOCK_PLUGIN);
      mockPrisma.tenantPlugin.findUnique.mockResolvedValue(null);

      await expect(service.testInstalled('tenant-1', 'whatsapp_cloud')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTenantPluginHealth', () => {
    it('should return health status for all installed plugins', async () => {
      mockPrisma.tenantPlugin.findMany.mockResolvedValue([MOCK_TENANT_PLUGIN]);
      mockHandlerRegistry.has.mockReturnValue(true);

      const result = await service.getTenantPluginHealth('tenant-1');

      expect(result).toHaveLength(1);
      expect(result[0].pluginCode).toBe('whatsapp_cloud');
      expect(result[0].hasHandler).toBe(true);
    });
  });
});
