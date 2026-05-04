export class ListVersionsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
    public readonly releaseType?: string,
  ) {}
}
