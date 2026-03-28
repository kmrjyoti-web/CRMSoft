export class CreateVersionCommand {
  constructor(
    public readonly version: string,
    public readonly releaseType: string,
    public readonly changelog: any[],
    public readonly breakingChanges: any[],
    public readonly migrationNotes: string | undefined,
    public readonly codeName: string | undefined,
    public readonly gitBranch: string | undefined,
    public readonly createdBy: string,
  ) {}
}
