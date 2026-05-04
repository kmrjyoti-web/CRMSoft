export class GetNotificationByIdQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
