export class CreateTemplateCommand {
  constructor(
    public readonly wabaId: string,
    public readonly name: string,
    public readonly language: string,
    public readonly category: string,
    public readonly headerType?: string,
    public readonly headerContent?: string,
    public readonly bodyText: string = '',
    public readonly footerText?: string,
    public readonly buttons?: any,
    public readonly variables?: any,
    public readonly sampleValues?: any,
  ) {}
}
