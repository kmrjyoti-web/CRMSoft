export class UpdateLeadCommand {
  constructor(
    public readonly leadId: string,
    public readonly data: {
      priority?: string;
      expectedValue?: number;
      expectedCloseDate?: Date;
      notes?: string;
    },
    public readonly filterIds?: string[],
  ) {}
}
