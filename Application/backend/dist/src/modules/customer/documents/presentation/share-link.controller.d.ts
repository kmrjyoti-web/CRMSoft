import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateShareLinkDto } from './dto/share-link.dto';
import { ShareLinkService } from '../services/share-link.service';
export declare class ShareLinkController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly shareLinkService;
    constructor(commandBus: CommandBus, queryBus: QueryBus, shareLinkService: ShareLinkService);
    create(documentId: string, dto: CreateShareLinkDto, userId: string): Promise<ApiResponse<any>>;
    accessLink(token: string, password?: string): Promise<ApiResponse<any>>;
    getDocumentLinks(documentId: string): Promise<ApiResponse<{
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
    }[]>>;
    revokeLink(linkId: string, userId: string): Promise<ApiResponse<null>>;
}
