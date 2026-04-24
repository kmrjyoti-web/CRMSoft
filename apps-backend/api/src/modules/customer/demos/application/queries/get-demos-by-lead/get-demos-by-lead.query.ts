export class GetDemosByLeadQuery {
  constructor(
    public readonly leadId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
