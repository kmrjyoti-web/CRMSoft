export class GetMyTasksQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly status?: string,
  ) {}
}
