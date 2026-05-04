export class UploadVersionCommand {
  constructor(
    public readonly parentDocumentId: string,
    public readonly file: Express.Multer.File,
    public readonly userId: string,
  ) {}
}
