export class GetFieldHistoryQuery {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly fieldName: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
