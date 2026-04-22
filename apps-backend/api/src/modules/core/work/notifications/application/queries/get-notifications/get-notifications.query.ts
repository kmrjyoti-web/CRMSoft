export class GetNotificationsQuery {
  constructor(
    public readonly userId: string,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly category?: string,
    public readonly status?: string,
    public readonly priority?: string,
  ) {}
}
