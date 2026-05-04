export class CreateLeadCommand {
  constructor(
    public readonly contactId: string,
    public readonly createdById: string,
    public readonly organizationId?: string,
    public readonly priority?: string,
    public readonly expectedValue?: number,
    public readonly expectedCloseDate?: Date,
    public readonly notes?: string,
    public readonly filterIds?: string[],
  ) {}
}
