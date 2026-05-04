export class GetTemplatesQuery {
  constructor(
    public readonly wabaId: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
    public readonly category?: string,
  ) {}
}
