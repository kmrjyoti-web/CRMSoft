export class CreateBroadcastCommand {
  constructor(
    public readonly wabaId: string,
    public readonly name: string,
    public readonly templateId: string,
    public readonly scheduledAt?: Date,
    public readonly throttlePerSecond?: number,
    public readonly userId: string = '',
    public readonly userName: string = '',
  ) {}
}
