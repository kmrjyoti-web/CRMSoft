import { IQueryHandler } from '@nestjs/cqrs';
import { GetDocumentActivityQuery } from './get-document-activity.query';
import { DocumentActivityService } from '../../../services/document-activity.service';
export declare class GetDocumentActivityHandler implements IQueryHandler<GetDocumentActivityQuery> {
    private readonly activityService;
    private readonly logger;
    constructor(activityService: DocumentActivityService);
    execute(query: GetDocumentActivityQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            action: string;
            userId: string;
            details: import("@prisma/working-client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            documentId: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
