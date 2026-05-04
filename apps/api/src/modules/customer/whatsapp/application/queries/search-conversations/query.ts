export class SearchConversationsQuery {
  constructor(
    public readonly wabaId: string,
    public readonly query: string,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
