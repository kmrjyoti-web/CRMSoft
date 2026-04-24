export class SoftDeleteOrganizationCommand {
  constructor(
    public readonly organizationId: string,
    public readonly deletedById: string,
  ) {}
}
