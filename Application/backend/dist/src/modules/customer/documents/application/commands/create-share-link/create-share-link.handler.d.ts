import { ICommandHandler } from '@nestjs/cqrs';
import { CreateShareLinkCommand } from './create-share-link.command';
import { ShareLinkService } from '../../../services/share-link.service';
import { DocumentActivityService } from '../../../services/document-activity.service';
export declare class CreateShareLinkHandler implements ICommandHandler<CreateShareLinkCommand> {
    private readonly shareLinkService;
    private readonly activityService;
    private readonly logger;
    constructor(shareLinkService: ShareLinkService, activityService: DocumentActivityService);
    execute(command: CreateShareLinkCommand): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        password: string | null;
        expiresAt: Date | null;
        token: string;
        viewCount: number;
        documentId: string;
        access: import("@prisma/working-client").$Enums.ShareLinkAccess;
        maxViews: number | null;
    }>;
}
