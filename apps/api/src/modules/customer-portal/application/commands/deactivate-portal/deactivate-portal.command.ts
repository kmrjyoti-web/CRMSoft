export class DeactivatePortalCommand {
  constructor(
    public readonly tenantId: string,
    public readonly customerUserId: string,
  ) {}
}
