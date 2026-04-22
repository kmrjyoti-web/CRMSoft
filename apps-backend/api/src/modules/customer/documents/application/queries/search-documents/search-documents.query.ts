import { DocumentCategory, StorageType } from '@prisma/working-client';

export class SearchDocumentsQuery {
  constructor(
    public readonly query: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly category?: DocumentCategory,
    public readonly storageType?: StorageType,
    public readonly tags?: string[],
    public readonly uploadedById?: string,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
    public readonly mimeType?: string,
    public readonly minSize?: number,
    public readonly maxSize?: number,
  ) {}
}
