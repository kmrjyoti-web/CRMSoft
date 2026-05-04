export class AddCampaignRecipientsCommand {
  constructor(
    public readonly campaignId: string,
    public readonly recipients: {
      email: string;
      firstName?: string;
      lastName?: string;
      companyName?: string;
      contactId?: string;
      mergeData?: Record<string, any>;
    }[],
  ) {}
}
