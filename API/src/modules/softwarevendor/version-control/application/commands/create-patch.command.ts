export class CreatePatchCommand {
  constructor(
    public readonly versionId: string,
    public readonly industryCode: string,
    public readonly patchName: string,
    public readonly description: string | undefined,
    public readonly schemaChanges: any,
    public readonly configOverrides: any,
    public readonly menuOverrides: any,
    public readonly forceUpdate: boolean,
    public readonly createdBy: string,
  ) {}
}
