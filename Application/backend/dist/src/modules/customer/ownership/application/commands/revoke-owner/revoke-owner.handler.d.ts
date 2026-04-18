import { ICommandHandler } from '@nestjs/cqrs';
import { RevokeOwnerCommand } from './revoke-owner.command';
import { OwnershipCoreService } from '../../../services/ownership-core.service';
export declare class RevokeOwnerHandler implements ICommandHandler<RevokeOwnerCommand> {
    private readonly ownershipCore;
    private readonly logger;
    constructor(ownershipCore: OwnershipCoreService);
    execute(command: RevokeOwnerCommand): Promise<{
        success: boolean;
    }>;
}
