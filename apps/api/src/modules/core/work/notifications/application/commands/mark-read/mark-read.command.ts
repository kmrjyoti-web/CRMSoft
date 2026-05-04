export class MarkReadCommand {
  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
  ) {}
}
