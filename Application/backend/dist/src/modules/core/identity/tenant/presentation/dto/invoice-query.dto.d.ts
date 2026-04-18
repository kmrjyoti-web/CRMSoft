import { PaymentStatus } from '@prisma/identity-client';
export declare class InvoiceQueryDto {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
}
