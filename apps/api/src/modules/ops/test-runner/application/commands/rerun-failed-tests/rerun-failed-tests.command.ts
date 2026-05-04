export class RerunFailedTestsCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly sourceRunId: string,
  ) {}
}
