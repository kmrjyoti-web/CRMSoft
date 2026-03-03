export class UpdatePlanCommand {
  constructor(
    public readonly planId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly price?: number,
    public readonly maxUsers?: number,
    public readonly maxContacts?: number,
    public readonly maxLeads?: number,
    public readonly maxProducts?: number,
    public readonly maxStorage?: number,
    public readonly features?: string[],
    public readonly isActive?: boolean,
    public readonly sortOrder?: number,
  ) {}
}
