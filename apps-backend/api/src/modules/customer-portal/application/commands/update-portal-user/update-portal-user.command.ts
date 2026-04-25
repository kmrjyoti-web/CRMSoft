export class UpdatePortalUserCommand {
  constructor(
    public readonly customerUserId: string,
    public readonly menuCategoryId?: string,
    public readonly pageOverrides?: Record<string, boolean>,
    public readonly isActive?: boolean,
  ) {}
}
