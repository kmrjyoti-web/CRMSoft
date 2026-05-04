export class CreateTestPlanCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly version: string | undefined,
    public readonly targetModules: string[],
    public readonly items: Array<{
      moduleName: string;
      componentName: string;
      functionality: string;
      layer: string;
      priority?: string;
    }>,
  ) {}
}
