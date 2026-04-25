import { ConfigService } from '@nestjs/config';
export declare class R2StorageService {
    private readonly config;
    private readonly s3;
    private readonly bucket;
    private readonly publicUrl;
    constructor(config: ConfigService);
    upload(params: {
        key: string;
        body: Buffer;
        contentType: string;
        metadata?: Record<string, string>;
    }): Promise<string>;
    getPresignedUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;
    delete(key: string): Promise<void>;
    generateKey(type: 'listing' | 'post' | 'review' | 'offer', entityId: string, filename: string): string;
}
//# sourceMappingURL=r2-storage.service.d.ts.map