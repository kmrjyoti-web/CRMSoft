export class CreateSavedFilterCommand {
  constructor(
    public readonly name: string,
    public readonly entityType: string,
    public readonly filterConfig: Record<string, unknown>,
    public readonly createdById: string,
    public readonly description?: string,
    public readonly isDefault?: boolean,
    public readonly isShared?: boolean,
    public readonly sharedWithRoles?: string[],
  ) {}
}
