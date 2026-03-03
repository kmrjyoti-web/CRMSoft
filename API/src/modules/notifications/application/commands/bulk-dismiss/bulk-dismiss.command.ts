export class BulkDismissCommand {
  constructor(
    public readonly notificationIds: string[],
    public readonly userId: string,
  ) {}
}
