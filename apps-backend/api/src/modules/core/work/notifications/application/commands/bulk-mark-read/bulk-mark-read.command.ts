export class BulkMarkReadCommand {
  constructor(
    public readonly notificationIds: string[],
    public readonly userId: string,
  ) {}
}
