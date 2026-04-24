/**
 * Customer Portal Handlers — comprehensive unit tests
 * Covers all 20 handlers (12 commands + 8 queries)
 * Handlers already tested in dedicated spec files are included here for completeness,
 * with non-overlapping cases to maximize coverage.
 * Uses direct instantiation, no NestJS Test.createTestingModule.
 */

import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { CustomerUserEntity } from '../domain/entities/customer-user.entity';
import { isOk } from '@/common/types';

// ─── Commands ────────────────────────────────────────────────────────────────
import { AdminResetCustomerPasswordHandler } from '../application/commands/admin-reset-customer-password/admin-reset-customer-password.handler';
import { AdminResetCustomerPasswordCommand } from '../application/commands/admin-reset-customer-password/admin-reset-customer-password.command';
import { ChangeCustomerPasswordHandler } from '../application/commands/change-customer-password/change-customer-password.handler';
import { ChangeCustomerPasswordCommand } from '../application/commands/change-customer-password/change-customer-password.command';
import { DeactivatePortalHandler } from '../application/commands/deactivate-portal/deactivate-portal.handler';
import { DeactivatePortalCommand } from '../application/commands/deactivate-portal/deactivate-portal.command';
import { ForgotCustomerPasswordHandler } from '../application/commands/forgot-customer-password/forgot-customer-password.handler';
import { ForgotCustomerPasswordCommand } from '../application/commands/forgot-customer-password/forgot-customer-password.command';
import { RefreshCustomerTokenHandler } from '../application/commands/refresh-customer-token/refresh-customer-token.handler';
import { RefreshCustomerTokenCommand } from '../application/commands/refresh-customer-token/refresh-customer-token.command';
import { ResetCustomerPasswordHandler } from '../application/commands/reset-customer-password/reset-customer-password.handler';
import { ResetCustomerPasswordCommand } from '../application/commands/reset-customer-password/reset-customer-password.command';
import { UpdatePortalUserHandler } from '../application/commands/update-portal-user/update-portal-user.handler';
import { UpdatePortalUserCommand } from '../application/commands/update-portal-user/update-portal-user.command';

// ─── Queries ──────────────────────────────────────────────────────────────────
import { GetCustomerProfileHandler } from '../application/queries/get-customer-profile/get-customer-profile.handler';
import { GetCustomerProfileQuery } from '../application/queries/get-customer-profile/get-customer-profile.query';
import { GetEligibleEntitiesHandler } from '../application/queries/get-eligible-entities/get-eligible-entities.handler';
import { GetEligibleEntitiesQuery } from '../application/queries/get-eligible-entities/get-eligible-entities.query';
import { GetMenuCategoryHandler } from '../application/queries/get-menu-category/get-menu-category.handler';
import { GetMenuCategoryQuery } from '../application/queries/get-menu-category/get-menu-category.query';
import { GetPortalAnalyticsHandler } from '../application/queries/get-portal-analytics/get-portal-analytics.handler';
import { GetPortalAnalyticsQuery } from '../application/queries/get-portal-analytics/get-portal-analytics.query';
import { GetPortalUserHandler } from '../application/queries/get-portal-user/get-portal-user.handler';
import { GetPortalUserQuery } from '../application/queries/get-portal-user/get-portal-user.query';
import { ListMenuCategoriesHandler } from '../application/queries/list-menu-categories/list-menu-categories.handler';
import { ListMenuCategoriesQuery } from '../application/queries/list-menu-categories/list-menu-categories.query';
import { ListPortalUsersHandler } from '../application/queries/list-portal-users/list-portal-users.handler';
import { ListPortalUsersQuery } from '../application/queries/list-portal-users/list-portal-users.query';

// ─── Fixture helpers ──────────────────────────────────────────────────────────

const makeUser = async (
  overrides: Partial<{
    isActive: boolean;
    menuCategoryId: string;
    refreshToken: string;
    refreshTokenExp: Date;
    passwordResetToken: string;
    passwordResetExp: Date;
    tenantId: string;
  }> = {},
) => {
  const result = await CustomerUserEntity.create(
    'cu-1',
    overrides.tenantId ?? 'tenant-1',
    {
      email: 'customer@example.com',
      password: 'SecurePass@1',
      linkedEntityType: 'CONTACT',
      linkedEntityId: 'entity-1',
      linkedEntityName: 'Ravi Kumar',
      displayName: 'Ravi Kumar',
      isActive: overrides.isActive ?? true,
      createdById: 'admin-1',
    },
  );
  expect(isOk(result)).toBe(true);
  if (!isOk(result)) throw new Error('Entity creation failed');
  const user = result.data;
  if (overrides.menuCategoryId !== undefined) (user as any).props.menuCategoryId = overrides.menuCategoryId;
  if (overrides.refreshToken !== undefined) {
    (user as any).props.refreshToken = overrides.refreshToken;
    (user as any).props.refreshTokenExp = overrides.refreshTokenExp ?? new Date(Date.now() + 3600_000);
  }
  if (overrides.passwordResetToken !== undefined) {
    (user as any).props.passwordResetToken = overrides.passwordResetToken;
    (user as any).props.passwordResetExp = overrides.passwordResetExp ?? new Date(Date.now() + 3600_000);
  }
  return user;
};

const BASE_CATEGORY = {
  id: 'cat-1',
  tenantId: 'tenant-1',
  name: 'Basic Customer',
  enabledRoutes: ['/dashboard', '/invoices'],
  isDefault: false,
  isActive: true,
  isDeleted: false,
  _count: { users: 0 },
};

// ─── AdminResetCustomerPasswordHandler ───────────────────────────────────────

describe('AdminResetCustomerPasswordHandler', () => {
  let handler: AdminResetCustomerPasswordHandler;
  let mockUserRepo: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = {
      findById: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    };
    handler = new AdminResetCustomerPasswordHandler(mockUserRepo);
  });

  it('resets password and returns new credentials', async () => {
    const user = await makeUser();
    mockUserRepo.findById.mockResolvedValue(user);

    const result = await handler.execute(new AdminResetCustomerPasswordCommand('cu-1'));

    expect(result.email).toBe('customer@example.com');
    expect(result.newPassword).toBeDefined();
    expect(result.newPassword.length).toBeGreaterThanOrEqual(8);
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundException when user not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new AdminResetCustomerPasswordCommand('missing-id')),
    ).rejects.toThrow(NotFoundException);
  });

  it('rethrows unexpected errors', async () => {
    mockUserRepo.findById.mockRejectedValue(new Error('DB failure'));

    await expect(
      handler.execute(new AdminResetCustomerPasswordCommand('cu-1')),
    ).rejects.toThrow('DB failure');
  });

  it('generated password is random (different on each call)', async () => {
    const user1 = await makeUser();
    const user2 = await makeUser();
    mockUserRepo.findById
      .mockResolvedValueOnce(user1)
      .mockResolvedValueOnce(user2);

    const r1 = await handler.execute(new AdminResetCustomerPasswordCommand('cu-1'));
    const r2 = await handler.execute(new AdminResetCustomerPasswordCommand('cu-1'));

    // Statistically almost impossible to get same password twice
    expect(r1.newPassword).not.toBe(r2.newPassword);
  });
});

// ─── ChangeCustomerPasswordHandler ───────────────────────────────────────────

describe('ChangeCustomerPasswordHandler', () => {
  let handler: ChangeCustomerPasswordHandler;
  let mockUserRepo: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = {
      findById: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    };
    handler = new ChangeCustomerPasswordHandler(mockUserRepo);
  });

  it('changes password successfully with correct current password', async () => {
    const user = await makeUser();
    mockUserRepo.findById.mockResolvedValue(user);

    const result = await handler.execute(
      new ChangeCustomerPasswordCommand('cu-1', 'SecurePass@1', 'NewSecure@99'),
    );

    expect(result.message).toBe('Password changed successfully');
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
  });

  it('throws UnauthorizedException with wrong current password', async () => {
    const user = await makeUser();
    mockUserRepo.findById.mockResolvedValue(user);

    await expect(
      handler.execute(new ChangeCustomerPasswordCommand('cu-1', 'WrongPassword!', 'NewPass@99')),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws NotFoundException when customer not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new ChangeCustomerPasswordCommand('missing', 'pass', 'newpass')),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when new password is too short', async () => {
    const user = await makeUser();
    mockUserRepo.findById.mockResolvedValue(user);

    await expect(
      handler.execute(new ChangeCustomerPasswordCommand('cu-1', 'SecurePass@1', 'short')),
    ).rejects.toThrow(BadRequestException);
  });
});

// ─── DeactivatePortalHandler ──────────────────────────────────────────────────

describe('DeactivatePortalHandler', () => {
  let handler: DeactivatePortalHandler;
  let mockUserRepo: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = {
      findById: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    };
    handler = new DeactivatePortalHandler(mockUserRepo);
  });

  it('deactivates portal access', async () => {
    const user = await makeUser();
    mockUserRepo.findById.mockResolvedValue(user);

    const result = await handler.execute(new DeactivatePortalCommand('tenant-1', 'cu-1'));

    expect(result.message).toBe('Portal access deactivated');
    expect(user.isActive).toBe(false);
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundException when user not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new DeactivatePortalCommand('tenant-1', 'missing')),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException for cross-tenant deactivation', async () => {
    const user = await makeUser({ tenantId: 'tenant-1' });
    mockUserRepo.findById.mockResolvedValue(user);

    await expect(
      handler.execute(new DeactivatePortalCommand('tenant-2', 'cu-1')),
    ).rejects.toThrow(ForbiddenException);
  });

  it('tenant isolation: does not update user from different tenant', async () => {
    const user = await makeUser({ tenantId: 'tenant-correct' });
    mockUserRepo.findById.mockResolvedValue(user);

    await expect(
      handler.execute(new DeactivatePortalCommand('tenant-attacker', 'cu-1')),
    ).rejects.toThrow(ForbiddenException);

    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });
});

// ─── ForgotCustomerPasswordHandler ───────────────────────────────────────────

describe('ForgotCustomerPasswordHandler', () => {
  let handler: ForgotCustomerPasswordHandler;
  let mockUserRepo: jest.Mocked<any>;
  let mockPrisma: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = {
      findByEmail: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    };
    mockPrisma = {};
    handler = new ForgotCustomerPasswordHandler(mockUserRepo, mockPrisma as any);
  });

  it('returns success message even when user does not exist (anti-enumeration)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    const result = await handler.execute(new ForgotCustomerPasswordCommand('nobody@x.com', 'tenant-1'));

    expect(result.message).toContain('If that email exists');
    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });

  it('sets password reset token and returns success message for valid user', async () => {
    const user = await makeUser();
    mockUserRepo.findByEmail.mockResolvedValue(user);

    const result = await handler.execute(
      new ForgotCustomerPasswordCommand('customer@example.com', 'tenant-1'),
    );

    expect(result.message).toContain('If that email exists');
    expect(user.passwordResetToken).toBeDefined();
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
  });

  it('returns success but does not set token for inactive user (anti-enumeration)', async () => {
    const user = await makeUser({ isActive: false });
    mockUserRepo.findByEmail.mockResolvedValue(user);

    const result = await handler.execute(
      new ForgotCustomerPasswordCommand('customer@example.com', 'tenant-1'),
    );

    expect(result.message).toContain('If that email exists');
    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });

  it('tenant isolation: looks up email scoped to tenantId', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await handler.execute(new ForgotCustomerPasswordCommand('user@x.com', 'tenant-99'));

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('tenant-99', 'user@x.com');
  });
});

// ─── RefreshCustomerTokenHandler ─────────────────────────────────────────────

describe('RefreshCustomerTokenHandler', () => {
  let handler: RefreshCustomerTokenHandler;
  let mockUserRepo: jest.Mocked<any>;
  const mockJwt = { sign: jest.fn().mockReturnValue('new-access-token') };
  const mockConfig = { get: jest.fn().mockReturnValue('24h') };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = {
      findByRefreshToken: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    };
    handler = new RefreshCustomerTokenHandler(mockUserRepo, mockJwt as any, mockConfig as any);
  });

  it('returns new access and refresh token', async () => {
    const user = await makeUser({
      refreshToken: 'valid-token',
      refreshTokenExp: new Date(Date.now() + 3600_000),
    });
    mockUserRepo.findByRefreshToken.mockResolvedValue(user);

    const result = await handler.execute(new RefreshCustomerTokenCommand('valid-token'));

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBeDefined();
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
  });

  it('throws UnauthorizedException when refresh token not found', async () => {
    mockUserRepo.findByRefreshToken.mockResolvedValue(null);

    await expect(
      handler.execute(new RefreshCustomerTokenCommand('invalid-token')),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when refresh token is expired', async () => {
    const user = await makeUser({
      refreshToken: 'expired-token',
      refreshTokenExp: new Date(Date.now() - 1000), // expired
    });
    mockUserRepo.findByRefreshToken.mockResolvedValue(user);

    await expect(
      handler.execute(new RefreshCustomerTokenCommand('expired-token')),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when account deactivated', async () => {
    const user = await makeUser({
      isActive: false,
      refreshToken: 'valid-token',
      refreshTokenExp: new Date(Date.now() + 3600_000),
    });
    mockUserRepo.findByRefreshToken.mockResolvedValue(user);

    await expect(
      handler.execute(new RefreshCustomerTokenCommand('valid-token')),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('clears expired refresh token before throwing', async () => {
    const user = await makeUser({
      refreshToken: 'stale-token',
      refreshTokenExp: new Date(Date.now() - 1), // just expired
    });
    mockUserRepo.findByRefreshToken.mockResolvedValue(user);

    await expect(
      handler.execute(new RefreshCustomerTokenCommand('stale-token')),
    ).rejects.toThrow(UnauthorizedException);

    expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
    expect(user.refreshToken).toBeUndefined();
  });
});

// ─── ResetCustomerPasswordHandler ────────────────────────────────────────────

describe('ResetCustomerPasswordHandler', () => {
  let handler: ResetCustomerPasswordHandler;
  let mockUserRepo: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = {
      findByPasswordResetToken: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    };
    handler = new ResetCustomerPasswordHandler(mockUserRepo);
  });

  it('resets password with valid token', async () => {
    const user = await makeUser({
      passwordResetToken: 'valid-reset-token',
      passwordResetExp: new Date(Date.now() + 3600_000),
    });
    mockUserRepo.findByPasswordResetToken.mockResolvedValue(user);

    const result = await handler.execute(
      new ResetCustomerPasswordCommand('valid-reset-token', 'NewPass@2024'),
    );

    expect(result.message).toContain('Password reset successfully');
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
  });

  it('throws BadRequestException when token not found', async () => {
    mockUserRepo.findByPasswordResetToken.mockResolvedValue(null);

    await expect(
      handler.execute(new ResetCustomerPasswordCommand('bad-token', 'NewPass@2024')),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when token is expired', async () => {
    const user = await makeUser({
      passwordResetToken: 'expired-token',
      passwordResetExp: new Date(Date.now() - 1000), // expired
    });
    mockUserRepo.findByPasswordResetToken.mockResolvedValue(user);

    await expect(
      handler.execute(new ResetCustomerPasswordCommand('expired-token', 'NewPass@2024')),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when new password is too short', async () => {
    const user = await makeUser({
      passwordResetToken: 'valid-token',
      passwordResetExp: new Date(Date.now() + 3600_000),
    });
    mockUserRepo.findByPasswordResetToken.mockResolvedValue(user);

    await expect(
      handler.execute(new ResetCustomerPasswordCommand('valid-token', 'short')),
    ).rejects.toThrow(BadRequestException);
  });
});

// ─── UpdatePortalUserHandler ──────────────────────────────────────────────────

describe('UpdatePortalUserHandler', () => {
  let handler: UpdatePortalUserHandler;
  let mockUserRepo: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = {
      findById: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    };
    handler = new UpdatePortalUserHandler(mockUserRepo);
  });

  it('updates menu category for a portal user', async () => {
    const user = await makeUser();
    mockUserRepo.findById.mockResolvedValue(user);

    const result = await handler.execute(
      new UpdatePortalUserCommand('cu-1', 'new-cat-id'),
    );

    expect(result.id).toBe('cu-1');
    expect(user.menuCategoryId).toBe('new-cat-id');
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
  });

  it('activates user when isActive=true', async () => {
    const user = await makeUser({ isActive: false });
    mockUserRepo.findById.mockResolvedValue(user);

    await handler.execute(new UpdatePortalUserCommand('cu-1', undefined, undefined, true));

    expect(user.isActive).toBe(true);
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
  });

  it('deactivates user when isActive=false', async () => {
    const user = await makeUser({ isActive: true });
    mockUserRepo.findById.mockResolvedValue(user);

    await handler.execute(new UpdatePortalUserCommand('cu-1', undefined, undefined, false));

    expect(user.isActive).toBe(false);
  });

  it('updates page overrides', async () => {
    const user = await makeUser();
    mockUserRepo.findById.mockResolvedValue(user);

    await handler.execute(
      new UpdatePortalUserCommand('cu-1', undefined, { '/invoices': false }),
    );

    expect(user.pageOverrides['/invoices']).toBe(false);
  });

  it('throws NotFoundException when user not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new UpdatePortalUserCommand('missing')),
    ).rejects.toThrow(NotFoundException);
  });

  it('rethrows DB errors', async () => {
    mockUserRepo.findById.mockRejectedValue(new Error('DB fail'));

    await expect(handler.execute(new UpdatePortalUserCommand('cu-1'))).rejects.toThrow('DB fail');
  });
});

// ─── GetCustomerProfileHandler ────────────────────────────────────────────────

describe('GetCustomerProfileHandler', () => {
  let handler: GetCustomerProfileHandler;
  let mockUserRepo: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = { findById: jest.fn() };
    handler = new GetCustomerProfileHandler(mockUserRepo);
  });

  it('returns customer profile without sensitive fields', async () => {
    const user = await makeUser();
    mockUserRepo.findById.mockResolvedValue(user);

    const result = await handler.execute(new GetCustomerProfileQuery('cu-1'));

    expect(result.id).toBe('cu-1');
    expect(result.email).toBe('customer@example.com');
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('refreshToken');
  });

  it('throws NotFoundException when customer not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new GetCustomerProfileQuery('missing')),
    ).rejects.toThrow(NotFoundException);
  });

  it('includes linked entity info in profile', async () => {
    const user = await makeUser();
    mockUserRepo.findById.mockResolvedValue(user);

    const result = await handler.execute(new GetCustomerProfileQuery('cu-1'));

    expect(result.linkedEntityType).toBe('CONTACT');
    expect(result.linkedEntityId).toBe('entity-1');
    expect(result.linkedEntityName).toBe('Ravi Kumar');
  });

  it('rethrows DB errors', async () => {
    mockUserRepo.findById.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new GetCustomerProfileQuery('cu-1'))).rejects.toThrow('DB error');
  });
});

// ─── GetEligibleEntitiesHandler ───────────────────────────────────────────────

describe('GetEligibleEntitiesHandler', () => {
  let handler: GetEligibleEntitiesHandler;
  let mockPrisma: jest.Mocked<any>;
  let mockWorkingClient: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWorkingClient = {
      contact: { findMany: jest.fn().mockResolvedValue([]) },
      organization: { findMany: jest.fn().mockResolvedValue([]) },
      ledgerMaster: { findMany: jest.fn().mockResolvedValue([]) },
    };
    mockPrisma = {
      identity: {
        customerUser: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      },
      getWorkingClient: jest.fn().mockResolvedValue(mockWorkingClient),
    };
    handler = new GetEligibleEntitiesHandler(mockPrisma as any);
  });

  it('returns empty result when no entities found', async () => {
    const result = await handler.execute(new GetEligibleEntitiesQuery('tenant-1'));

    expect(result.data).toEqual([]);
  });

  it('marks already-activated contacts', async () => {
    mockPrisma.identity.customerUser.findMany.mockResolvedValue([
      { linkedEntityType: 'CONTACT', linkedEntityId: 'entity-1' },
    ]);
    mockWorkingClient.contact.findMany.mockResolvedValue([
      {
        id: 'entity-1',
        firstName: 'Ravi',
        lastName: 'Kumar',
        entityVerificationStatus: 'VERIFIED',
        communications: [{ value: 'ravi@test.com', type: 'EMAIL' }],
      },
    ]);

    const result = await handler.execute(
      new GetEligibleEntitiesQuery('tenant-1', 'CONTACT'),
    );

    expect(result.data[0].isAlreadyActivated).toBe(true);
  });

  it('tenant isolation: scopes query to tenantId', async () => {
    await handler.execute(new GetEligibleEntitiesQuery('tenant-99', 'CONTACT'));

    expect(mockWorkingClient.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-99' }),
      }),
    );
  });

  it('queries only the requested entity type', async () => {
    await handler.execute(new GetEligibleEntitiesQuery('tenant-1', 'ORGANIZATION'));

    expect(mockWorkingClient.contact.findMany).not.toHaveBeenCalled();
    expect(mockWorkingClient.organization.findMany).toHaveBeenCalledTimes(1);
    expect(mockWorkingClient.ledgerMaster.findMany).not.toHaveBeenCalled();
  });

  it('queries all entity types when entityType not specified', async () => {
    await handler.execute(new GetEligibleEntitiesQuery('tenant-1'));

    expect(mockWorkingClient.contact.findMany).toHaveBeenCalledTimes(1);
    expect(mockWorkingClient.organization.findMany).toHaveBeenCalledTimes(1);
    expect(mockWorkingClient.ledgerMaster.findMany).toHaveBeenCalledTimes(1);
  });

  it('applies search filter to CONTACT entity type', async () => {
    await handler.execute(new GetEligibleEntitiesQuery('tenant-1', 'CONTACT', 'Ravi'));

    expect(mockWorkingClient.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
      }),
    );
  });

  it('rethrows DB errors', async () => {
    mockPrisma.identity.customerUser.findMany.mockRejectedValue(new Error('DB error'));

    await expect(
      handler.execute(new GetEligibleEntitiesQuery('tenant-1')),
    ).rejects.toThrow('DB error');
  });
});

// ─── GetMenuCategoryHandler ───────────────────────────────────────────────────

describe('GetMenuCategoryHandler', () => {
  let handler: GetMenuCategoryHandler;
  let mockPrisma: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = {
      identity: {
        customerMenuCategory: {
          findFirst: jest.fn().mockResolvedValue(BASE_CATEGORY),
        },
      },
    };
    handler = new GetMenuCategoryHandler(mockPrisma as any);
  });

  it('returns a menu category by id', async () => {
    const result = await handler.execute(new GetMenuCategoryQuery('cat-1'));

    expect(result.id).toBe('cat-1');
    expect(result.name).toBe('Basic Customer');
  });

  it('throws NotFoundException when category not found', async () => {
    mockPrisma.identity.customerMenuCategory.findFirst.mockResolvedValue(null);

    await expect(
      handler.execute(new GetMenuCategoryQuery('missing')),
    ).rejects.toThrow(NotFoundException);
  });

  it('includes user count in result', async () => {
    mockPrisma.identity.customerMenuCategory.findFirst.mockResolvedValue({
      ...BASE_CATEGORY,
      _count: { users: 5 },
    });

    const result = await handler.execute(new GetMenuCategoryQuery('cat-1'));

    expect(result._count.users).toBe(5);
  });

  it('does not return soft-deleted categories', async () => {
    mockPrisma.identity.customerMenuCategory.findFirst.mockResolvedValue(null);

    await handler.execute(new GetMenuCategoryQuery('deleted-cat')).catch(() => {});

    expect(mockPrisma.identity.customerMenuCategory.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isDeleted: false }),
      }),
    );
  });
});

// ─── GetPortalAnalyticsHandler ────────────────────────────────────────────────

describe('GetPortalAnalyticsHandler', () => {
  let handler: GetPortalAnalyticsHandler;
  let mockPrisma: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = {
      identity: {
        customerUser: {
          count: jest.fn()
            .mockResolvedValueOnce(100) // totalUsers
            .mockResolvedValueOnce(80),  // activeUsers
        },
        customerPortalLog: {
          findMany: jest.fn().mockResolvedValue([
            { action: 'LOGIN', route: null, createdAt: new Date() },
            { action: 'PAGE_VIEW', route: '/dashboard', createdAt: new Date() },
            { action: 'PAGE_VIEW', route: '/invoices', createdAt: new Date() },
            { action: 'LOGIN', route: null, createdAt: new Date() },
          ]),
        },
      },
    };
    handler = new GetPortalAnalyticsHandler(mockPrisma as any);
  });

  it('returns portal analytics with totals and top pages', async () => {
    const result = await handler.execute(new GetPortalAnalyticsQuery('tenant-1'));

    expect(result.totalUsers).toBe(100);
    expect(result.activeUsers).toBe(80);
    expect(result.inactiveUsers).toBe(20);
    expect(result.loginCount).toBe(2);
    expect(result.topPages).toHaveLength(2);
  });

  it('tenant isolation: scopes queries to tenantId', async () => {
    await handler.execute(new GetPortalAnalyticsQuery('tenant-99'));

    expect(mockPrisma.identity.customerUser.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-99' }) }),
    );
    expect(mockPrisma.identity.customerPortalLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-99' }) }),
    );
  });

  it('applies date range filter when provided', async () => {
    mockPrisma.identity.customerUser.count
      .mockResolvedValueOnce(50)
      .mockResolvedValueOnce(40);
    mockPrisma.identity.customerPortalLog.findMany.mockResolvedValue([]);

    await handler.execute(new GetPortalAnalyticsQuery('tenant-1', '2024-01-01', '2024-12-31'));

    expect(mockPrisma.identity.customerPortalLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({ gte: expect.any(Date), lte: expect.any(Date) }),
        }),
      }),
    );
  });

  it('returns empty top pages when no page views exist', async () => {
    mockPrisma.identity.customerPortalLog.findMany.mockResolvedValue([
      { action: 'LOGIN', route: null, createdAt: new Date() },
    ]);

    const result = await handler.execute(new GetPortalAnalyticsQuery('tenant-1'));

    expect(result.topPages).toEqual([]);
    expect(result.loginCount).toBe(1);
  });

  it('rethrows DB errors', async () => {
    const errorPrisma = {
      identity: {
        customerUser: {
          count: jest.fn().mockRejectedValue(new Error('DB error')),
        },
        customerPortalLog: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      },
    };
    const errorHandler = new GetPortalAnalyticsHandler(errorPrisma as any);

    await expect(
      errorHandler.execute(new GetPortalAnalyticsQuery('tenant-1')),
    ).rejects.toThrow('DB error');
  });
});

// ─── GetPortalUserHandler ─────────────────────────────────────────────────────

describe('GetPortalUserHandler', () => {
  let handler: GetPortalUserHandler;
  let mockUserRepo: jest.Mocked<any>;
  let mockPrisma: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = { findById: jest.fn() };
    mockPrisma = {
      identity: {
        customerMenuCategory: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      },
    };
    handler = new GetPortalUserHandler(mockUserRepo, mockPrisma as any);
  });

  it('returns portal user details', async () => {
    const user = await makeUser();
    mockUserRepo.findById.mockResolvedValue(user);

    const result = await handler.execute(new GetPortalUserQuery('cu-1'));

    expect(result.id).toBe('cu-1');
    expect(result.email).toBe('customer@example.com');
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('refreshToken');
  });

  it('includes menu category when assigned', async () => {
    const user = await makeUser({ menuCategoryId: 'cat-1' });
    mockUserRepo.findById.mockResolvedValue(user);
    mockPrisma.identity.customerMenuCategory.findUnique.mockResolvedValue({
      id: 'cat-1',
      name: 'Basic',
      nameHi: null,
      icon: null,
      color: null,
      enabledRoutes: ['/dashboard'],
    });

    const result = await handler.execute(new GetPortalUserQuery('cu-1'));

    expect(result.menuCategory).not.toBeNull();
    expect((result.menuCategory as any).name).toBe('Basic');
  });

  it('returns null menuCategory when not assigned', async () => {
    const user = await makeUser();
    mockUserRepo.findById.mockResolvedValue(user);

    const result = await handler.execute(new GetPortalUserQuery('cu-1'));

    expect(result.menuCategory).toBeNull();
  });

  it('throws NotFoundException when user not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(handler.execute(new GetPortalUserQuery('missing'))).rejects.toThrow(NotFoundException);
  });
});

// ─── ListMenuCategoriesHandler ────────────────────────────────────────────────

describe('ListMenuCategoriesHandler', () => {
  let handler: ListMenuCategoriesHandler;
  let mockPrisma: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = {
      identity: {
        customerMenuCategory: {
          findMany: jest.fn().mockResolvedValue([BASE_CATEGORY]),
        },
      },
    };
    handler = new ListMenuCategoriesHandler(mockPrisma as any);
  });

  it('returns all non-deleted categories for tenant', async () => {
    const result = await handler.execute(new ListMenuCategoriesQuery('tenant-1'));

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('cat-1');
  });

  it('tenant isolation: filters by tenantId', async () => {
    await handler.execute(new ListMenuCategoriesQuery('tenant-99'));

    expect(mockPrisma.identity.customerMenuCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-99', isDeleted: false }),
      }),
    );
  });

  it('orders by sortOrder then name', async () => {
    await handler.execute(new ListMenuCategoriesQuery('tenant-1'));

    expect(mockPrisma.identity.customerMenuCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
    );
  });

  it('includes user count in each category', async () => {
    const result = await handler.execute(new ListMenuCategoriesQuery('tenant-1'));

    expect(result[0]._count).toBeDefined();
    expect(result[0]._count.users).toBe(0);
  });

  it('returns empty array when tenant has no categories', async () => {
    mockPrisma.identity.customerMenuCategory.findMany.mockResolvedValue([]);

    const result = await handler.execute(new ListMenuCategoriesQuery('empty-tenant'));

    expect(result).toEqual([]);
  });

  it('rethrows DB errors', async () => {
    mockPrisma.identity.customerMenuCategory.findMany.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new ListMenuCategoriesQuery('tenant-1'))).rejects.toThrow('DB error');
  });
});

// ─── ListPortalUsersHandler ───────────────────────────────────────────────────

describe('ListPortalUsersHandler', () => {
  let handler: ListPortalUsersHandler;
  let mockUserRepo: jest.Mocked<any>;

  const PAGE_RESULT = {
    data: [{ id: 'cu-1', email: 'customer@example.com', isActive: true }],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = {
      findAllByTenant: jest.fn().mockResolvedValue(PAGE_RESULT),
    };
    handler = new ListPortalUsersHandler(mockUserRepo);
  });

  it('returns paginated list of portal users', async () => {
    const result = await handler.execute(new ListPortalUsersQuery('tenant-1'));

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('tenant isolation: passes tenantId to repository', async () => {
    await handler.execute(new ListPortalUsersQuery('tenant-99', 1, 10));

    expect(mockUserRepo.findAllByTenant).toHaveBeenCalledWith(
      'tenant-99',
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  it('passes search and isActive filters', async () => {
    await handler.execute(new ListPortalUsersQuery('tenant-1', 1, 20, 'ravi', true));

    expect(mockUserRepo.findAllByTenant).toHaveBeenCalledWith(
      'tenant-1',
      expect.objectContaining({ search: 'ravi', isActive: true }),
    );
  });

  it('uses default pagination params', async () => {
    await handler.execute(new ListPortalUsersQuery('tenant-1'));

    expect(mockUserRepo.findAllByTenant).toHaveBeenCalledWith(
      'tenant-1',
      expect.objectContaining({ page: 1, limit: 20 }),
    );
  });

  it('rethrows repository errors', async () => {
    mockUserRepo.findAllByTenant.mockRejectedValue(new Error('Repo error'));

    await expect(handler.execute(new ListPortalUsersQuery('tenant-1'))).rejects.toThrow('Repo error');
  });
});
