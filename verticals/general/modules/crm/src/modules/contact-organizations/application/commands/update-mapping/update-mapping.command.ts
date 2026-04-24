export class UpdateMappingCommand {
  constructor(
    public readonly mappingId: string,
    public readonly data: {
      designation?: string;
      department?: string;
    },
  ) {}
}
