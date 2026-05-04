export class UpdateTenantSettingsCommand {
  constructor(
    public readonly tenantId: string,
    public readonly settings: Record<string, any>,
  ) {}
}
