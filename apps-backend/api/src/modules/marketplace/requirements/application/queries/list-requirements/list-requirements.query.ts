export class ListRequirementsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly categoryId?: string,
    public readonly authorId?: string,
    public readonly search?: string,
  ) {}
}
