import { ApiScopeGuard } from '../guards/api-scope.guard';
import { Reflector } from '@nestjs/core';
import { ScopeCheckerService } from '../services/scope-checker.service';

describe('ApiScopeGuard', () => {
  let guard: ApiScopeGuard;
  let mockReflector: Reflector;

  beforeEach(() => {
    mockReflector = { getAllAndOverride: jest.fn() } as any;
    guard = new ApiScopeGuard(mockReflector, new ScopeCheckerService());
  });

  const createContext = (scopes: string[]) => ({
    switchToHttp: () => ({
      getRequest: () => ({ apiKeyScopes: scopes }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  });

  it('should allow when no scopes required', () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(null);
    expect(guard.canActivate(createContext([]) as any)).toBe(true);
  });

  it('should allow when key has required scopes', () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['leads:read']);
    expect(guard.canActivate(createContext(['leads:read', 'leads:write']) as any)).toBe(true);
  });

  it('should reject when key lacks required scopes', () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['leads:write']);
    expect(() => guard.canActivate(createContext(['leads:read']) as any)).toThrow();
  });

  it('should include missing scopes in error', () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['leads:read', 'leads:write']);
    try {
      guard.canActivate(createContext(['leads:read']) as any);
      fail('Should have thrown');
    } catch (e: any) {
      expect(e.details?.missing).toContain('leads:write');
    }
  });
});
