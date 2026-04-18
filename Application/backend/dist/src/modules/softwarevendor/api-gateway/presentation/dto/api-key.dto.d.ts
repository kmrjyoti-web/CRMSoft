export declare class CreateApiKeyDto {
    name: string;
    description?: string;
    scopes: string[];
    environment?: string;
    expiresAt?: string;
    allowedIps?: string[];
    rateLimitPerMinute?: number;
    rateLimitPerHour?: number;
    rateLimitPerDay?: number;
}
export declare class UpdateApiKeyScopesDto {
    scopes: string[];
}
export declare class RevokeApiKeyDto {
    reason: string;
}
export declare class ApiKeyQueryDto {
    status?: string;
    environment?: string;
}
