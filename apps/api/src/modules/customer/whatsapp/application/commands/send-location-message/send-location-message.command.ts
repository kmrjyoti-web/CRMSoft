export class SendLocationMessageCommand {
  constructor(
    public readonly wabaId: string,
    public readonly conversationId: string,
    public readonly lat: number,
    public readonly lng: number,
    public readonly name: string | undefined,
    public readonly address: string | undefined,
    public readonly userId: string,
  ) {}
}
