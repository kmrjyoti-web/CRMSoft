export class CreateTenantCommand {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly adminEmail: string,
    public readonly adminPassword: string,
    public readonly adminFirstName: string,
    public readonly adminLastName: string,
    public readonly planId: string,
  ) {}
}
