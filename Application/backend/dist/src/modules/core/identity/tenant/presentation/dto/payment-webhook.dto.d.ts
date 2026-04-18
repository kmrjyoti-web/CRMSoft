export declare class PaymentWebhookDto {
    event: string;
    payload: Record<string, unknown>;
    signature: string;
}
