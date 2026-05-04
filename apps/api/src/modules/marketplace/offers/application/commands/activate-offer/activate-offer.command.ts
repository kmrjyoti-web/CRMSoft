export class ActivateOfferCommand {
  constructor(
    public readonly offerId: string,
    public readonly tenantId: string,
    public readonly activatedById: string,
  ) {}
}
