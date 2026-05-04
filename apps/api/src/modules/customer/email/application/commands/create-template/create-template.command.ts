export class CreateTemplateCommand {
  constructor(
    public readonly name: string,
    public readonly category: string,
    public readonly subject: string,
    public readonly bodyHtml: string,
    public readonly isShared: boolean,
    public readonly userId: string,
    public readonly userName: string,
    public readonly bodyText?: string,
    public readonly variables?: Record<string, unknown>[],
    public readonly description?: string,
  ) {}
}
