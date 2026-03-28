export class DeleteScheduledTestCommand {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}
