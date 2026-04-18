export declare class WebhookSignerService {
    sign(payload: Record<string, any>, secret: string): string;
    verify(payload: string, signature: string, secret: string): boolean;
}
