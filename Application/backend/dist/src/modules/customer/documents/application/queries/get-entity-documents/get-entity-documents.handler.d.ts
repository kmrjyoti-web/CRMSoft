import { IQueryHandler } from '@nestjs/cqrs';
import { GetEntityDocumentsQuery } from './get-entity-documents.query';
import { AttachmentService } from '../../../services/attachment.service';
export declare class GetEntityDocumentsHandler implements IQueryHandler<GetEntityDocumentsQuery> {
    private readonly attachmentService;
    private readonly logger;
    constructor(attachmentService: AttachmentService);
    execute(query: GetEntityDocumentsQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            entityType: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            entityId: string;
            documentId: string;
            attachedById: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
