export class CreateTestRunCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly testTypes: string[],
    public readonly targetModules: string[],
    public readonly runType: string,
    public readonly testEnvId?: string,
  ) {}
}
