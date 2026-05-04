export class UpdateRawContactCommand {
  constructor(
    public readonly rawContactId: string,
    public readonly data: {
      firstName?: string;
      lastName?: string;
      companyName?: string;
      designation?: string;
      department?: string;
      notes?: string;
    },
  ) {}
}
