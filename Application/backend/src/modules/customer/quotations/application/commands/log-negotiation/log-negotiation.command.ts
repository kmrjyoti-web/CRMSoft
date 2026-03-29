export class LogNegotiationCommand {
  constructor(
    public readonly quotationId: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly negotiationType: string,
    public readonly customerRequirement?: string,
    public readonly customerBudget?: number,
    public readonly customerPriceExpected?: number,
    public readonly ourPrice?: number,
    public readonly proposedDiscount?: number,
    public readonly counterOfferAmount?: number,
    public readonly itemsAdded?: any,
    public readonly itemsRemoved?: any,
    public readonly itemsModified?: any,
    public readonly termsChanged?: string,
    public readonly note?: string,
    public readonly outcome?: string,
    public readonly contactPersonId?: string,
    public readonly contactPersonName?: string,
  ) {}
}
