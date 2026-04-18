import { CreditNoteStatus } from '@prisma/working-client';
export declare class CreateCreditNoteDto {
    invoiceId: string;
    amount: number;
    reason: string;
}
export declare class ApplyCreditNoteDto {
    applyToInvoiceId: string;
    amount?: number;
}
export declare class CreditNoteQueryDto {
    invoiceId?: string;
    status?: CreditNoteStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}
