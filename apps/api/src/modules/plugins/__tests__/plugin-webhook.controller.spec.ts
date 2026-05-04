import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PluginWebhookController } from '../presentation/plugin-webhook.controller';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PluginHookService } from '../services/plugin-hook.service';
import { PluginService } from '../services/plugin.service';
import { EncryptionService } from '../../softwarevendor/tenant-config/services/encryption.service';

describe('PluginWebhookController', () => {
  let controller: PluginWebhookController;

  const mockPrisma = {
    pluginRegistry: {
      findUnique: jest.fn(),
    },
  };
(mockPrisma as any).platform = mockPrisma;

  const mockPluginService = {
    isPluginEnabled: jest.fn(),
    getDecryptedCredentials: jest.fn(),
  };

  const mockHookService = {
    fireHook: jest.fn().mockResolvedValue(undefined),
  };

  const mockEncryption = {
    decrypt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PluginWebhookController],
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PluginService, useValue: mockPluginService },
        { provide: PluginHookService, useValue: mockHookService },
        { provide: EncryptionService, useValue: mockEncryption },
      ],
    }).compile();

    controller = module.get(PluginWebhookController);
    jest.clearAllMocks();
  });

  describe('handleWebhook', () => {
    it('should reject webhook for disabled plugin', async () => {
      mockPluginService.isPluginEnabled.mockResolvedValue(false);

      await expect(
        controller.handleWebhook('razorpay', 'tenant-1', {
          body: { event: 'payment.captured' },
          headers: {},
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject webhook for plugin without webhook config', async () => {
      mockPluginService.isPluginEnabled.mockResolvedValue(true);
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue({
        code: 'openai',
        webhookConfig: null,
      });

      await expect(
        controller.handleWebhook('openai', 'tenant-1', {
          body: {},
          headers: {},
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept webhook and fire hook for valid plugin', async () => {
      mockPluginService.isPluginEnabled.mockResolvedValue(true);
      mockPrisma.pluginRegistry.findUnique.mockResolvedValue({
        code: 'whatsapp_cloud',
        webhookConfig: {
          inbound: '/webhooks/whatsapp_cloud/{tenantId}',
          verificationMethod: 'challenge',
        },
      });

      const result = await controller.handleWebhook('whatsapp_cloud', 'tenant-1', {
        body: { entry: [{ changes: [{ field: 'messages' }] }] },
        headers: {},
      } as any);

      expect(result.received).toBe(true);
      expect(result.event).toBe('messages');
    });
  });

  describe('verifyWebhook (WhatsApp challenge)', () => {
    it('should return challenge when verify token matches', async () => {
      mockPluginService.getDecryptedCredentials.mockResolvedValue({
        webhookVerifyToken: 'my-token',
      });

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await controller.verifyWebhook(
        'whatsapp_cloud',
        'tenant-1',
        'subscribe',
        'my-token',
        'challenge-123',
        mockRes as any,
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith('challenge-123');
    });

    it('should return 403 for invalid verify token', async () => {
      mockPluginService.getDecryptedCredentials.mockResolvedValue({
        webhookVerifyToken: 'correct-token',
      });

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await controller.verifyWebhook(
        'whatsapp_cloud',
        'tenant-1',
        'subscribe',
        'wrong-token',
        'challenge-123',
        mockRes as any,
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});
