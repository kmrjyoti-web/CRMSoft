import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ScopeCheckerService } from '../services/scope-checker.service';
import { AppError } from '../../../common/errors/app-error';
import { API_SCOPES_KEY } from '../decorators/api-scopes.decorator';

@Injectable()
export class ApiScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly scopeChecker: ScopeCheckerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(API_SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredScopes || requiredScopes.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const keyScopes: string[] = request.apiKeyScopes || [];

    if (!this.scopeChecker.hasScopes(keyScopes, requiredScopes)) {
      const missing = this.scopeChecker.getMissingScopes(keyScopes, requiredScopes);
      throw AppError.from('API_SCOPE_INSUFFICIENT').withDetails({
        required: requiredScopes,
        missing,
        granted: keyScopes,
      });
    }

    return true;
  }
}
