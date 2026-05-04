export class GenerateInvoiceCommand {
  constructor(
    public readonly tenantId: string,
    public readonly subscriptionId: string,
    public readonly periodStart: Date,
    public readonly periodEnd: Date,
    public readonly amount: number,
    public readonly tax: number,
  ) {}
}
