import { IQueryHandler } from '@nestjs/cqrs';
import { GetShareLinkQuery } from './get-share-link.query';
export declare class GetShareLinkHandler implements IQueryHandler<GetShareLinkQuery> {
    private readonly logger;
    execute(query: GetShareLinkQuery): Promise<{
        webUrl: string;
        deepLink: string;
        whatsappText: string;
        copyText: string;
    }>;
}
