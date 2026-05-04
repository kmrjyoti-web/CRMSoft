export class GetDelegationStatusQuery {
  constructor(
    public readonly userId?: string,
    public readonly isActive?: boolean,
  ) {}
}
