export declare class GenerateInvoiceCommand {
    readonly tenantId: string;
    readonly subscriptionId: string;
    readonly periodStart: Date;
    readonly periodEnd: Date;
    readonly amount: number;
    readonly tax: number;
    constructor(tenantId: string, subscriptionId: string, periodStart: Date, periodEnd: Date, amount: number, tax: number);
}
