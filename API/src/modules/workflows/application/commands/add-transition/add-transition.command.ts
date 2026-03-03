export class AddTransitionCommand {
  constructor(
    public readonly workflowId: string,
    public readonly fromStateId: string,
    public readonly toStateId: string,
    public readonly name: string,
    public readonly code: string,
    public readonly triggerType?: string,
    public readonly conditions?: any,
    public readonly actions?: any,
    public readonly requiredPermission?: string,
    public readonly requiredRole?: string,
    public readonly sortOrder?: number,
  ) {}
}
