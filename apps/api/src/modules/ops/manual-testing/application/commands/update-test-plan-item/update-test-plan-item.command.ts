export class UpdateTestPlanItemCommand {
  constructor(
    public readonly itemId: string,
    public readonly planId: string,
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly status?: string,
    public readonly notes?: string,
    public readonly errorDetails?: string,
    public readonly priority?: string,
    public readonly moduleName?: string,
    public readonly componentName?: string,
    public readonly functionality?: string,
    public readonly layer?: string,
  ) {}
}
