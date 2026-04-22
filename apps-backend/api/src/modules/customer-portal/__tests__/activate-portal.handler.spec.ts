import { ActivatePortalHandler } from '../application/commands/activate-portal/activate-portal.handler';
import { ActivatePortalCommand } from '../application/commands/activate-portal/activate-portal.command';
import { ConflictException, BadRequestException } from '@nestjs/common';

const mockVerifiedContact = {
  id: 'entity-1',
  firstName: 'Ravi',
  lastName: 'Kumar',
  entityVerificationStatus: 'VERIFIED',
  communications: [{ value: 'ravi@example.com', type: 'EMAIL' }],
};

const mockUnverifiedContact = {
  ...mockVerifiedContact,
  entityVerificationStatus: 'UNVERIFIED',
};

const mockVerifiedOrg = {
  id: 'org-1',
  name: 'Acme Co',
  email: 'contact@acme.com',
  phone: '+919876543210',
  entityVerificationStatus: 'VERIFIED',
};

const mockUnverifiedOrg = {
  ...mockVerifiedOrg,
  entityVerificationStatus: 'UNVERIFIED',
};

const mockWorkingClient = {
  contact: { findFirst: jest.fn() },
  organization: { findFirst: jest.fn() },
  ledgerMaster: { findFirst: jest.fn() },
  communication: { findFirst: jest.fn() },
  communicationLog: {
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockPrisma = {
  identity: {
    customerMenuCategory: { findFirst: jest.fn().mockResolvedValue(null) },
  },
  getWorkingClient: jest.fn().mockResolvedValue(mockWorkingClient),
};

describe('ActivatePortalHandler', () => {
  let handler: ActivatePortalHandler;
  let mockUserRepo: jest.Mocked<any>;
  const mockPluginRegistry = {
    get: jest.fn().mockReturnValue(undefined),
    register: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn(),
    getCodes: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // reset default plugin behaviour — tests opt into handler
    mockPluginRegistry.get.mockReturnValue(undefined);
    // reset communicationLog side effects — tests opt into return shape
    mockWorkingClient.communicationLog.create.mockResolvedValue({ id: 'log-1' });
    mockWorkingClient.communicationLog.update.mockResolvedValue({});
    mockWorkingClient.communication.findFirst.mockResolvedValue(null);
    mockUserRepo = {
      findByLinkedEntity: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue({ success: true, data: { id: 'cu-1', email: 'ravi@example.com' } }),
    };
    handler = new ActivatePortalHandler(mockUserRepo, mockPrisma as any, mockPluginRegistry as any);
  });

  // ═══ Existing base tests (kept) ═══════════════════════

  it('activates portal successfully for a verified contact', async () => {
    mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);

    const result = await handler.execute(
      new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1'),
    );

    expect(result.email).toBe('ravi@example.com');
    expect(result.tempPassword).toBeDefined();
    expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictException if already activated', async () => {
    mockUserRepo.findByLinkedEntity.mockResolvedValue({ id: 'existing', isDeleted: false });

    await expect(
      handler.execute(new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1')),
    ).rejects.toThrow(ConflictException);
  });

  it('throws BadRequestException for unverified entity', async () => {
    mockWorkingClient.contact.findFirst.mockResolvedValue(mockUnverifiedContact);

    await expect(
      handler.execute(new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1')),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException if entity has no email', async () => {
    mockWorkingClient.contact.findFirst.mockResolvedValue({
      ...mockVerifiedContact,
      communications: [],
    });

    await expect(
      handler.execute(new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1')),
    ).rejects.toThrow(BadRequestException);
  });

  // ═══ Delivery paths (KUMAR-001X) ══════════════════════

  describe('channels parameter', () => {
    it('activates portal without delivery when channels is undefined', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);

      const result = await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1'),
      );

      expect(result.deliveries).toEqual([]);
      expect(mockWorkingClient.communicationLog.create).not.toHaveBeenCalled();
      expect(mockPluginRegistry.get).not.toHaveBeenCalled();
    });

    it('activates portal without delivery when channels is empty array', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);

      const result = await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1', undefined, [], undefined),
      );

      expect(result.deliveries).toEqual([]);
      expect(mockWorkingClient.communicationLog.create).not.toHaveBeenCalled();
    });

    it('creates a CommunicationLog entry per requested channel', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);
      mockWorkingClient.communication.findFirst.mockResolvedValue({ value: '+919876543210' });
      mockPluginRegistry.get.mockReturnValue({
        pluginCode: 'gmail',
        handle: jest.fn().mockResolvedValue({ messageId: 'msg-1' }),
        testConnection: jest.fn(),
      });

      await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1', undefined, ['EMAIL', 'WHATSAPP']),
      );

      expect(mockWorkingClient.communicationLog.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('EMAIL channel', () => {
    it('marks EMAIL log QUEUED_AWAITING_PLUGIN_IMPL when plugin succeeds', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);
      const handle = jest.fn().mockResolvedValue({ messageId: 'msg-ext' });
      mockPluginRegistry.get.mockReturnValue({ pluginCode: 'gmail', handle, testConnection: jest.fn() });

      const result = await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1', undefined, ['EMAIL']),
      );

      expect(result.deliveries).toEqual([
        { channel: 'EMAIL', status: 'QUEUED_AWAITING_PLUGIN_IMPL', logId: 'log-1' },
      ]);
      const updateCall = mockWorkingClient.communicationLog.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe('QUEUED_AWAITING_PLUGIN_IMPL');
      expect(updateCall.data.externalId).toBe('msg-ext');
    });

    it('marks EMAIL log FAILED and surfaces error when plugin throws', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);
      const handle = jest.fn().mockRejectedValue(new Error('SMTP timeout'));
      mockPluginRegistry.get.mockReturnValue({ pluginCode: 'gmail', handle, testConnection: jest.fn() });

      const result = await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1', undefined, ['EMAIL']),
      );

      expect(result.deliveries[0]).toMatchObject({
        channel: 'EMAIL',
        status: 'FAILED',
        error: 'SMTP timeout',
      });
      const updateCall = mockWorkingClient.communicationLog.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe('FAILED');
      expect(updateCall.data.errorMessage).toBe('SMTP timeout');
    });

    it('writes recipient email, subject, body into the CommunicationLog create payload', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);

      await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1', undefined, ['EMAIL']),
      );

      const createCall = mockWorkingClient.communicationLog.create.mock.calls[0][0];
      expect(createCall.data.channel).toBe('EMAIL');
      expect(createCall.data.direction).toBe('OUTBOUND');
      expect(createCall.data.recipientAddr).toBe('ravi@example.com');
      expect(createCall.data.subject).toContain('Customer Portal');
      expect(createCall.data.body).toContain('ravi@example.com');
      expect(createCall.data.body).toContain('Temporary Password');
      expect(createCall.data.tenantId).toBe('tenant-1');
      expect(createCall.data.entityType).toBe('CONTACT');
      expect(createCall.data.entityId).toBe('entity-1');
      expect(createCall.data.status).toBe('PENDING');
    });

    it('still QUEUED even when the gmail plugin is not registered (stub graceful)', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);
      mockPluginRegistry.get.mockReturnValue(undefined);

      const result = await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1', undefined, ['EMAIL']),
      );

      expect(result.deliveries[0].status).toBe('QUEUED_AWAITING_PLUGIN_IMPL');
    });

    it('passes hookPoint portal.invite.email and tenantId to plugin handle()', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);
      const handle = jest.fn().mockResolvedValue({ messageId: 'm1' });
      mockPluginRegistry.get.mockReturnValue({ pluginCode: 'gmail', handle, testConnection: jest.fn() });

      await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1', undefined, ['EMAIL']),
      );

      expect(mockPluginRegistry.get).toHaveBeenCalledWith('gmail');
      const [hookPoint, payload] = handle.mock.calls[0];
      expect(hookPoint).toBe('portal.invite.email');
      expect(payload.tenantId).toBe('tenant-1');
      expect(payload.entityType).toBe('CONTACT');
      expect(payload.entityId).toBe('entity-1');
      expect(payload.data.to).toBe('ravi@example.com');
    });
  });

  describe('WHATSAPP channel', () => {
    it('queries Communication model for CONTACT phone with correct filter', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);
      mockWorkingClient.communication.findFirst.mockResolvedValue({ value: '+919876543210' });

      await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1', undefined, ['WHATSAPP']),
      );

      const whereArg = mockWorkingClient.communication.findFirst.mock.calls[0][0].where;
      expect(whereArg.tenantId).toBe('tenant-1');
      expect(whereArg.contactId).toBe('entity-1');
      expect(whereArg.type).toEqual({ in: ['PHONE', 'MOBILE'] });
      expect(whereArg.isPrimary).toBe(true);
      expect(whereArg.isDeleted).toBe(false);
    });

    it('uses organization.phone directly for ORGANIZATION entityType (no Communication query)', async () => {
      mockWorkingClient.organization.findFirst.mockResolvedValue(mockVerifiedOrg);

      await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'ORGANIZATION', 'org-1', undefined, ['WHATSAPP']),
      );

      expect(mockWorkingClient.communication.findFirst).not.toHaveBeenCalled();
      const createCall = mockWorkingClient.communicationLog.create.mock.calls[0][0];
      expect(createCall.data.recipientAddr).toBe('+919876543210');
    });

    it('marks WHATSAPP log QUEUED_AWAITING_PLUGIN_IMPL when plugin succeeds', async () => {
      mockWorkingClient.organization.findFirst.mockResolvedValue(mockVerifiedOrg);
      const handle = jest.fn().mockResolvedValue({ id: 'wa-ext' });
      mockPluginRegistry.get.mockReturnValue({ pluginCode: 'whatsapp_cloud', handle, testConnection: jest.fn() });

      const result = await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'ORGANIZATION', 'org-1', undefined, ['WHATSAPP']),
      );

      expect(result.deliveries[0]).toMatchObject({
        channel: 'WHATSAPP',
        status: 'QUEUED_AWAITING_PLUGIN_IMPL',
      });
      expect(mockPluginRegistry.get).toHaveBeenCalledWith('whatsapp_cloud');
    });

    it('returns SKIPPED when CONTACT has no phone in Communication model', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);
      mockWorkingClient.communication.findFirst.mockResolvedValue(null);

      const result = await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1', undefined, ['WHATSAPP']),
      );

      expect(result.deliveries[0]).toMatchObject({
        channel: 'WHATSAPP',
        status: 'SKIPPED',
        error: 'No phone on record',
      });
      expect(mockWorkingClient.communicationLog.create).not.toHaveBeenCalled();
    });

    it('returns SKIPPED when ORGANIZATION has no phone field', async () => {
      mockWorkingClient.organization.findFirst.mockResolvedValue({
        ...mockVerifiedOrg,
        phone: null,
      });
      mockWorkingClient.communication.findFirst.mockResolvedValue(null);

      const result = await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'ORGANIZATION', 'org-1', undefined, ['WHATSAPP']),
      );

      expect(result.deliveries[0]).toMatchObject({
        channel: 'WHATSAPP',
        status: 'SKIPPED',
      });
    });

    it('marks WHATSAPP log FAILED when plugin throws', async () => {
      mockWorkingClient.organization.findFirst.mockResolvedValue(mockVerifiedOrg);
      const handle = jest.fn().mockRejectedValue(new Error('WA rate limit'));
      mockPluginRegistry.get.mockReturnValue({ pluginCode: 'whatsapp_cloud', handle, testConnection: jest.fn() });

      const result = await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'ORGANIZATION', 'org-1', undefined, ['WHATSAPP']),
      );

      expect(result.deliveries[0]).toMatchObject({
        channel: 'WHATSAPP',
        status: 'FAILED',
        error: 'WA rate limit',
      });
    });
  });

  describe('multi-channel delivery', () => {
    it('processes both EMAIL and WHATSAPP when both succeed', async () => {
      mockWorkingClient.organization.findFirst.mockResolvedValue(mockVerifiedOrg);
      mockUserRepo.save.mockResolvedValue({
        success: true,
        data: { id: 'cu-1', email: 'contact@acme.com' },
      });
      const gmailHandle = jest.fn().mockResolvedValue({ messageId: 'e1' });
      const waHandle = jest.fn().mockResolvedValue({ id: 'w1' });
      mockPluginRegistry.get.mockImplementation((code: string) =>
        code === 'gmail'
          ? { pluginCode: 'gmail', handle: gmailHandle, testConnection: jest.fn() }
          : code === 'whatsapp_cloud'
          ? { pluginCode: 'whatsapp_cloud', handle: waHandle, testConnection: jest.fn() }
          : undefined,
      );

      const result = await handler.execute(
        new ActivatePortalCommand(
          'tenant-1',
          'admin-1',
          'ORGANIZATION',
          'org-1',
          undefined,
          ['EMAIL', 'WHATSAPP'],
        ),
      );

      expect(result.deliveries).toHaveLength(2);
      expect(result.deliveries[0].channel).toBe('EMAIL');
      expect(result.deliveries[0].status).toBe('QUEUED_AWAITING_PLUGIN_IMPL');
      expect(result.deliveries[1].channel).toBe('WHATSAPP');
      expect(result.deliveries[1].status).toBe('QUEUED_AWAITING_PLUGIN_IMPL');
    });

    it('does not abort the second channel when the first fails', async () => {
      mockWorkingClient.organization.findFirst.mockResolvedValue(mockVerifiedOrg);
      mockUserRepo.save.mockResolvedValue({
        success: true,
        data: { id: 'cu-1', email: 'contact@acme.com' },
      });
      const gmailHandle = jest.fn().mockRejectedValue(new Error('email down'));
      const waHandle = jest.fn().mockResolvedValue({ id: 'w1' });
      mockPluginRegistry.get.mockImplementation((code: string) =>
        code === 'gmail'
          ? { pluginCode: 'gmail', handle: gmailHandle, testConnection: jest.fn() }
          : { pluginCode: 'whatsapp_cloud', handle: waHandle, testConnection: jest.fn() },
      );

      const result = await handler.execute(
        new ActivatePortalCommand(
          'tenant-1',
          'admin-1',
          'ORGANIZATION',
          'org-1',
          undefined,
          ['EMAIL', 'WHATSAPP'],
        ),
      );

      expect(result.deliveries).toHaveLength(2);
      expect(result.deliveries[0].status).toBe('FAILED');
      expect(result.deliveries[1].status).toBe('QUEUED_AWAITING_PLUGIN_IMPL');
    });

    it('returns every requested channel in result.deliveries (order preserved)', async () => {
      mockWorkingClient.organization.findFirst.mockResolvedValue(mockVerifiedOrg);
      mockUserRepo.save.mockResolvedValue({
        success: true,
        data: { id: 'cu-1', email: 'contact@acme.com' },
      });

      const result = await handler.execute(
        new ActivatePortalCommand(
          'tenant-1',
          'admin-1',
          'ORGANIZATION',
          'org-1',
          undefined,
          ['WHATSAPP', 'EMAIL'],
        ),
      );

      expect(result.deliveries.map((d) => d.channel)).toEqual(['WHATSAPP', 'EMAIL']);
    });
  });

  describe('entityVerificationStatus precondition with channels', () => {
    it('throws before any delivery when CONTACT is UNVERIFIED even with channels requested', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockUnverifiedContact);

      await expect(
        handler.execute(
          new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1', undefined, ['EMAIL']),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mockWorkingClient.communicationLog.create).not.toHaveBeenCalled();
    });

    it('throws before any delivery when ORGANIZATION is UNVERIFIED', async () => {
      mockWorkingClient.organization.findFirst.mockResolvedValue(mockUnverifiedOrg);

      await expect(
        handler.execute(
          new ActivatePortalCommand('tenant-1', 'admin-1', 'ORGANIZATION', 'org-1', undefined, ['EMAIL']),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mockWorkingClient.communicationLog.create).not.toHaveBeenCalled();
    });

    it('proceeds with delivery when entityVerificationStatus is VERIFIED', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);

      const result = await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1', undefined, ['EMAIL']),
      );

      expect(result.deliveries).toHaveLength(1);
    });
  });

  describe('tenant isolation', () => {
    it('scopes Communication phone lookup by tenantId', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);

      await handler.execute(
        new ActivatePortalCommand('tenant-A', 'admin-1', 'CONTACT', 'entity-1', undefined, ['WHATSAPP']),
      );

      const whereArg = mockWorkingClient.communication.findFirst.mock.calls[0][0].where;
      expect(whereArg.tenantId).toBe('tenant-A');
    });

    it('writes CommunicationLog rows with the command tenantId', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);

      await handler.execute(
        new ActivatePortalCommand('tenant-A', 'admin-1', 'CONTACT', 'entity-1', undefined, ['EMAIL']),
      );

      const createArg = mockWorkingClient.communicationLog.create.mock.calls[0][0];
      expect(createArg.data.tenantId).toBe('tenant-A');
    });
  });

  describe('customMessage handling', () => {
    it('includes customMessage in email body when provided', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);

      await handler.execute(
        new ActivatePortalCommand(
          'tenant-1',
          'admin-1',
          'CONTACT',
          'entity-1',
          undefined,
          ['EMAIL'],
          'Welcome aboard!',
        ),
      );

      const createArg = mockWorkingClient.communicationLog.create.mock.calls[0][0];
      expect(createArg.data.body).toContain('Welcome aboard!');
    });

    it('falls back to default body when customMessage is empty/undefined', async () => {
      mockWorkingClient.contact.findFirst.mockResolvedValue(mockVerifiedContact);

      await handler.execute(
        new ActivatePortalCommand('tenant-1', 'admin-1', 'CONTACT', 'entity-1', undefined, ['EMAIL']),
      );

      const createArg = mockWorkingClient.communicationLog.create.mock.calls[0][0];
      expect(createArg.data.body).toContain('You have been invited');
    });
  });
});
