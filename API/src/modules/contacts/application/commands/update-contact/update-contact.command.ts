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
  ) {}
}
