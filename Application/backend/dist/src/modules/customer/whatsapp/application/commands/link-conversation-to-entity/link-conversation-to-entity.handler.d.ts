import { ICommandHandler } from '@nestjs/cqrs';
import { LinkConversationToEntityCommand } from './link-conversation-to-entity.command';
import { WaEntityLinkerService } from '../../../services/wa-entity-linker.service';
export declare class LinkConversationToEntityHandler implements ICommandHandler<LinkConversationToEntityCommand> {
    private readonly waEntityLinkerService;
    private readonly logger;
    constructor(waEntityLinkerService: WaEntityLinkerService);
    execute(command: LinkConversationToEntityCommand): Promise<void>;
}
