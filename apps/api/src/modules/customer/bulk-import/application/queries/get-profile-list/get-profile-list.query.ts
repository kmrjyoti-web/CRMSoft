export class GetProfileListQuery {
  constructor(
    public readonly targetEntity?: string,
    public readonly status?: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
