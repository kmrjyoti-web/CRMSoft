export class CleanupTestEnvCommand {
  constructor(
    public readonly testEnvId: string,
    public readonly userId: string,
  ) {}
}
