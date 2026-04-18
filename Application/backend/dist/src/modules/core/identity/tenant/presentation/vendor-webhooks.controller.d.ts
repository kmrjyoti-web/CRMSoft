import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class VendorWebhooksController {
    list(page?: number, limit?: number): Promise<ApiResponse<never[]>>;
    listDeliveries(webhookId: string): Promise<ApiResponse<never[]>>;
    testWebhook(webhookId: string): Promise<ApiResponse<{
        delivered: boolean;
    }>>;
    retryDelivery(deliveryId: string): Promise<ApiResponse<{
        retried: boolean;
    }>>;
}
