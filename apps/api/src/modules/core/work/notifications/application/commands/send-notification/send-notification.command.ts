export class SendNotificationCommand {
  constructor(
    public readonly templateName: string,
    public readonly recipientId: string,
    public readonly variables: Record<string, string>,
    public readonly senderId?: string,
    public readonly entityType?: string,
    public readonly entityId?: string,
    public readonly priority?: string,
    public readonly groupKey?: string,
    public readonly channelOverrides?: string[],
  ) {}
}
