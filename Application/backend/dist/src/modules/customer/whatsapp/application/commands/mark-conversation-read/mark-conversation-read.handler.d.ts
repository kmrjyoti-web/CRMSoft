import { ICommandHandler } from '@nestjs/cqrs';
import { MarkConversationReadCommand } from './mark-conversation-read.command';
import { WaConversationService } from '../../../services/wa-conversation.service';
import { WaApiService } from '../../../services/wa-api.service';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class MarkConversationReadHandler implements ICommandHandler<MarkConversationReadCommand> {
    private readonly prisma;
    private readonly conversationService;
    private readonly waApiService;
    private readonly logger;
    constructor(prisma: PrismaService, conversationService: WaConversationService, waApiService: WaApiService);
    execute(cmd: MarkConversationReadCommand): Promise<void>;
}
