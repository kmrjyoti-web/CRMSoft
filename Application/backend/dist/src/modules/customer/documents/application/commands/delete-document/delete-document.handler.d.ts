import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteDocumentCommand } from './delete-document.command';
import { DocumentService } from '../../../services/document.service';
import { DocumentActivityService } from '../../../services/document-activity.service';
export declare class DeleteDocumentHandler implements ICommandHandler<DeleteDocumentCommand> {
    private readonly documentService;
    private readonly activityService;
    private readonly logger;
    constructor(documentService: DocumentService, activityService: DocumentActivityService);
    execute(command: DeleteDocumentCommand): Promise<{
        success: boolean;
    }>;
}
