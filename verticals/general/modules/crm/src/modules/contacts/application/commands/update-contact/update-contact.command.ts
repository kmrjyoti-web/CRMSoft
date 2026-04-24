export class UpdateContactCommand {
  constructor(
    public readonly contactId: string,
    public readonly updatedById: string,
    public readonly data: {
      firstName?: string;
      lastName?: string;
      designation?: string;
      department?: string;
      notes?: string;
    },
    public readonly filterIds?: string[],
    public readonly communications?: Array<{
      type: string;
      value: string;
      priorityType?: string;
      label?: string;
      isPrimary?: boolean;
    }>,
    public readonly organizationId?: string,
  ) {}
}
