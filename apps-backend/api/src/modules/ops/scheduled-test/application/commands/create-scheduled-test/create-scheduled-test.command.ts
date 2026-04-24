export class CreateScheduledTestCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly cronExpression: string,
    public readonly targetModules: string[],
    public readonly testTypes: string[],
    public readonly description?: string,
    public readonly dbSourceType?: string,
  ) {}
}
