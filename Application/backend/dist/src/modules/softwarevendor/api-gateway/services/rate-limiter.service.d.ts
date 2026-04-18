export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    limit: number;
    window: string;
    resetAt: Date;
    usage: {
        minute: {
            used: number;
            limit: number;
        };
        hour: {
            used: number;
            limit: number;
        };
        day: {
            used: number;
            limit: number;
        };
    };
}
export declare class RateLimiterService {
    private windows;
    check(apiKeyId: string, limits: {
        perMinute?: number;
        perHour?: number;
        perDay?: number;
    }): RateLimitResult;
    getUsage(apiKeyId: string): Record<string, {
        used: number;
    }>;
    reset(apiKeyId: string): void;
    cleanup(): void;
}
