export declare class ScopeCheckerService {
    hasScopes(keyScopes: string[], requiredScopes: string[]): boolean;
    getMissingScopes(keyScopes: string[], requiredScopes: string[]): string[];
}
