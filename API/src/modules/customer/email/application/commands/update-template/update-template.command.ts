export class UpdateTemplateCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly category?: string,
    public readonly subject?: string,
    public readonly bodyHtml?: string,
    public readonly bodyText?: string,
    public readonly variables?: any[],
    public readonly description?: string,
    public readonly isShared?: boolean,
  ) {}
}
