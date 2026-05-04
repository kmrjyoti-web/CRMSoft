export class ConvertEnquiryCommand {
  constructor(
    public readonly enquiryId: string,
    public readonly tenantId: string,
    public readonly convertedById: string,
    public readonly crmLeadId?: string,
  ) {}
}
