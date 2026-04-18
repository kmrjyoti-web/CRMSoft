export class GetScreenshotUploadUrlCommand {
  constructor(
    public readonly tenantId: string,
    public readonly contentType: string,
    public readonly filename: string,
  ) {}
}
