import { ICommandHandler } from '@nestjs/cqrs';
import { ReopenConversationCommand } from './reopen-conversation.command';
import { WaConversationService } from '../../../services/wa-conversation.service';
export declare class ReopenConversationHandler implements ICommandHandler<ReopenConversationCommand> {
    private readonly waConversationService;
    private readonly logger;
    constructor(waConversationService: WaConversationService);
    execute(command: ReopenConversationCommand): Promise<void>;
}
