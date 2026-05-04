export class UploadDocumentCommand {
  constructor(
    public readonly file: Express.Multer.File,
    public readonly userId: string,
    public readonly category?: string,
    public readonly description?: string,
    public readonly tags?: string[],
    public readonly folderId?: string,
  ) {}
}
