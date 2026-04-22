export class UpdateMenuCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly updates: {
      name?: string;
      nameHi?: string;
      description?: string;
      icon?: string;
      color?: string;
      enabledRoutes?: string[];
      isDefault?: boolean;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {}
}
