import { ConfigService } from '@nestjs/config';
export interface PresignedUploadUrl {
    uploadUrl: string;
    publicUrl: string;
    key: string;
}
export declare class R2StorageService {
    private readonly config;
    private readonly logger;
    private readonly client;
    private readonly bucket;
    private readonly publicBase;
    constructor(config: ConfigService);
    getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds?: number): Promise<PresignedUploadUrl>;
    deleteFile(key: string): Promise<void>;
    buildScreenshotKey(tenantId: string, filename: string): string;
}
