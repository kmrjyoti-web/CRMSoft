import { ICommandHandler } from '@nestjs/cqrs';
import { DetachDocumentCommand } from './detach-document.command';
import { AttachmentService } from '../../../services/attachment.service';
import { DocumentActivityService } from '../../../services/document-activity.service';
export declare class DetachDocumentHandler implements ICommandHandler<DetachDocumentCommand> {
    private readonly attachmentService;
    private readonly activityService;
    private readonly logger;
    constructor(attachmentService: AttachmentService, activityService: DocumentActivityService);
    execute(command: DetachDocumentCommand): Promise<{
        success: boolean;
    }>;
}
