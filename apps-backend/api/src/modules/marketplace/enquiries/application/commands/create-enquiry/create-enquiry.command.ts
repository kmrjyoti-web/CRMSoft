export class CreateEnquiryCommand {
  constructor(
    public readonly tenantId: string,
    public readonly listingId: string,
    public readonly enquirerId: string,
    public readonly message: string,
    public readonly quantity?: number,
    public readonly expectedPrice?: number,
    public readonly deliveryPincode?: string,
  ) {}
}
