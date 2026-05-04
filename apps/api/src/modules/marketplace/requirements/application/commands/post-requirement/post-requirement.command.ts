export class PostRequirementCommand {
  constructor(
    public readonly tenantId: string,
    public readonly authorId: string,
    public readonly title: string,
    public readonly description?: string,
    public readonly categoryId?: string,
    public readonly quantity?: number,
    public readonly targetPrice?: number,
    public readonly currency?: string,
    public readonly deadline?: Date,
    public readonly mediaUrls?: string[],
    public readonly attributes?: Record<string, any>,
    public readonly keywords?: string[],
  ) {}
}
