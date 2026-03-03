export class CreateOrganizationCommand {
  constructor(
    public readonly name: string,
    public readonly createdById: string,
    public readonly website?: string,
    public readonly email?: string,
    public readonly phone?: string,
    public readonly gstNumber?: string,
    public readonly address?: string,
    public readonly city?: string,
    public readonly state?: string,
    public readonly country?: string,
    public readonly pincode?: string,
    public readonly industry?: string,
    public readonly notes?: string,
    public readonly filterIds?: string[],
  ) {}
}
