import { DocumentCategory, StorageType } from '@prisma/working-client';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class SearchDocumentsDto extends PaginationDto {
    query?: string;
    category?: DocumentCategory;
    storageType?: StorageType;
    tags?: string[];
    uploadedById?: string;
    dateFrom?: string;
    dateTo?: string;
    mimeType?: string;
    minSize?: number;
    maxSize?: number;
}
