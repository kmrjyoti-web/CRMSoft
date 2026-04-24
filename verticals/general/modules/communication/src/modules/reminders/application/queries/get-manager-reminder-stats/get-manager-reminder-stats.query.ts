export class GetManagerReminderStatsQuery {
  constructor(
    public readonly userId: string,
    public readonly roleLevel: number,
  ) {}
}
