import { DocumentCategory, StorageType } from '@prisma/working-client';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class DocumentQueryDto extends PaginationDto {
    category?: DocumentCategory;
    storageType?: StorageType;
    folderId?: string;
    uploadedById?: string;
    tags?: string[];
}
