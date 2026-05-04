export class FollowUserCommand {
  constructor(
    public readonly tenantId: string,
    public readonly followerId: string,
    public readonly followingId: string,
  ) {}
}
