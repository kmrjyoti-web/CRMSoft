export class ListSavedFiltersQuery {
  constructor(
    public readonly userId: string,
    public readonly entityType?: string,
    public readonly search?: string,
    public readonly page = 1,
    public readonly limit = 50,
  ) {}
}
