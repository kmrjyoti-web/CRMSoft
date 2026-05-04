export class AddTransitionCommand {
  constructor(
    public readonly workflowId: string,
    public readonly fromStateId: string,
    public readonly toStateId: string,
    public readonly name: string,
    public readonly code: string,
    public readonly triggerType?: string,
    public readonly conditions?: Record<string, unknown>,
    public readonly actions?: Record<string, unknown>,
    public readonly requiredPermission?: string,
    public readonly requiredRole?: string,
    public readonly sortOrder?: number,
  ) {}
}
