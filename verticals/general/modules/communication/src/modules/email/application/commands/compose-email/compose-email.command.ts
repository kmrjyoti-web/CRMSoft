export class ComposeEmailCommand {
  constructor(
    public readonly accountId: string,
    public readonly userId: string,
    public readonly to: { email: string; name?: string }[],
    public readonly subject: string,
    public readonly bodyHtml: string,
    public readonly cc?: { email: string; name?: string }[],
    public readonly bcc?: { email: string; name?: string }[],
    public readonly bodyText?: string,
    public readonly replyToEmailId?: string,
    public readonly templateId?: string,
    public readonly templateData?: Record<string, any>,
    public readonly signatureId?: string,
    public readonly scheduledAt?: Date,
    public readonly sendNow?: boolean,
    public readonly entityType?: string,
    public readonly entityId?: string,
    public readonly priority?: string,
    public readonly trackOpens?: boolean,
    public readonly trackClicks?: boolean,
  ) {}
}
