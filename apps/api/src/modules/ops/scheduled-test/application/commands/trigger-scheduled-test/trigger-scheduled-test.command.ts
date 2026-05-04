export class TriggerScheduledTestCommand {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly userId: string,
  ) {}
}
