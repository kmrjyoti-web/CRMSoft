import { RefundStatus } from '@prisma/working-client';
export declare class CreateRefundDto {
    paymentId: string;
    amount: number;
    reason: string;
}
export declare class RefundQueryDto {
    paymentId?: string;
    status?: RefundStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}
