export class GetReminderListQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly recipientId?: string,
    public readonly channel?: string,
    public readonly isSent?: boolean,
  ) {}
}
