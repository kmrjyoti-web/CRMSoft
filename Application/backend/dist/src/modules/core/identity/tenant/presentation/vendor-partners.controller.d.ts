import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class VendorPartnersController {
    list(page?: number, limit?: number): Promise<ApiResponse<never[]>>;
    getById(id: string): Promise<ApiResponse<{
        id: string;
        name: string;
        status: string;
    }>>;
    create(body: any): Promise<ApiResponse<any>>;
    update(id: string, body: any): Promise<ApiResponse<any>>;
}
