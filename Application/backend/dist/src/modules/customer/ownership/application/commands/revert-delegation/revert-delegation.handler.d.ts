import { ICommandHandler } from '@nestjs/cqrs';
import { RevertDelegationCommand } from './revert-delegation.command';
import { DelegationService } from '../../../services/delegation.service';
export declare class RevertDelegationHandler implements ICommandHandler<RevertDelegationCommand> {
    private readonly delegation;
    private readonly logger;
    constructor(delegation: DelegationService);
    execute(command: RevertDelegationCommand): Promise<{
        reverted: number;
    }>;
}
