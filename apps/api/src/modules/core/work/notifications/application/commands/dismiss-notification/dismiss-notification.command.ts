export class DismissNotificationCommand {
  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
  ) {}
}
