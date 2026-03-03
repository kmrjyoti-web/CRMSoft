export class CancelDemoCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly reason: string,
    public readonly isNoShow?: boolean,
  ) {}
}
