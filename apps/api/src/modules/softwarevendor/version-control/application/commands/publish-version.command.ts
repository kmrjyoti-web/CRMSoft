export class PublishVersionCommand {
  constructor(
    public readonly versionId: string,
    public readonly publishedBy: string,
    public readonly gitTag: string | undefined,
    public readonly gitCommitHash: string | undefined,
  ) {}
}
