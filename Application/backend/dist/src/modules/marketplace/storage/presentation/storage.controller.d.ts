import { ApiResponse } from '../../../../common/utils/api-response';
import { R2StorageService } from '../../../../shared/infrastructure/storage/r2-storage.service';
import { PresignedUrlDto } from './dto/presigned-url.dto';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: R2StorageService);
    getPresignedUrl(dto: PresignedUrlDto, tenantId: string): Promise<ApiResponse<{
        url: string;
        key: string;
    }>>;
}
