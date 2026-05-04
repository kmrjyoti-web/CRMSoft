export class GetEntityValuesQuery {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
  ) {}
}
