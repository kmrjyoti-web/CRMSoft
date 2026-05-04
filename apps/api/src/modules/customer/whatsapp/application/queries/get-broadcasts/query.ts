export class GetBroadcastsQuery {
  constructor(
    public readonly wabaId: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
  ) {}
}
