export class ChangeLeadStatusCommand {
  constructor(
    public readonly leadId: string,
    public readonly newStatus: string,
    public readonly reason?: string,
  ) {}
}
