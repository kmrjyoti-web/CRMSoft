export class GetJobRowsQuery {
  constructor(
    public readonly jobId: string,
    public readonly status?: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
