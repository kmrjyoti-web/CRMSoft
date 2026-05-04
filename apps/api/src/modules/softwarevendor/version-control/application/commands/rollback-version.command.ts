export class RollbackVersionCommand {
  constructor(
    public readonly versionId: string,
    public readonly rolledBackBy: string,
    public readonly rollbackReason: string,
  ) {}
}
