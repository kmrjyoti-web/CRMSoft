export class ListTestPlansQuery {
  constructor(
    public readonly tenantId: string,
    public readonly status?: string,
    public readonly search?: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
