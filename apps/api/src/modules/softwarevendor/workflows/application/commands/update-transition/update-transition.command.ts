export class UpdateTransitionCommand {
  constructor(
    public readonly transitionId: string,
    public readonly data: {
      name?: string;
      triggerType?: string;
      conditions?: Record<string, unknown>;
      actions?: Record<string, unknown>;
      requiredPermission?: string;
      requiredRole?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {}
}
