export class ReplyEmailCommand {
  constructor(
    public readonly originalEmailId: string,
    public readonly userId: string,
    public readonly replyType: 'REPLY' | 'REPLY_ALL' | 'FORWARD',
    public readonly bodyHtml: string,
    public readonly to?: { email: string; name?: string }[],
    public readonly bodyText?: string,
  ) {}
}
