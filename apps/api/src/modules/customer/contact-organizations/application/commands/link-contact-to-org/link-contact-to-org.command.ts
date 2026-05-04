export class LinkContactToOrgCommand {
  constructor(
    public readonly contactId: string,
    public readonly organizationId: string,
    public readonly relationType?: string,
    public readonly isPrimary?: boolean,
    public readonly designation?: string,
    public readonly department?: string,
    public readonly startDate?: Date,
  ) {}
}
