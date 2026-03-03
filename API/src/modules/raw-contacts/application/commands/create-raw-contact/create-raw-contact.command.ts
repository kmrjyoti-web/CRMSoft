export class CreateRawContactCommand {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly createdById: string,
    public readonly source?: string,
    public readonly companyName?: string,
    public readonly designation?: string,
    public readonly department?: string,
    public readonly notes?: string,
    public readonly communications?: Array<{
      type: string;
      value: string;
      priorityType?: string;
      label?: string;
    }>,
    public readonly filterIds?: string[],
  ) {}
}
