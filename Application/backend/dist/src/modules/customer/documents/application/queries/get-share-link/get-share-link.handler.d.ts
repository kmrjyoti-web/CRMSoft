import { IQueryHandler } from '@nestjs/cqrs';
import { GetShareLinkQuery } from './get-share-link.query';
import { ShareLinkService } from '../../../services/share-link.service';
export declare class GetShareLinkHandler implements IQueryHandler<GetShareLinkQuery> {
    private readonly shareLinkService;
    private readonly logger;
    constructor(shareLinkService: ShareLinkService);
    execute(query: GetShareLinkQuery): Promise<{
        document: any;
        access: import("@prisma/working-client").$Enums.ShareLinkAccess;
    }>;
}
