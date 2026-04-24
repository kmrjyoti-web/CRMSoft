export class UploadFileCommand {
  constructor(
    public readonly fileName: string,
    public readonly fileType: string,
    public readonly fileSize: number,
    public readonly buffer: Buffer,
    public readonly targetEntity: string,
    public readonly createdById: string,
    public readonly createdByName: string,
  ) {}
}
