export class AiGenerateQuotationCommand {
  constructor(
    public readonly leadId: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly answers?: Record<string, any>,
    public readonly templateId?: string,
  ) {}
}
