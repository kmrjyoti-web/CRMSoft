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

const mockWorkingClient = {
  contact: { findFirst: jest.fn() },
  organization: { findFirst: jest.fn() },
  ledgerMaster: { findFirst: jest.fn() },
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
    mockUserRepo = {
      findByLinkedEntity: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue({ success: true, data: { id: 'cu-1', email: 'ravi@example.com' } }),
    };
    handler = new ActivatePortalHandler(mockUserRepo, mockPrisma as any, mockPluginRegistry as any);
  });

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
    mockUserRepo.findByLinkedEntity.mockResolvedValue({
      id: 'existing', isDeleted: false,
    });

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
});
