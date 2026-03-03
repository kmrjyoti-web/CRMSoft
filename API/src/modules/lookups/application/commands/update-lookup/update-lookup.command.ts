export class UpdateLookupCommand {
  constructor(
    public readonly lookupId: string,
    public readonly data: {
      displayName?: string;
      description?: string;
    },
  ) {}
}
