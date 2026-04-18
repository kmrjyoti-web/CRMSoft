export declare class CreateWebhookDto {
    url: string;
    description?: string;
    events: string[];
    timeoutSeconds?: number;
    maxRetries?: number;
    customHeaders?: Record<string, string>;
}
export declare class UpdateWebhookDto {
    url?: string;
    description?: string;
    events?: string[];
    status?: string;
    timeoutSeconds?: number;
    maxRetries?: number;
    customHeaders?: Record<string, string>;
}
export declare class WebhookQueryDto {
    status?: string;
    event?: string;
}
