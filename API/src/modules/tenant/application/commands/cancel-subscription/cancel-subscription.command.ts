export class CancelSubscriptionCommand {
  constructor(
    public readonly subscriptionId: string,
    public readonly tenantId: string,
  ) {}
}
