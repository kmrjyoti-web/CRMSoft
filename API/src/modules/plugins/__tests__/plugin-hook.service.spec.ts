import { Test, TestingModule } from '@nestjs/testing';
import { PluginHookService } from '../services/plugin-hook.service';
import { PluginService } from '../services/plugin.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PluginHandlerRegistry } from '../handlers/handler-registry';
import { EncryptionService } from '../../softwarevendor/tenant-config/services/encryption.service';

describe('PluginHookService', () => {
  let service: PluginHookService;

  const MOCK_PLUGIN = {
    id: 'plugin-1',
    code: 'whatsapp_cloud',
    name: 'WhatsApp',
    hookPoints: ['lead.created'],
  };

  const MOCK_TENANT_PLUGIN = {
    id: 'tp-1',
    tenantId: 'tenant-1',
    pluginId: 'plugin-1',
    isEnabled: true,
    status: 'TP_ACTIVE',
    credentials: 'encrypted-creds',
    settings: { env: 'production' },
    plugin: MOCK_PLUGIN,
  };

  const mockPrisma = {
    tenantPlugin: {
      findMany: jest.fn(),
    },
    pluginHookLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockPluginService = {
    clearErrors: jest.fn(),
    recordUsage: jest.fn(),
    recordError: jest.fn(),
  };

  const mockHandler = {
    pluginCode: 'whatsapp_cloud',
    handle: jest.fn().mockResolvedValue({ sent: true }),
    testConnection: jest.fn(),
  };

  const mockHandlerRegistry = {
    get: jest.fn(),
  };

  const mockEncryption = {
    decrypt: jest.fn().mockReturnValue({ phoneNumberId: '123', accessToken: 'tok' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginHookService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PluginService, useValue: mockPluginService },
        { provide: PluginHandlerRegistry, useValue: mockHandlerRegistry },
        { provide: EncryptionService, useValue: mockEncryption },
      ],
    }).compile();

    service = module.get(PluginHookService);
    jest.clearAllMocks();
  });

  describe('fireHook', () => {
    it('should delegate to registered handler with decrypted credentials', async () => {
      mockPrisma.tenantPlugin.findMany.mockResolvedValue([MOCK_TENANT_PLUGIN]);
      mockHandlerRegistry.get.mockReturnValue(mockHandler);
      mockPrisma.pluginHookLog.create.mockResolvedValue({});

      await service.fireHook('lead.created', {
        tenantId: 'tenant-1',
        entityType: 'lead',
        entityId: 'lead-1',
        action: 'created',
        data: { name: 'Test Lead' },
      });

      expect(mockEncryption.decrypt).toHaveBeenCalledWith('encrypted-creds');
      expect(mockHandler.handle).toHaveBeenCalledWith(
        'lead.created',
        expect.objectContaining({ tenantId: 'tenant-1', entityId: 'lead-1' }),
        { phoneNumberId: '123', accessToken: 'tok' },
        { env: 'production' },
      );
      expect(mockPluginService.clearErrors).toHaveBeenCalled();
      expect(mockPluginService.recordUsage).toHaveBeenCalled();
    });

    it('should do nothing when no plugins match the hook', async () => {
      mockPrisma.tenantPlugin.findMany.mockResolvedValue([]);

      await service.fireHook('unknown.hook', {
        tenantId: 'tenant-1',
        entityType: 'test',
        entityId: '1',
        action: 'test',
        data: {},
      });

      expect(mockHandler.handle).not.toHaveBeenCalled();
    });

    it('should record error when handler throws', async () => {
      mockPrisma.tenantPlugin.findMany.mockResolvedValue([MOCK_TENANT_PLUGIN]);
      mockHandlerRegistry.get.mockReturnValue({
        ...mockHandler,
        handle: jest.fn().mockRejectedValue(new Error('API timeout')),
      });
      mockPrisma.pluginHookLog.create.mockResolvedValue({});

      await service.fireHook('lead.created', {
        tenantId: 'tenant-1',
        entityType: 'lead',
        entityId: 'lead-1',
        action: 'created',
        data: {},
      });

      expect(mockPluginService.recordError).toHaveBeenCalledWith(
        'tenant-1',
        'whatsapp_cloud',
        'API timeout',
      );
    });

    it('should log hook execution even without handler', async () => {
      mockPrisma.tenantPlugin.findMany.mockResolvedValue([MOCK_TENANT_PLUGIN]);
      mockHandlerRegistry.get.mockReturnValue(undefined);
      mockPrisma.pluginHookLog.create.mockResolvedValue({});

      await service.fireHook('lead.created', {
        tenantId: 'tenant-1',
        entityType: 'lead',
        entityId: 'lead-1',
        action: 'created',
        data: {},
      });

      expect(mockPrisma.pluginHookLog.create).toHaveBeenCalled();
      expect(mockPluginService.clearErrors).toHaveBeenCalled();
    });
  });

  describe('getHookLogs', () => {
    it('should return filtered logs', async () => {
      mockPrisma.pluginHookLog.findMany.mockResolvedValue([
        { id: 'log-1', hookPoint: 'lead.created', status: 'SUCCESS' },
      ]);

      const result = await service.getHookLogs('tenant-1', {
        hookPoint: 'lead.created',
        status: 'SUCCESS',
        limit: 10,
      });

      expect(result).toHaveLength(1);
      expect(mockPrisma.pluginHookLog.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-1',
          hookPoint: 'lead.created',
          status: 'SUCCESS',
        },
        orderBy: { executedAt: 'desc' },
        take: 10,
      });
    });
  });
});
