export class PreviewTemplateQuery {
  constructor(
    public readonly templateId: string,
    public readonly sampleData?: Record<string, any>,
  ) {}
}
