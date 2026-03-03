export class SubscribeCommand {
  constructor(
    public readonly tenantId: string,
    public readonly planId: string,
  ) {}
}
