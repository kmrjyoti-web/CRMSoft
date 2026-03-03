export class GetMyMenuQuery {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
    public readonly roleName: string,
  ) {}
}
