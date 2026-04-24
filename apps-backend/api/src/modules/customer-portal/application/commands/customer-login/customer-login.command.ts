export class CustomerLoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly tenantId: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}
