export class GetEntityOwnersQuery {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
  ) {}
}
