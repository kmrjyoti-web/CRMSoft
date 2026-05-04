export class CommitImportCommand {
  constructor(
    public readonly jobId: string,
    public readonly createdById: string,
  ) {}
}
