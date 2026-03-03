import { ScopeCheckerService } from '../services/scope-checker.service';

describe('ScopeCheckerService', () => {
  let service: ScopeCheckerService;

  beforeEach(() => {
    service = new ScopeCheckerService();
  });

  it('should return true when all scopes are present', () => {
    expect(service.hasScopes(
      ['leads:read', 'leads:write', 'contacts:read'],
      ['leads:read', 'contacts:read'],
    )).toBe(true);
  });

  it('should return false when scope is missing', () => {
    expect(service.hasScopes(
      ['leads:read'],
      ['leads:read', 'leads:write'],
    )).toBe(false);
  });

  it('should return missing scopes', () => {
    const missing = service.getMissingScopes(
      ['leads:read'],
      ['leads:read', 'leads:write', 'contacts:read'],
    );
    expect(missing).toEqual(['leads:write', 'contacts:read']);
  });

  it('should handle empty required scopes', () => {
    expect(service.hasScopes(['leads:read'], [])).toBe(true);
  });

  it('should handle empty key scopes', () => {
    expect(service.hasScopes([], ['leads:read'])).toBe(false);
  });
});
