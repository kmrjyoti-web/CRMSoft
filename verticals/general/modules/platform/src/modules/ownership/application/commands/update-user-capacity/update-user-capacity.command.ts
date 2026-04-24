export class UpdateUserCapacityCommand {
  constructor(
    public readonly userId: string,
    public readonly data: {
      maxLeads?: number; maxContacts?: number; maxOrganizations?: number;
      maxQuotations?: number; maxTotal?: number;
    },
  ) {}
}
