export class UpdateTemplateCommand {
  constructor(
    public readonly templateId: string,
    public readonly name?: string,
    public readonly bodyText?: string,
    public readonly footerText?: string,
    public readonly buttons?: any,
  ) {}
}
