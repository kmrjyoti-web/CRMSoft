export class GetMappingSuggestionsQuery {
  constructor(
    public readonly targetEntity: string,
    public readonly fileHeaders?: string[],
  ) {}
}
