export declare class RecordPaymentCommand {
    readonly tenantId: string;
    readonly invoiceId: string;
    readonly gatewayPaymentId: string;
    readonly amount: number;
    constructor(tenantId: string, invoiceId: string, gatewayPaymentId: string, amount: number);
}
