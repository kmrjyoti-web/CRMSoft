export class GetDuplicatesQuery {
  constructor(
    public readonly jobId: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
