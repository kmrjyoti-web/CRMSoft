export class SearchEmailsQuery {
  constructor(
    public readonly query: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly accountId?: string,
  ) {}
}
