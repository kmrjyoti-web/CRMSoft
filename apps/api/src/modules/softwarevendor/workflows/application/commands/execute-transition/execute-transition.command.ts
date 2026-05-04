export class ExecuteTransitionCommand {
  constructor(
    public readonly instanceId: string,
    public readonly transitionCode: string,
    public readonly userId: string,
    public readonly comment?: string,
    public readonly data?: Record<string, any>,
  ) {}
}
