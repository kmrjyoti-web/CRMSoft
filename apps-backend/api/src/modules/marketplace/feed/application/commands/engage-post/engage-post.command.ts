export class EngagePostCommand {
  constructor(
    public readonly postId: string,
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly action: string,
    public readonly sharedTo?: string,
    public readonly city?: string,
    public readonly state?: string,
    public readonly deviceType?: string,
  ) {}
}
