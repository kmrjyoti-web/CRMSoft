import { ICommandHandler } from '@nestjs/cqrs';
import { RevokeShareLinkCommand } from './revoke-share-link.command';
import { ShareLinkService } from '../../../services/share-link.service';
export declare class RevokeShareLinkHandler implements ICommandHandler<RevokeShareLinkCommand> {
    private readonly shareLinkService;
    private readonly logger;
    constructor(shareLinkService: ShareLinkService);
    execute(command: RevokeShareLinkCommand): Promise<{
        success: boolean;
    }>;
}
