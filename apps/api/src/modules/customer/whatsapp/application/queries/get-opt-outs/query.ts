export class GetOptOutsQuery {
  constructor(
    public readonly wabaId: string,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
