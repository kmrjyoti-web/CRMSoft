import { PaymentMethod, PaymentGateway, PaymentStatus } from '@prisma/working-client';
export declare class RecordPaymentDto {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    gateway?: PaymentGateway;
    chequeNumber?: string;
    chequeDate?: string;
    chequeBankName?: string;
    transactionRef?: string;
    upiTransactionId?: string;
    notes?: string;
}
export declare class CreateGatewayOrderDto {
    invoiceId: string;
    amount: number;
    gateway: PaymentGateway;
}
export declare class VerifyGatewayPaymentDto {
    gatewayOrderId: string;
    gatewayPaymentId: string;
    gatewaySignature: string;
}
export declare class PaymentQueryDto {
    invoiceId?: string;
    leadId?: string;
    status?: PaymentStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}
