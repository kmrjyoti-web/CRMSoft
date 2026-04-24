export class AcceptQuoteCommand {
  constructor(
    public readonly requirementId: string,
    public readonly quoteId: string,
    public readonly tenantId: string,
    public readonly buyerId: string,
  ) {}
}
