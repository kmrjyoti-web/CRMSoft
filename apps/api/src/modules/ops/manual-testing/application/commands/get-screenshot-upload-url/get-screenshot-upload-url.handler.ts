import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { R2StorageService } from '../../../infrastructure/services/r2-storage.service';
import { GetScreenshotUploadUrlCommand } from './get-screenshot-upload-url.command';

@CommandHandler(GetScreenshotUploadUrlCommand)
export class GetScreenshotUploadUrlHandler implements ICommandHandler<GetScreenshotUploadUrlCommand> {
    private readonly logger = new Logger(GetScreenshotUploadUrlHandler.name);

  constructor(private readonly r2: R2StorageService) {}

  async execute(cmd: GetScreenshotUploadUrlCommand) {
    try {
      const { tenantId, contentType, filename } = cmd;
      const key = this.r2.buildScreenshotKey(tenantId, filename);
      return this.r2.getPresignedUploadUrl(key, contentType);
    } catch (error) {
      this.logger.error(`GetScreenshotUploadUrlHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
