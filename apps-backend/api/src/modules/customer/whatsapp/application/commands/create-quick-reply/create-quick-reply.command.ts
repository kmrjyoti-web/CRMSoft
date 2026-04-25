export class CreateQuickReplyCommand {
  constructor(
    public readonly wabaId: string,
    public readonly shortcut: string,
    public readonly message: string,
    public readonly userId: string,
    public readonly category?: string,
  ) {}
}
