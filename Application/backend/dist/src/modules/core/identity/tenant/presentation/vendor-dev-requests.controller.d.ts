import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class VendorDevRequestsController {
    list(page?: number, limit?: number): Promise<ApiResponse<never[]>>;
    getById(id: string): Promise<ApiResponse<{
        id: string;
        title: string;
        status: string;
        createdAt: string;
    }>>;
    create(body: any): Promise<ApiResponse<any>>;
    update(id: string, body: any): Promise<ApiResponse<any>>;
    updateStatus(id: string, body: any): Promise<ApiResponse<{
        id: string;
        status: any;
        updatedAt: string;
    }>>;
}
