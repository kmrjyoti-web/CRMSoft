export class RunTestGroupCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly groupId: string,
    public readonly testEnvId?: string,
  ) {}
}
