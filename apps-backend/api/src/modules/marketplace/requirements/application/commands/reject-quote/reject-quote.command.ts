export class RejectQuoteCommand {
  constructor(
    public readonly requirementId: string,
    public readonly quoteId: string,
    public readonly tenantId: string,
    public readonly buyerId: string,
  ) {}
}
