export class UpdateOrganizationCommand {
  constructor(
    public readonly organizationId: string,
    public readonly data: {
      name?: string;
      website?: string;
      email?: string;
      phone?: string;
      gstNumber?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      pincode?: string;
      industry?: string;
      notes?: string;
    },
    public readonly filterIds?: string[],
  ) {}
}
