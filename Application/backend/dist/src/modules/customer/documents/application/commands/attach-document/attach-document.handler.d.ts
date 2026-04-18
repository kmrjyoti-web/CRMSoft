import { ICommandHandler } from '@nestjs/cqrs';
import { AttachDocumentCommand } from './attach-document.command';
import { AttachmentService } from '../../../services/attachment.service';
import { DocumentActivityService } from '../../../services/document-activity.service';
export declare class AttachDocumentHandler implements ICommandHandler<AttachDocumentCommand> {
    private readonly attachmentService;
    private readonly activityService;
    private readonly logger;
    constructor(attachmentService: AttachmentService, activityService: DocumentActivityService);
    execute(command: AttachDocumentCommand): Promise<{
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
    }>;
}
