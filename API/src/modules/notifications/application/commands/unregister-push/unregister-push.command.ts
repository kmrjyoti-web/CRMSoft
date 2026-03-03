export class UnregisterPushCommand {
  constructor(
    public readonly userId: string,
    public readonly endpoint: string,
  ) {}
}
