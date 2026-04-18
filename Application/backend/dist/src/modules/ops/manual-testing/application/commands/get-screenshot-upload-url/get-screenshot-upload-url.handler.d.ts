import { ICommandHandler } from '@nestjs/cqrs';
import { R2StorageService } from '../../../infrastructure/services/r2-storage.service';
import { GetScreenshotUploadUrlCommand } from './get-screenshot-upload-url.command';
export declare class GetScreenshotUploadUrlHandler implements ICommandHandler<GetScreenshotUploadUrlCommand> {
    private readonly r2;
    private readonly logger;
    constructor(r2: R2StorageService);
    execute(cmd: GetScreenshotUploadUrlCommand): Promise<import("../../../infrastructure/services/r2-storage.service").PresignedUploadUrl>;
}
