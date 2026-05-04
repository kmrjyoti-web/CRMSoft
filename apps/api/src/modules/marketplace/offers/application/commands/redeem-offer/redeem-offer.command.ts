export class RedeemOfferCommand {
  constructor(
    public readonly offerId: string,
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly orderId?: string,
    public readonly orderValue?: number,
    public readonly quantity?: number,
    public readonly productId?: string,
    public readonly categoryId?: string,
    public readonly city?: string,
    public readonly state?: string,
    public readonly pincode?: string,
    public readonly deviceType?: string,
    public readonly grade?: string,
    public readonly groupId?: string,
    public readonly isVerified?: boolean,
  ) {}
}
