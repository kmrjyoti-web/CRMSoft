export class DisconnectAccountCommand {
  constructor(
    public readonly accountId: string,
    public readonly userId: string,
  ) {}
}
