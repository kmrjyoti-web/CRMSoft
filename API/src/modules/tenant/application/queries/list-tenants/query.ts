export class ListTenantsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
    public readonly search?: string,
  ) {}
}
