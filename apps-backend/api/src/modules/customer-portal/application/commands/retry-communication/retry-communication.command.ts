export class RetryCommunicationCommand {
  constructor(
    public readonly tenantId: string,
    public readonly adminId: string,
    public readonly communicationLogId: string,
  ) {}
}
