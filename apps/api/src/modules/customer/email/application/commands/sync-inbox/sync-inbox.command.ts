export class SyncInboxCommand {
  constructor(
    public readonly accountId: string,
    public readonly userId: string,
  ) {}
}
