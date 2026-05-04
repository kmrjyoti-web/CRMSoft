export class ApproveTaskCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}
