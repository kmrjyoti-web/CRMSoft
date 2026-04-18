export declare const API_RATE_LIMIT_KEY = "api_rate_limit";
export declare const ApiRateLimit: (limit: number, window: "SECOND" | "MINUTE" | "HOUR" | "DAY") => import("@nestjs/common").CustomDecorator<string>;
