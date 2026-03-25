import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { R2StorageService } from '../../../infrastructure/services/r2-storage.service';
import { GetScreenshotUploadUrlCommand } from './get-screenshot-upload-url.command';

@CommandHandler(GetScreenshotUploadUrlCommand)
export class GetScreenshotUploadUrlHandler implements ICommandHandler<GetScreenshotUploadUrlCommand> {
  constructor(private readonly r2: R2StorageService) {}

  async execute(cmd: GetScreenshotUploadUrlCommand) {
    const { tenantId, contentType, filename } = cmd;
    const key = this.r2.buildScreenshotKey(tenantId, filename);
    return this.r2.getPresignedUploadUrl(key, contentType);
  }
}
