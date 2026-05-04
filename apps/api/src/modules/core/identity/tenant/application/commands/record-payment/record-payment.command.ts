export class RecordPaymentCommand {
  constructor(
    public readonly tenantId: string,
    public readonly invoiceId: string,
    public readonly gatewayPaymentId: string,
    public readonly amount: number,
  ) {}
}
