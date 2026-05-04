/**
 * Auth test helpers — generate JWT tokens for test requests.
 */
import { JwtService } from '@nestjs/jwt';

const TEST_JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-for-unit-tests';

/**
 * Creates a signed JWT for the given user/tenant.
 */
export function createTestToken(payload: {
  userId: string;
  tenantId: string;
  role?: string;
  email?: string;
}): string {
  const jwt = new JwtService({ secret: TEST_JWT_SECRET });
  return jwt.sign(
    {
      sub: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role ?? 'admin',
      email: payload.email,
    },
    { expiresIn: '1h' },
  );
}

/**
 * Creates an Authorization header object for test HTTP requests.
 */
export function createAuthHeader(
  userId = 'test-user-1',
  tenantId = 'test-tenant-1',
  role = 'admin',
): Record<string, string> {
  return {
    Authorization: `Bearer ${createTestToken({ userId, tenantId, role })}`,
  };
}

/**
 * Creates a mock JwtAuthGuard context for unit tests (bypasses actual JWT validation).
 */
export function createMockExecutionContext(overrides: {
  userId?: string;
  tenantId?: string;
  role?: string;
  method?: string;
  url?: string;
} = {}) {
  const user = {
    userId: overrides.userId ?? 'test-user-1',
    tenantId: overrides.tenantId ?? 'test-tenant-1',
    role: overrides.role ?? 'admin',
  };

  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        headers: createAuthHeader(user.userId, user.tenantId, user.role),
        method: overrides.method ?? 'GET',
        url: overrides.url ?? '/test',
      }),
      getResponse: () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() }),
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  };
}
