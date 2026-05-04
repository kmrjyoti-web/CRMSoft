export class ListTestEnvsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly status?: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
