export class AddBroadcastRecipientsCommand {
  constructor(
    public readonly broadcastId: string,
    public readonly recipients: {
      phoneNumber: string;
      contactName?: string;
      variables?: any;
    }[],
  ) {}
}
