export class GetUnsubscribesQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
