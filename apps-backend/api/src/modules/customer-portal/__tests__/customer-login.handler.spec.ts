import { CustomerLoginHandler } from '../application/commands/customer-login/customer-login.handler';
import { CustomerLoginCommand } from '../application/commands/customer-login/customer-login.command';
import { CustomerUserEntity } from '../domain/entities/customer-user.entity';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

const makeUser = async (overrides: Partial<{
  isActive: boolean;
  lockedUntil: Date;
  passwordOverride: string;
}> = {}) => {
  const { isOk } = await import('@/common/types');
  const result = await CustomerUserEntity.create('user-1', 'tenant-1', {
    email: 'test@company.com',
    password: overrides.passwordOverride ?? 'TestPass@123',
    linkedEntityType: 'CONTACT',
    linkedEntityId: 'entity-1',
    linkedEntityName: 'Ravi Kumar',
    displayName: 'Ravi Kumar',
    isActive: overrides.isActive ?? true,
    createdById: 'admin-1',
  });
  expect(isOk(result)).toBe(true);
  if (!isOk(result)) throw new Error('Failed to create user');
  const user = result.data;
  if (overrides.lockedUntil) (user as any).props.lockedUntil = overrides.lockedUntil;
  return user;
};

const mockJwt = { sign: jest.fn().mockReturnValue('access-token') };
const mockConfig = { get: jest.fn().mockReturnValue('24h') };
const mockPrisma = {
  identity: {
    customerPortalLog: { create: jest.fn().mockResolvedValue({}) },
    customerMenuCategory: { findUnique: jest.fn().mockResolvedValue(null) },
  },
};

describe('CustomerLoginHandler', () => {
  let handler: CustomerLoginHandler;
  let mockUserRepo: jest.Mocked<any>;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    };
    handler = new CustomerLoginHandler(
      mockUserRepo,
      mockJwt as any,
      mockConfig as any,
      mockPrisma as any,
    );
  });

  it('returns tokens and menu on successful login', async () => {
    const user = await makeUser();
    mockUserRepo.findByEmail.mockResolvedValue(user);

    const result = await handler.execute(
      new CustomerLoginCommand('test@company.com', 'TestPass@123', 'tenant-1'),
    );

    expect(result.accessToken).toBe('access-token');
    expect(result.user.email).toBe('test@company.com');
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
  });

  it('throws UnauthorizedException when user not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    await expect(
      handler.execute(new CustomerLoginCommand('nobody@x.com', 'pass', 'tenant-1')),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws ForbiddenException when account deactivated', async () => {
    const user = await makeUser({ isActive: false });
    mockUserRepo.findByEmail.mockResolvedValue(user);
    await expect(
      handler.execute(new CustomerLoginCommand('test@company.com', 'TestPass@123', 'tenant-1')),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when account locked', async () => {
    const user = await makeUser({ lockedUntil: new Date(Date.now() + 60_000) });
    mockUserRepo.findByEmail.mockResolvedValue(user);
    await expect(
      handler.execute(new CustomerLoginCommand('test@company.com', 'TestPass@123', 'tenant-1')),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws UnauthorizedException on wrong password and increments failedAttempts', async () => {
    const user = await makeUser();
    mockUserRepo.findByEmail.mockResolvedValue(user);
    await expect(
      handler.execute(new CustomerLoginCommand('test@company.com', 'WrongPassword', 'tenant-1')),
    ).rejects.toThrow(UnauthorizedException);
    expect(mockUserRepo.update).toHaveBeenCalled();
  });
});
