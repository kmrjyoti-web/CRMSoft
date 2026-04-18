import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class VendorWalletController {
    getBalance(): Promise<ApiResponse<{
        balance: number;
        currency: string;
        lastUpdated: Date;
    }>>;
    listTransactions(page?: number, limit?: number): Promise<ApiResponse<never[]>>;
}
