export class LinkEmailToEntityCommand {
  constructor(
    public readonly emailId: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly userId: string,
  ) {}
}
