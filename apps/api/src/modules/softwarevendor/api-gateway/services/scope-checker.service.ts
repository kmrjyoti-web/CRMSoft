import { Injectable } from '@nestjs/common';

@Injectable()
export class ScopeCheckerService {
  hasScopes(keyScopes: string[], requiredScopes: string[]): boolean {
    return requiredScopes.every(required => keyScopes.includes(required));
  }

  getMissingScopes(keyScopes: string[], requiredScopes: string[]): string[] {
    return requiredScopes.filter(required => !keyScopes.includes(required));
  }
}
