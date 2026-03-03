import { DocumentCategory, StorageType } from '@prisma/client';

export class GetDocumentListQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly search?: string,
    public readonly category?: DocumentCategory,
    public readonly storageType?: StorageType,
    public readonly folderId?: string,
    public readonly uploadedById?: string,
    public readonly tags?: string[],
  ) {}
}
