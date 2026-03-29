export class UpdateTransitionCommand {
  constructor(
    public readonly transitionId: string,
    public readonly data: {
      name?: string;
      triggerType?: string;
      conditions?: any;
      actions?: any;
      requiredPermission?: string;
      requiredRole?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {}
}
