export class SoftDeleteLeadCommand {
  constructor(
    public readonly leadId: string,
    public readonly deletedById: string,
  ) {}
}
