export class GetBroadcastRecipientsQuery {
  constructor(
    public readonly broadcastId: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
  ) {}
}
