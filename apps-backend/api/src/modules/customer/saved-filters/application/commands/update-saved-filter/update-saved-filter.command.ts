export class UpdateSavedFilterCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly data: Partial<{
      name: string;
      description: string;
      filterConfig: Record<string, unknown>;
      isDefault: boolean;
      isShared: boolean;
      sharedWithRoles: string[];
    }>,
  ) {}
}
