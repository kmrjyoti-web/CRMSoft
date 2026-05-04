export class StartBroadcastCommand {
  constructor(
    public readonly broadcastId: string,
    public readonly userId: string,
  ) {}
}
