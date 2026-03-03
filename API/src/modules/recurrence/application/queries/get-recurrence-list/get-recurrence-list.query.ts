export class GetRecurrenceListQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly createdById?: string,
    public readonly pattern?: string,
    public readonly isActive?: boolean,
  ) {}
}
