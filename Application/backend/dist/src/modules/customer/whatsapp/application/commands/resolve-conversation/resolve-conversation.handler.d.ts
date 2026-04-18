import { ICommandHandler } from '@nestjs/cqrs';
import { ResolveConversationCommand } from './resolve-conversation.command';
import { WaConversationService } from '../../../services/wa-conversation.service';
export declare class ResolveConversationHandler implements ICommandHandler<ResolveConversationCommand> {
    private readonly waConversationService;
    private readonly logger;
    constructor(waConversationService: WaConversationService);
    execute(command: ResolveConversationCommand): Promise<void>;
}
