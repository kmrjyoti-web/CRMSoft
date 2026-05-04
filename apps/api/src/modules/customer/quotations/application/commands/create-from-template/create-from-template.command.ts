export class CreateFromTemplateCommand {
  constructor(
    public readonly templateId: string,
    public readonly leadId: string,
    public readonly userId: string,
    public readonly userName: string,
  ) {}
}
