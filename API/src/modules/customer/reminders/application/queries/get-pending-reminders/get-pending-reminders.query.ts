export class GetPendingRemindersQuery {
  constructor(
    public readonly recipientId?: string,
    public readonly page: number = 1,
    public readonly limit: number = 50,
  ) {}
}
