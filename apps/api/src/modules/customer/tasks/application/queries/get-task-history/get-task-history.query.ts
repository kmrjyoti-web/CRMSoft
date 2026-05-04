export class GetTaskHistoryQuery {
  constructor(
    public readonly taskId: string,
    public readonly page: number = 1,
    public readonly limit: number = 50,
  ) {}
}
