export class RollbackTransitionCommand {
  constructor(
    public readonly instanceId: string,
    public readonly userId: string,
    public readonly comment?: string,
  ) {}
}
