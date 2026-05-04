export class GetEntityStatusQuery {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
  ) {}
}
