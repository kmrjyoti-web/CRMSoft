export class GetUserEntitiesQuery {
  constructor(
    public readonly userId: string,
    public readonly entityType?: string,
    public readonly ownerType?: string,
    public readonly isActive?: boolean,
  ) {}
}
