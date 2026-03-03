export class ListInvoicesQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
  ) {}
}
