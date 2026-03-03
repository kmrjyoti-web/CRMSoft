export class CreateTemplateCommand {
  constructor(
    public readonly name: string,
    public readonly category: string,
    public readonly subject: string,
    public readonly body: string,
    public readonly channels?: string[],
    public readonly variables?: string[],
  ) {}
}
