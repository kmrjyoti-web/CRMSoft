export class UpdateScheduledTestCommand {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly cronExpression?: string,
    public readonly targetModules?: string[],
    public readonly testTypes?: string[],
    public readonly dbSourceType?: string,
    public readonly isActive?: boolean,
  ) {}
}
