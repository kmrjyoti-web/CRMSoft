export class ListTargetsQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly sortBy: string = 'createdAt',
    public readonly sortOrder: 'asc' | 'desc' = 'desc',
    public readonly userId?: string,
    public readonly period?: string,
    public readonly metric?: string,
    public readonly isActive?: boolean,
  ) {}
}
