export class UpdateTestPlanCommand {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly version?: string,
    public readonly targetModules?: string[],
    public readonly status?: string,
  ) {}
}
