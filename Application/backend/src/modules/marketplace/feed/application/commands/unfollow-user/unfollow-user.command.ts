export class UnfollowUserCommand {
  constructor(
    public readonly tenantId: string,
    public readonly followerId: string,
    public readonly followingId: string,
  ) {}
}
