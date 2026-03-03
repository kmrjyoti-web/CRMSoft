export class GetFieldDefinitionsQuery {
  constructor(
    public readonly entityType: string,
    public readonly activeOnly?: boolean,
  ) {}
}
