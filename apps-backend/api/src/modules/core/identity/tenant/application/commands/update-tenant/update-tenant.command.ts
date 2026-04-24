export class UpdateTenantCommand {
  constructor(
    public readonly tenantId: string,
    public readonly name?: string,
    public readonly domain?: string,
    public readonly logo?: string,
    public readonly settings?: Record<string, any>,
  ) {}
}
